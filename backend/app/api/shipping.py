from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

router = APIRouter()

_store: List[Dict[str, Any]] = [
    {"orderId": "#128", "customer": "Merve Aydın", "provider": "Yurtiçi", "trackingNo": "YT7845123399TR", "destination": "Kadıköy / İstanbul", "status": "Transfer merkezinde bekliyor", "lastEvent": "14:05 - Kartal aktarma", "risk": "Yuksek", "slaHoursLeft": -6, "estimatedDelivery": "2026-05-12", "product": "Meta Quest 3 128GB"},
    {"orderId": "#145", "customer": "Can Erdem", "provider": "Aras", "trackingNo": "AR9981204455", "destination": "Cankaya / Ankara", "status": "Dağıtım bölgesine ulaştı", "lastEvent": "13:40 - Dağıtım aracına yüklendi", "risk": "Orta", "slaHoursLeft": 8, "estimatedDelivery": "2026-05-11", "product": "Garmin Fenix 8"},
    {"orderId": "#151", "customer": "Selin Polat", "provider": "MNG", "trackingNo": "MN5512098871", "destination": "Nilüfer / Bursa", "status": "Gümrük/bölge gecikmesi", "lastEvent": "09:12 - Bölge merkezinde bekliyor", "risk": "Yuksek", "slaHoursLeft": -14, "estimatedDelivery": "2026-05-10", "product": "Apple Vision Pro"},
    {"orderId": "#160", "customer": "Emre Taş", "provider": "PTT", "trackingNo": "PT8844002211", "destination": "Karşıyaka / İzmir", "status": "Teslim edildi", "lastEvent": "16:02 - Teslim alındı", "risk": "Dusuk", "slaHoursLeft": 24, "estimatedDelivery": "2026-05-11", "product": "Samsung Galaxy Watch 7"},
    {"orderId": "#162", "customer": "Ayşe Nur", "provider": "Sürat", "trackingNo": "SR2209981100", "destination": "Beşiktaş / İstanbul", "status": "Dağıtıma çıktı", "lastEvent": "15:30 - Kurye yolda", "risk": "Dusuk", "slaHoursLeft": 3, "estimatedDelivery": "2026-05-11", "product": "Oura Ring Gen 3"},
]

class ShippingUpdate(BaseModel):
    status: Optional[str] = None
    risk: Optional[str] = None

@router.get("/shipping")
async def get_shipping():
    return _store

@router.put("/shipping/{order_id}")
async def update_shipping(order_id: str, req: ShippingUpdate):
    for shipment in _store:
        if shipment["orderId"] == order_id:
            if req.status is not None:
                shipment["status"] = req.status
            if req.risk is not None:
                shipment["risk"] = req.risk
            return {"ok": True, "entry": shipment}
    raise HTTPException(status_code=404, detail="Kargo bulunamadı")
