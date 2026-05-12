from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import time

router = APIRouter()

_store: List[Dict[str, Any]] = [
    {"id": "u1", "name": "Ahmet Demir", "email": "ahmet@opsmind.com", "role": "Admin", "department": "Yönetim", "active": True},
    {"id": "u2", "name": "Selin Kaya", "email": "selin@opsmind.com", "role": "Operasyon", "department": "Kargo & Lojistik", "active": True},
    {"id": "u3", "name": "Barış Arslan", "email": "baris@opsmind.com", "role": "Destek", "department": "Müşteri Hizmetleri", "active": True},
    {"id": "u4", "name": "Nil Polat", "email": "nil@opsmind.com", "role": "Satın Alma", "department": "Tedarik Zinciri", "active": False},
]

class UserCreate(BaseModel):
    name: str
    email: str
    role: Optional[str] = "Destek"
    department: Optional[str] = ""

class UserUpdate(BaseModel):
    role: Optional[str] = None
    active: Optional[bool] = None
    department: Optional[str] = None

@router.get("/users")
async def get_users():
    return _store

@router.post("/users")
async def create_user(req: UserCreate):
    entry = {
        "id": f"u{int(time.time() * 1000)}",
        "name": req.name,
        "email": req.email,
        "role": req.role,
        "department": req.department,
        "active": True,
    }
    _store.append(entry)
    return {"ok": True, "entry": entry}

@router.put("/users/{user_id}")
async def update_user(user_id: str, req: UserUpdate):
    for user in _store:
        if user["id"] == user_id:
            if req.role is not None:
                user["role"] = req.role
            if req.active is not None:
                user["active"] = req.active
            if req.department is not None:
                user["department"] = req.department
            return {"ok": True, "entry": user}
    raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
