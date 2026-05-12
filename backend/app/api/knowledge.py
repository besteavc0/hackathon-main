from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import time

router = APIRouter()

# In-memory store — mock-data ile uyumlu başlangıç verileri
_store: List[Dict[str, Any]] = [
    {
        "id": "kb-1",
        "title": "Meta Quest 3 Eşleştirme Sorunu - Çözüm Adımları",
        "content": "1. Gözlüğü fabrika ayarlarına döndürün. 2. Meta Quest uygulamasını güncelleyin. 3. Bluetooth'u kapatıp açın. 4. Hala sorun yaşıyorsanız teknik destek alın.",
        "category": "Teknik Destek",
        "addedAt": "2026-05-10T10:00:00",
        "addedBy": "Destek Ekibi"
    },
    {
        "id": "kb-2",
        "title": "Apple Vision Pro İade Politikası",
        "content": "14 gün iade hakkı mevcuttur. Kutusunu açmamış ürünler için tam iade yapılır. Açılmış ürünler için %15 yeniden stoklama ücreti alınır.",
        "category": "İade",
        "addedAt": "2026-05-09T14:30:00",
        "addedBy": "Müşteri Hizmetleri"
    },
    {
        "id": "kb-3",
        "title": "Samsung Galaxy Ring Batarya Optimizasyonu",
        "content": "Halka pilinin ömrünü uzatmak için Samsung Health uygulamasında gece modu aktif edilmeli. Ortalama şarj süresi 80 dakikadır.",
        "category": "Kullanım Kılavuzu",
        "addedAt": "2026-05-08T09:15:00",
        "addedBy": "Teknik Ekip"
    }
]

class KnowledgeEntry(BaseModel):
    title: str
    content: str
    category: Optional[str] = "Genel"
    addedBy: Optional[str] = "API"

@router.get("/knowledge")
async def get_knowledge():
    return _store

@router.post("/knowledge")
async def create_knowledge(req: KnowledgeEntry):
    entry = {
        "id": f"kb-{int(time.time() * 1000)}",
        "title": req.title,
        "content": req.content,
        "category": req.category,
        "addedBy": req.addedBy,
        "addedAt": datetime.utcnow().isoformat()
    }
    _store.insert(0, entry)
    print("[knowledge] Yeni kayıt:", entry)
    return {"ok": True, "entry": entry}

@router.delete("/knowledge")
async def delete_knowledge(id: str = Query(...)):
    global _store
    before = len(_store)
    _store = [e for e in _store if e["id"] != id]
    if len(_store) == before:
        raise HTTPException(status_code=404, detail="Kayıt bulunamadı")
    print("[knowledge] Silindi:", id)
    return {"ok": True, "deleted": id}
