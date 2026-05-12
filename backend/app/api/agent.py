from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
import google.generativeai as genai

router = APIRouter()

class AgentRequest(BaseModel):
    prompt: str
    context: Optional[str] = None

@router.post("/agent")
async def generate_agent_response(req: AgentRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    model_name = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
    
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
        
    genai.configure(api_key=api_key)
    
    system_context = f"Bağlam:\n{req.context}\n\n" if req.context else ""
    full_prompt = f"{system_context}{req.prompt}"
    
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(
            full_prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.5,
                max_output_tokens=512,
            )
        )
        return {"result": response.text}
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
