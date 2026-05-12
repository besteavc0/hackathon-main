from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import httpx

router = APIRouter()

class WebhookRequest(BaseModel):
    text: str

@router.post("/supply-webhook")
async def supply_webhook(req: WebhookRequest):
    slack_webhook_url = os.getenv("SLACK_SUPPLY_WEBHOOK_URL") or os.getenv("SLACK_NOTIFY_WEBHOOK_URL")

    if slack_webhook_url:
        try:
            async with httpx.AsyncClient() as client:
                res = await client.post(slack_webhook_url, json={"text": req.text})
                if res.status_code != 200:
                    raise HTTPException(status_code=502, detail=res.text or "Slack webhook hatası")
            return {"ok": True}
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        print(f"[supply-webhook] Slack simülasyonu (webhook yok): {req.text[:100]}...")
        return {"ok": True}
