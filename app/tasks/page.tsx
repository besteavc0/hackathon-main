"use client";
import { useState, useEffect } from "react";
import { PageShell } from "@/components/page-shell";
import { tasks as initialTasks } from "@/lib/mock-data";

type Task = { id: string; title: string; owner: string; due: string; reason: string; status: string };
type Toast = { msg: string; type: "success" | "error" } | null;

function displayStatus(status: string) {
  if (status === "Tamamlandi") return "Tamamlandı";
  if (status === "Acik") return "Açık";
  return status;
}

function priorityFor(task: Task) {
  const text = `${task.title} ${task.reason}`.toLowerCase();
  if (text.includes("sla") || text.includes("kritik") || text.includes("olumsuz")) return "Yüksek";
  return "Normal";
}

function orderRefFor(task: Task) {
  return task.title.match(/#\d+/)?.[0] ?? null;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [toast, setToast] = useState<Toast>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", owner: "", due: "", reason: "" });
  const [selectedTaskId, setSelectedTaskId] = useState("");

  useEffect(() => {
    fetch("/api/tasks").then(r => r.json()).then((data: Task[]) => {
      setTasks(data);
      if (data.length > 0) setSelectedTaskId(data[0].id);
    }).catch(() => {
      setTasks(initialTasks as Task[]);
      setSelectedTaskId(initialTasks[0].id);
    });
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleComplete = async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "Tamamlandi" }) });
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: "Tamamlandi" } : t));
      showToast("Görev tamamlandı olarak işaretlendi.");
    } catch { showToast("Güncelleme başarısız.", "error"); }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      setTasks(prev => prev.filter(t => t.id !== id));
      if (selectedTaskId === id) {
        const next = tasks.find(t => t.id !== id);
        if (next) setSelectedTaskId(next.id);
      }
      showToast("Görev silindi.");
    } catch { showToast("Silme başarısız.", "error"); }
  };

  const handleAdd = async () => {
    if (!form.title || !form.owner || !form.due) {
      showToast("Başlık, sorumlu ve tarih zorunludur.", "error"); return;
    }
    try {
      const res = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.ok) {
        setTasks(prev => [...prev, data.entry]);
        setSelectedTaskId(data.entry.id);
        setShowModal(false);
        setForm({ title: "", owner: "", due: "", reason: "" });
        showToast("Görev eklendi.");
      }
    } catch { showToast("Ekleme başarısız.", "error"); }
  };

  const open = tasks.filter(t => t.status === "Acik").length;
  const done = tasks.filter(t => t.status === "Tamamlandi").length;
  const openTasks = tasks.filter(t => t.status !== "Tamamlandi");
  const doneTasks = tasks.filter(t => t.status === "Tamamlandi");
  const selectedTask = tasks.find(t => t.id === selectedTaskId) ?? openTasks[0] ?? doneTasks[0];

  const renderTask = (task: Task) => {
    const orderRef = orderRefFor(task);
    const priority = priorityFor(task);

    return (
      <article
        className={`task-card selectable-card ${task.status === "Tamamlandi" ? "is-complete" : ""} ${task.id === selectedTask?.id ? "is-selected" : ""}`}
        key={task.id}
        onClick={() => setSelectedTaskId(task.id)}
      >
        <div className="task-card__top">
          <h3>{task.title}</h3>
          <span className={`pill ${task.status === "Tamamlandi" ? "low" : "mid"}`}>
            {displayStatus(task.status)}
          </span>
        </div>

        <div className="task-card__meta">
          <span>Sorumlu: <strong>{task.owner}</strong></span>
          <span>Son tarih: <strong>{task.due}</strong></span>
        </div>

        <div className="conversation-meta" style={{ margin: "0 0 12px" }}>
          <span className={`pill ${priority === "Yüksek" ? "high" : ""}`}>Öncelik {priority}</span>
          <span className="pill">AI kaynaklı</span>
          {orderRef && <span className="pill info">{orderRef}</span>}
        </div>

        {task.reason && <p className="task-card__reason">AI nedeni: {task.reason}</p>}

        <div className="stack">
          {task.status !== "Tamamlandi" && (
            <button type="button" className="button sm success" onClick={(e) => { e.stopPropagation(); setSelectedTaskId(task.id); handleComplete(task.id); }}>
              Tamamla
            </button>
          )}
          <button
            type="button"
            className="button sm secondary"
            onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}
            style={{ color: "var(--danger)", borderColor: "rgba(189,100,102,0.32)" }}
          >
            Sil
          </button>
        </div>
      </article>
    );
  };

  return (
    <PageShell
      title="Görev Merkezi"
      subtitle="AI tarafından açılan ve elle eklenen operasyon görevleri."
      badge={`${open} açık`}
      rightPanel={
        <div className="context-stack">
          <div className="context-card context-card--warm">
            <p className="context-kicker">Seçili görev</p>
            <h3 className="context-title">{selectedTask?.title ?? "Görev yok"}</h3>
            {selectedTask && (
              <div className="context-list">
                <div className="context-row"><span>Sorumlu</span><strong>{selectedTask.owner}</strong></div>
                <div className="context-row"><span>Deadline</span><strong>{selectedTask.due}</strong></div>
                <div className="context-row"><span>Öncelik</span><strong>{priorityFor(selectedTask)}</strong></div>
              </div>
            )}
          </div>
          <div className="context-card">
            <p className="context-kicker">AI nedeni</p>
            <p className="muted" style={{ margin: 0 }}>{selectedTask?.reason ?? "Aktif görev bulunmuyor."}</p>
            {selectedTask && selectedTask.status !== "Tamamlandi" && (
              <div className="context-actions">
                <button type="button" className="button sm success" onClick={() => handleComplete(selectedTask.id)}>
                  Hızlı Tamamla
                </button>
              </div>
            )}
          </div>
          <div className="context-card">
            <p className="context-kicker">Pano özeti</p>
            <div className="context-list">
              <div className="context-row"><span>Açık</span><strong>{open}</strong></div>
              <div className="context-row"><span>Tamamlanan</span><strong>{done}</strong></div>
            </div>
          </div>
        </div>
      }
    >
      <div className="grid grid-3" style={{ marginBottom: 16 }}>
        <article className="card card--metric">
          <div>
            <p className="card__eyebrow">Açık görev</p>
            <p className="kpi">{open}</p>
          </div>
          <p className="metric-note">Operasyon ekiplerinin aktif takip listesi</p>
        </article>

        <article className="card card--metric">
          <div>
            <p className="card__eyebrow">Tamamlanan</p>
            <p className="kpi" style={{ color: "var(--success)" }}>{done}</p>
          </div>
          <p className="metric-note">Bu oturumda kapatılan görev</p>
        </article>

        <article className="card card--action">
          <div>
            <p className="card__eyebrow">Yeni görev</p>
            <p className="metric-note">Operasyon takibine manuel görev ekleyin.</p>
          </div>
          <button type="button" className="button" onClick={() => setShowModal(true)}>
            Görev Ekle
          </button>
        </article>
      </div>

      <section className="task-board">
        <div className="task-column">
          <div className="task-column__header">
            <h3>Açık işler</h3>
            <span className="pill mid">{openTasks.length} görev</span>
          </div>
          {openTasks.map(renderTask)}
        </div>

        <div className="task-column">
          <div className="task-column__header">
            <h3>Tamamlanan</h3>
            <span className="pill low">{doneTasks.length} görev</span>
          </div>
          {doneTasks.length > 0 ? doneTasks.map(renderTask) : (
            <article className="task-card">
              <p className="muted" style={{ margin: 0 }}>Henüz tamamlanan görev yok.</p>
            </article>
          )}
        </div>
      </section>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Yeni Görev Ekle</h3>
            {[
              { key: "title", label: "Görev Başlığı" },
              { key: "owner", label: "Sorumlu" },
              { key: "due", label: "Son Tarih (örn. Bugün 17:00)" },
              { key: "reason", label: "Gerekçe (opsiyonel)" },
            ].map(f => (
              <div key={f.key} className="modal-field">
                <label>{f.label}</label>
                <input
                  className="form-input"
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                />
              </div>
            ))}
            <div className="stack" style={{ marginTop: 8 }}>
              <button type="button" className="button" onClick={handleAdd}>Ekle</button>
              <button type="button" className="button secondary" onClick={() => setShowModal(false)}>İptal</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </PageShell>
  );
}
