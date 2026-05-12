from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import math

router = APIRouter()

_store: List[Dict[str, Any]] = [
    {"sku": "SKU-MQ3-01", "product": "Meta Quest 3 128GB", "category": "VR/AR Gözlük", "stock": 7, "reorderPoint": 15, "weeklyVelocity": 18, "depletionDays": 3, "recommendation": "Acil 20 adet tedarik; kampanya öncesi kritik.", "supplierLeadDays": 7, "unitPrice": 18990},
    {"sku": "SKU-AVP-01", "product": "Apple Vision Pro", "category": "VR/AR Gözlük", "stock": 3, "reorderPoint": 8, "weeklyVelocity": 5, "depletionDays": 4, "recommendation": "5 adet ön sipariş; temin süresi 14 gün.", "supplierLeadDays": 14, "unitPrice": 52900},
    {"sku": "SKU-SGR-01", "product": "Samsung Galaxy Ring", "category": "Giyilebilir", "stock": 12, "reorderPoint": 20, "weeklyVelocity": 28, "depletionDays": 3, "recommendation": "Kampanya öncesi acil 40 adet tedarik.", "supplierLeadDays": 5, "unitPrice": 8490},
    {"sku": "SKU-GF8-01", "product": "Garmin Fenix 8", "category": "Akıllı Saat", "stock": 24, "reorderPoint": 15, "weeklyVelocity": 12, "depletionDays": 14, "recommendation": "Stok sağlıklı; indirim kampanyası için hazır.", "supplierLeadDays": 10, "unitPrice": 22990},
    {"sku": "SKU-OUR-01", "product": "Oura Ring Gen 3", "category": "Giyilebilir", "stock": 9, "reorderPoint": 12, "weeklyVelocity": 10, "depletionDays": 6, "recommendation": "10 adet sipariş; temin süresi 8 gün.", "supplierLeadDays": 8, "unitPrice": 6290},
]

class StockUpdate(BaseModel):
    stock: int

class OrderRequest(BaseModel):
    sku: str
    quantity: Optional[int] = 20

@router.get("/inventory")
async def get_inventory():
    return _store

@router.put("/inventory/{sku}")
async def update_inventory(sku: str, req: StockUpdate):
    for item in _store:
        if item["sku"] == sku:
            item["stock"] = req.stock
            daily = item["weeklyVelocity"] / 7
            item["depletionDays"] = max(1, round(req.stock / daily)) if daily > 0 else 999
            return {"ok": True, "entry": item}
    raise HTTPException(status_code=404, detail="SKU bulunamadı")

@router.post("/inventory/order")
async def order_inventory(req: OrderRequest):
    for item in _store:
        if item["sku"] == req.sku:
            item["stock"] += req.quantity
            daily = item["weeklyVelocity"] / 7
            item["depletionDays"] = max(1, round(item["stock"] / daily)) if daily > 0 else 999
            return {"ok": True, "entry": item}
    raise HTTPException(status_code=404, detail="SKU bulunamadı")
