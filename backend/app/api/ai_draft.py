from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
import google.generativeai as genai

router = APIRouter()

class AIDraftRequest(BaseModel):
    customer: str
    topic: str
    channel: str
    message: str
    orderRef: Optional[str] = None

@router.post("/ai-draft")
async def generate_ai_draft(req: AIDraftRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    model_name = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
    
    if not api_key:
        print("[ai-draft] GEMINI_API_KEY eksik! .env.local dosyasını kontrol edin.")
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY tanımlı değil. .env.local dosyasına ekleyin.")
        
    genai.configure(api_key=api_key)
    
    order_text = f"Sipariş No: {req.orderRef}" if req.orderRef else ""
    prompt = f"""Sen OpsMind AI müşteri destek asistanısın. Türkçe, nazik ve profesyonel bir yanıt taslağı oluştur.

Müşteri: {req.customer}
Kanal: {req.channel}
Konu: {req.topic}
{order_text}
Müşteri mesajı: "{req.message}"

Sadece müşteriye gönderilecek yanıt metnini yaz. Selamlama ile başla, özür veya çözüm sun, kapanış cümlesi ekle. Kısa ve öz tut (3-5 cümle)."""
    
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.7,
                max_output_tokens=256,
            )
        )
        return {"draft": response.text}
    except Exception as e:
        err = str(e)
        print("[ai-draft] Fetch hatası:", err)
        if "429" in err or "quota" in err.lower():
            raise HTTPException(status_code=429, detail="Gemini API kota limiti aşıldı. Lütfen birkaç dakika sonra tekrar deneyin.")
        raise HTTPException(status_code=500, detail=err)
