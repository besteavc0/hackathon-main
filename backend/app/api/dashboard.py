from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter()

_orders = [
    {"id": "ord-1842", "name": "#1842", "customer": "Elif Yılmaz", "city": "İzmir", "totalTry": 18990, "paymentStatus": "Odendi", "fulfillmentStatus": "Kargoda", "itemCount": 1, "channel": "Web", "product": "Meta Quest 3 128GB", "createdAt": "2026-05-11T08:12:00"},
    {"id": "ord-1841", "name": "#1841", "customer": "Mert Kaya", "city": "Ankara", "totalTry": 8490, "paymentStatus": "Odendi", "fulfillmentStatus": "Hazirlaniyor", "itemCount": 2, "channel": "WhatsApp", "product": "Samsung Galaxy Ring + Kılıf", "createdAt": "2026-05-11T07:55:00"},
    {"id": "ord-1840", "name": "#1840", "customer": "Deniz Arslan", "city": "İstanbul", "totalTry": 52900, "paymentStatus": "Odendi", "fulfillmentStatus": "Gecikme", "itemCount": 1, "channel": "Web", "product": "Apple Vision Pro", "createdAt": "2026-05-10T21:40:00"},
    {"id": "ord-1839", "name": "#1839", "customer": "Burak Çelik", "city": "Bursa", "totalTry": 4290, "paymentStatus": "Beklemede", "fulfillmentStatus": "Hazirlaniyor", "itemCount": 1, "channel": "Fiziksel", "product": "Garmin Fenix 8", "createdAt": "2026-05-10T18:05:00"},
]

_activity = [
    {"time": "14:22", "text": "AI #128 Meta Quest kargosu için WhatsApp taslağı üretti."},
    {"time": "13:58", "text": "Stok alarmı: Samsung Galaxy Ring 3 günlük eşiğe indi."},
    {"time": "13:12", "text": "Kargo webhook: #151 Apple Vision Pro gümrük gecikmesinde."},
    {"time": "12:40", "text": "Slack #kargo kanalına 2 yeni risk özeti gönderildi."},
]

router_api = router

@router.get("/dashboard")
async def get_dashboard():
    from app.api.shipping import _store as shipments
    from app.api.inventory import _store as inventory
    from app.api.tasks import _store as tasks

    risky = len([s for s in shipments if s.get("risk") == "Yuksek"])
    low_stock = len([i for i in inventory if i["stock"] <= i["reorderPoint"] or i["depletionDays"] <= 7])
    open_tasks = len([t for t in tasks if t["status"] == "Acik"])
    total_revenue = sum(o["totalTry"] for o in _orders)

    fulfillment_counts = {"Kargoda": 0, "Hazirlaniyor": 0, "Gecikme": 0, "Teslim": 0}
    for o in _orders:
        key = o["fulfillmentStatus"]
        if key in fulfillment_counts:
            fulfillment_counts[key] += 1
    total_orders = len(_orders) or 1
    fulfillment_mix = [
        {"label": "Kargoda", "pct": round(fulfillment_counts["Kargoda"] / total_orders * 100), "className": "shipped"},
        {"label": "Hazırlanıyor", "pct": round(fulfillment_counts["Hazirlaniyor"] / total_orders * 100), "className": "preparing"},
        {"label": "Gecikme", "pct": round(fulfillment_counts["Gecikme"] / total_orders * 100), "className": "delayed"},
        {"label": "Teslim", "pct": round(fulfillment_counts["Teslim"] / total_orders * 100), "className": "delivered"},
    ]

    return {
        "kpis": {
            "todayOrders": 63,
            "revenueTry": 284750,
            "riskyShipments": risky,
            "lowStockSkus": low_stock,
            "autoResolvedTickets": 51,
            "avgFirstResponseMin": 3.8,
        },
        "recentOrders": _orders,
        "tasks": [t for t in tasks if t["status"] == "Acik"][:5],
        "activityFeed": _activity,
        "fulfillmentMix": fulfillment_mix,
        "aiInsight": f"Son 24 saatte {risky} riskli kargo ve {low_stock} kritik SKU tespit edildi. {open_tasks} açık görev takip ediliyor.",
    }
