from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import time

router = APIRouter()

_store: List[Dict[str, Any]] = [
    {"id": "task-1", "title": "#128 müşterisine proaktif gecikme mesajı", "owner": "Destek", "due": "Bugün 17:00", "reason": "SLA -6 saat, risk Yüksek.", "status": "Acik"},
    {"id": "task-2", "title": "Samsung Galaxy Ring acil tedarik siparişi", "owner": "Satın Alma", "due": "Yarın 10:00", "reason": "3 günde kritik stok.", "status": "Acik"},
    {"id": "task-3", "title": "#145 kargo eskalasyon takibi", "owner": "Operasyon", "due": "Bugün 18:30", "reason": "Müşteri olumsuz sentiment.", "status": "Acik"},
]

class TaskCreate(BaseModel):
    title: str
    owner: str
    due: str
    reason: Optional[str] = ""

class TaskUpdate(BaseModel):
    status: Optional[str] = None
    title: Optional[str] = None
    owner: Optional[str] = None
    due: Optional[str] = None
    reason: Optional[str] = None

@router.get("/tasks")
async def get_tasks():
    return _store

@router.post("/tasks")
async def create_task(req: TaskCreate):
    entry = {
        "id": f"task-{int(time.time() * 1000)}",
        "title": req.title,
        "owner": req.owner,
        "due": req.due,
        "reason": req.reason or "",
        "status": "Acik",
    }
    _store.append(entry)
    return {"ok": True, "entry": entry}

@router.put("/tasks/{task_id}")
async def update_task(task_id: str, req: TaskUpdate):
    for task in _store:
        if task["id"] == task_id:
            if req.status is not None:
                task["status"] = req.status
            if req.title is not None:
                task["title"] = req.title
            if req.owner is not None:
                task["owner"] = req.owner
            if req.due is not None:
                task["due"] = req.due
            if req.reason is not None:
                task["reason"] = req.reason
            return {"ok": True, "entry": task}
    raise HTTPException(status_code=404, detail="Görev bulunamadı")

@router.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    global _store
    before = len(_store)
    _store = [t for t in _store if t["id"] != task_id]
    if len(_store) == before:
        raise HTTPException(status_code=404, detail="Görev bulunamadı")
    return {"ok": True, "deleted": task_id}
