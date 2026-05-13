from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.db import get_db

router = APIRouter()


class ConversationUpdate(BaseModel):
    status: Optional[str] = None
    aiDraft: Optional[str] = None
    unread: Optional[int] = None


def _map_row(r: dict) -> dict:
    item = dict(r)
    if "updatedAt" in item and hasattr(item["updatedAt"], "isoformat"):
        item["updatedAt"] = item["updatedAt"].isoformat()
    if "updated_at" in item and hasattr(item["updated_at"], "isoformat"):
        item["updated_at"] = item["updated_at"].isoformat()
    return item


@router.get("/conversations")
async def get_conversations():
    db = await get_db()
    rows = await db.query(
        """
        SELECT
            id, customer, channel, topic,
            last_message  AS "lastMessage",
            status, unread, sentiment,
            order_ref     AS "orderRef",
            ai_draft      AS "aiDraft",
            updated_at    AS "updatedAt"
        FROM conversations
        ORDER BY updated_at DESC
        """
    )
    return [_map_row(r) for r in rows]


@router.get("/conversations/{conv_id}")
async def get_conversation(conv_id: str):
    db = await get_db()
    rows = await db.query(
        """
        SELECT
            id, customer, channel, topic,
            last_message  AS "lastMessage",
            status, unread, sentiment,
            order_ref     AS "orderRef",
            ai_draft      AS "aiDraft",
            updated_at    AS "updatedAt"
        FROM conversations
        WHERE id = $1
        """,
        conv_id
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Konusma bulunamadi")
    return _map_row(rows[0])


@router.put("/conversations/{conv_id}")
async def update_conversation(conv_id: str, req: ConversationUpdate):
    db = await get_db()

    existing = await db.query("SELECT id FROM conversations WHERE id = $1", conv_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Konusma bulunamadi")

    updates = []
    params = []
    idx = 1

    if req.status is not None:
        updates.append(f"status = ${idx}")
        params.append(req.status)
        idx += 1
    if req.aiDraft is not None:
        updates.append(f"ai_draft = ${idx}")
        params.append(req.aiDraft)
        idx += 1
    if req.unread is not None:
        updates.append(f"unread = ${idx}")
        params.append(req.unread)
        idx += 1

    if not updates:
        raise HTTPException(status_code=400, detail="Guncellenecek alan yok")

    updates.append("updated_at = now()")
    params.append(conv_id)

    sql = f"""
        UPDATE conversations SET {', '.join(updates)}
        WHERE id = ${idx}
        RETURNING
            id, customer, channel, topic,
            last_message AS "lastMessage",
            status, unread, sentiment,
            order_ref    AS "orderRef",
            ai_draft     AS "aiDraft",
            updated_at   AS "updatedAt"
    """
    row = await db.execute_one(sql, *params)
    if not row:
        raise HTTPException(status_code=500, detail="Guncelleme basarisiz")
    return {"ok": True, "entry": _map_row(row)}
