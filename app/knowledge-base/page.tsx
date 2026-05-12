"use client";
import { useState, useEffect } from "react";
import { PageShell } from "@/components/page-shell";
import { KnowledgeEntry } from "@/lib/mock-data";

type Toast = { msg: string; type: "success" | "error" } | null;

export default function KnowledgeBasePage() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("Tumu");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<Toast>(null);
  const [form, setForm] = useState({ title: "", content: "", category: "Teknik Destek" });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState<string>("");

  useEffect(() => {
    fetch("/api/knowledge")
      .then(res => res.json())
      .then((data: KnowledgeEntry[]) => {
        setEntries(data);
        if (data.length > 0) setSelectedEntryId(data[0].id);
      })
      .catch(() => showToast("Veriler yüklenemedi.", "error"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = ["Tumu", ...Array.from(new Set(entries.map(e => e.category)))];
  const filtered = entries.filter(e =>
    (filter === "Tumu" || e.category === filter) &&
    (e.title.toLowerCase().includes(search.toLowerCase()) ||
     e.content.toLowerCase().includes(search.toLowerCase()))
  );
  const selectedEntry =
    filtered.find(e => e.id === selectedEntryId) ??
    filtered[0] ??
    entries[0];

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      showToast("Başlık ve içerik zorunludur.", "error");
      return;
    }
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          category: form.category,
          addedBy: "Oturum Kullanıcısı"
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? "Hata");
      const newEntry: KnowledgeEntry = data.entry;
      setEntries(prev => [newEntry, ...prev]);
      setSelectedEntryId(newEntry.id);
      setShowModal(false);
      setForm({ title: "", content: "", category: "Teknik Destek" });
      showToast("Bilgi tabanına eklendi.");
    } catch (err) {
      showToast("Kayıt eklenemedi: " + String(err), "error");
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/knowledge?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Silinemedi");
      setEntries(prev => prev.filter(e => e.id !== id));
      if (selectedEntryId === id) {
        const next = entries.find(e => e.id !== id);
        if (next) setSelectedEntryId(next.id);
      }
      showToast("Kayıt silindi.");
    } catch {
      showToast("Kayıt silinemedi.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PageShell
      title="Bilgi Tabanı"
      subtitle="AI yanıt kaynağı; sık sorulan sorular, teknik kılavuzlar ve operasyon prosedürleri."
      badge={`${entries.length} kayıt`}
      rightPanel={
        <div className="context-stack">
          <div className="context-card context-card--warm">
            <p className="context-kicker">Kayıt önizleme</p>
            <h3 className="context-title">{selectedEntry?.title ?? "Kayıt seçilmedi"}</h3>
            {selectedEntry && (
              <p className="muted" style={{ margin: "10px 0 0" }}>
                {selectedEntry.content.slice(0, 170)}{selectedEntry.content.length > 170 ? "..." : ""}
              </p>
            )}
          </div>
          <div className="context-card">
            <p className="context-kicker">Önerilen güncelleme</p>
            <div className="context-list">
              <span className="pill info">Kategori etiketlerini kontrol et</span>
              <span className="pill mid">AI yanıt kaynaklarını güncel tut</span>
              <span className="pill low">{filtered.length} sonuç görüntüleniyor</span>
            </div>
          </div>
          <div className="context-card">
            <p className="context-kicker">Hızlı aksiyon</p>
            <div className="context-actions">
              <button type="button" className="button sm" onClick={() => setShowModal(true)}>
                Yeni Kayıt Ekle
              </button>
            </div>
          </div>
        </div>
      }
    >
      <div className="toolbar toolbar--split">
        <div className="toolbar" style={{ flex: 1 }}>
          <input
            className="form-input"
            style={{ maxWidth: 300 }}
            placeholder="Başlık veya içerik ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="segmented" aria-label="Kategori filtresi">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                className={`button sm ${filter === cat ? "is-active" : ""}`}
                onClick={() => setFilter(cat)}
              >
                {cat === "Tumu" ? "Tümü" : cat}
              </button>
            ))}
          </div>
        </div>
        <button type="button" className="button" onClick={() => setShowModal(true)}>
          Yeni Kayıt Ekle
        </button>
      </div>

      {filtered.length === 0 && (
        <div className="card empty-state">
          <p className="muted">Kayıt bulunamadı.</p>
          <button type="button" className="button" onClick={() => setShowModal(true)} style={{ marginTop: 12 }}>
            İlk Kaydı Ekle
          </button>
        </div>
      )}

      <div className="kb-grid">
        {filtered.map(entry => (
          <div
            key={entry.id}
            className={`kb-entry selectable-card ${entry.id === selectedEntry?.id ? "is-selected" : ""}`}
            style={{ opacity: deletingId === entry.id ? 0.4 : 1, transition: "opacity 0.3s" }}
            onClick={() => setSelectedEntryId(entry.id)}
          >
            <div className="kb-entry__header">
              <div className="toolbar">
                <h4 className="kb-entry__title">{entry.title}</h4>
                <span className="pill">{entry.category}</span>
              </div>
              <button
                type="button"
                className="button sm secondary"
                onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                disabled={deletingId === entry.id}
                style={{ flexShrink: 0, color: "var(--danger)", borderColor: "rgba(189,100,102,0.32)" }}
              >
                Sil
              </button>
            </div>
            <p className="kb-entry__content">{entry.content}</p>
            <p className="kb-entry__meta">
              Ekleyen: {entry.addedBy} · {new Date(entry.addedAt).toLocaleDateString("tr-TR")}
            </p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Yeni Bilgi Tabanı Kaydı</h3>
            <div className="modal-field">
              <label>Başlık</label>
              <input
                className="form-input"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Konu başlığını girin"
                autoFocus
              />
            </div>
            <div className="modal-field">
              <label>Kategori</label>
              <select
                className="form-input"
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              >
                <option>Teknik Destek</option>
                <option>Müşteri Hizmetleri</option>
                <option>İade</option>
                <option>Kargo</option>
                <option>Kullanım Kılavuzu</option>
                <option>Operasyon</option>
              </select>
            </div>
            <div className="modal-field">
              <label>İçerik</label>
              <textarea
                className="form-input"
                value={form.content}
                onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                rows={5}
                placeholder="Bilgi içeriğini girin..."
              />
            </div>
            <div className="stack" style={{ marginTop: 4 }}>
              <button type="button" className="button" onClick={handleSave}>Kaydet</button>
              <button type="button" className="button secondary" onClick={() => setShowModal(false)}>İptal</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </PageShell>
  );
}
