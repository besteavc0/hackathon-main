from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

router = APIRouter()

_store: List[Dict[str, Any]] = [
    {"key": "cargo_high", "label": "Yüksek riskli kargo uyarısı", "target": "WhatsApp", "enabled": True},
    {"key": "stock_low", "label": "Stok eşik altı bildirimi", "target": "Slack", "enabled": True},
    {"key": "ai_draft", "label": "AI taslağı hazır olduğunda", "target": "E-posta", "enabled": True},
    {"key": "daily_summary", "label": "Günlük operasyon özeti", "target": "Slack", "enabled": True},
    {"key": "sentiment_neg", "label": "Müşteri olumsuz sentiment alarmı", "target": "WhatsApp", "enabled": True},
]

class NotificationUpdate(BaseModel):
    key: str
    enabled: Optional[bool] = None
    target: Optional[str] = None

class NotificationBulkUpdate(BaseModel):
    items: List[NotificationUpdate]

@router.get("/notifications")
async def get_notifications():
    return _store

@router.put("/notifications")
async def update_notifications(req: NotificationBulkUpdate):
    for update in req.items:
        for item in _store:
            if item["key"] == update.key:
                if update.enabled is not None:
                    item["enabled"] = update.enabled
                if update.target is not None:
                    item["target"] = update.target
                break
    return {"ok": True, "items": _store}
