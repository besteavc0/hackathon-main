from fastapi import APIRouter
from app.db import get_db

router = APIRouter()


@router.get("/dashboard")
async def get_dashboard():
    db = await get_db()

    # KPI'lar
    kpi_row = await db.query(
        """
        SELECT
            COUNT(*)                                          AS today_orders,
            COALESCE(SUM(total_try), 0)                       AS revenue_try,
            COUNT(*) FILTER (WHERE fulfillment_status != 'Teslim') AS active_orders
        FROM orders
        """
    )

    kpi = kpi_row[0] if kpi_row else {}
    today_orders = int(kpi.get("today_orders") or 0)
    revenue_try = float(kpi.get("revenue_try") or 0)

    # Riskli kargo sayisi
    risky_rows = await db.query(
        "SELECT COUNT(*) AS cnt FROM shipments WHERE risk = 'Yuksek'"
    )
    risky_shipments = int(risky_rows[0]["cnt"]) if risky_rows else 0

    # Kritik SKU sayisi (stok esik altinda veya 7 gunde tukeniyor)
    low_stock_rows = await db.query(
        "SELECT COUNT(*) AS cnt FROM inventory WHERE stock <= reorder_point OR depletion_days <= 7"
    )
    low_stock_skus = int(low_stock_rows[0]["cnt"]) if low_stock_rows else 0

    # Cozulmus konusma sayisi
    resolved_rows = await db.query(
        "SELECT COUNT(*) AS cnt FROM conversations WHERE status = 'Cozuldu'"
    )
    auto_resolved = int(resolved_rows[0]["cnt"]) if resolved_rows else 0

    # Son siparisler
    order_rows = await db.query(
        """
        SELECT
            id, name, customer, city,
            total_try          AS "totalTry",
            payment_status     AS "paymentStatus",
            fulfillment_status AS "fulfillmentStatus",
            item_count         AS "itemCount",
            channel, product,
            created_at         AS "createdAt"
        FROM orders
        ORDER BY created_at DESC
        LIMIT 10
        """
    )
    recent_orders = []
    for r in order_rows:
        item = dict(r)
        if "totalTry" in item:
            item["totalTry"] = float(item["totalTry"])
        if "createdAt" in item and hasattr(item["createdAt"], "isoformat"):
            item["createdAt"] = item["createdAt"].isoformat()
        recent_orders.append(item)

    # Acik gorevler
    task_rows = await db.query(
        """
        SELECT id, title, owner, due, reason, status
        FROM tasks
        WHERE status = 'Acik'
        ORDER BY created_at ASC
        LIMIT 5
        """
    )

    # Aktivite logu
    activity_rows = await db.query(
        """
        SELECT
            to_char(event_time AT TIME ZONE 'Europe/Istanbul', 'HH24:MI') AS time,
            text
        FROM activity_log
        ORDER BY event_time DESC
        LIMIT 10
        """
    )

    # Fulfillment dagilimi
    ff_rows = await db.query(
        """
        SELECT fulfillment_status, COUNT(*) AS cnt
        FROM orders
        GROUP BY fulfillment_status
        """
    )
    ff_map = {r["fulfillment_status"]: int(r["cnt"]) for r in ff_rows}
    total_ff = sum(ff_map.values()) or 1
    fulfillment_mix = [
        {"label": "Kargoda",      "pct": round(ff_map.get("Kargoda", 0) / total_ff * 100),      "className": "shipped"},
        {"label": "Hazirlanıyor", "pct": round(ff_map.get("Hazirlaniyor", 0) / total_ff * 100),  "className": "preparing"},
        {"label": "Gecikme",      "pct": round(ff_map.get("Gecikme", 0) / total_ff * 100),       "className": "delayed"},
        {"label": "Teslim",       "pct": round(ff_map.get("Teslim", 0) / total_ff * 100),        "className": "delivered"},
    ]

    open_task_count = len([r for r in task_rows])

    return {
        "kpis": {
            "todayOrders": today_orders,
            "revenueTry": revenue_try,
            "riskyShipments": risky_shipments,
            "lowStockSkus": low_stock_skus,
            "autoResolvedTickets": auto_resolved,
            "avgFirstResponseMin": 3.8,
        },
        "recentOrders": recent_orders,
        "tasks": [dict(r) for r in task_rows],
        "activityFeed": [dict(r) for r in activity_rows],
        "fulfillmentMix": fulfillment_mix,
        "aiInsight": (
            f"Son 24 saatte {risky_shipments} riskli kargo ve "
            f"{low_stock_skus} kritik SKU tespit edildi. "
            f"{open_task_count} acik gorev takip ediliyor."
        ),
    }
