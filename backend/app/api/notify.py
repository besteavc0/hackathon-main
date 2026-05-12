from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, List
import os
import httpx

router = APIRouter()

class NotifyRequest(BaseModel):
    slackText: Optional[str] = None
    wpText: Optional[str] = None

@router.post("/notify")
async def notify(req: NotifyRequest):
    slack_webhook_url = os.getenv("SLACK_NOTIFY_WEBHOOK_URL")
    wp_token = os.getenv("WHATSAPP_ACCESS_TOKEN")
    wp_phone_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
    wp_notify_number = os.getenv("WHATSAPP_NOTIFY_NUMBER")

    results: Dict[str, str] = {}
    errors: List[str] = []

    async with httpx.AsyncClient() as client:
        # Slack
        if req.slackText:
            if slack_webhook_url:
                try:
                    res = await client.post(slack_webhook_url, json={"text": req.slackText})
                    if res.status_code == 200:
                        results["slack"] = "ok"
                    else:
                        print("[notify] Slack hatası:", res.status_code, res.text)
                        results["slack"] = f"error:{res.status_code}"
                        errors.append("slack")
                except Exception as e:
                    print("[notify] Slack fetch hatası:", str(e))
                    results["slack"] = "error:network"
                    errors.append("slack")
            else:
                print(f"[notify] Slack simülasyonu (webhook yok): {req.slackText[:80]}...")
                results["slack"] = "ok"

        # WhatsApp
        if req.wpText:
            if wp_token and wp_phone_id and wp_notify_number:
                try:
                    res = await client.post(
                        f"https://graph.facebook.com/v18.0/{wp_phone_id}/messages",
                        headers={"Authorization": f"Bearer {wp_token}"},
                        json={
                            "messaging_product": "whatsapp",
                            "to": wp_notify_number,
                            "type": "text",
                            "text": {"body": req.wpText},
                        }
                    )
                    if res.status_code == 200:
                        results["whatsapp"] = "ok"
                    else:
                        print("[notify] WhatsApp hatası:", res.status_code, res.text)
                        results["whatsapp"] = f"error:{res.status_code}"
                        errors.append("whatsapp")
                except Exception as e:
                    print("[notify] WhatsApp fetch hatası:", str(e))
                    results["whatsapp"] = "error:network"
                    errors.append("whatsapp")
            else:
                print(f"[notify] WhatsApp simülasyonu (token yok): {req.wpText[:80]}...")
                results["whatsapp"] = "ok"

    if errors:
        return {"ok": False, "results": results, "errors": errors}

    return {"ok": True, "results": results}
