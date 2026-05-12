from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class ShippingRequest(BaseModel):
    orderId: str
    status: Optional[str] = None
    risk: Optional[str] = None

@router.get("/shipping")
async def get_shipping():
    return {
        "message": "Kargo API hazır. DATABASE_URL ve Shopify env değişkenlerini yapılandırın."
    }

@router.post("/shipping")
async def update_shipping(req: ShippingRequest):
    print("[shipping] Güncelleme:", req.dict())
    return {"ok": True, "orderId": req.orderId, "status": req.status, "risk": req.risk}
