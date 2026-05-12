"use client";
import { useState } from "react";
import { PageShell } from "@/components/page-shell";
import { conversations, Conversation } from "@/lib/mock-data";

type Toast = { msg: string; type: "success" | "error" } | null;

function statusClass(status: Conversation["status"]) {
  if (status === "Cozuldu") return "low";
  if (status === "Temsilci Bekliyor") return "mid";
  return "info";
}

function sentimentClass(sentiment: Conversation["sentiment"]) {
  if (sentiment === "Olumsuz") return "sentiment-neg";
  if (sentiment === "Olumlu") return "sentiment-pos";
  return "";
}

function displayStatus(status: Conversation["status"]) {
  if (status === "Cozuldu") return "Çözüldü";
  if (status === "AI Taslagi Hazir") return "AI Taslağı Hazır";
  return status;
}

function displayTopic(topic: Conversation["topic"]) {
  if (topic === "Siparis") return "Sipariş";
  if (topic === "Iade") return "İade";
  return topic;
}

function displaySentiment(sentiment: Conversation["sentiment"]) {
  if (sentiment === "Notr") return "Nötr";
  return sentiment;
}

export default function InboxPage() {
  const [convos, setConvos] = useState<Conversation[]>(conversations);
  const [selectedId, setSelectedId] = useState(conversations[0].id);
  const [draftText, setDraftText] = useState<Record<string, string>>(
    Object.fromEntries(conversations.map(c => [c.id, c.aiDraft]))
  );
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [showKbModal, setShowKbModal] = useState(false);
  const [kbTitle, setKbTitle] = useState("");
  const [kbCategory, setKbCategory] = useState("Müşteri Hizmetleri");
  const [kbContent, setKbContent] = useState("");
  const [kbSaving, setKbSaving] = useState(false);

  const selected = convos.find(c => c.id === selectedId)!;
  const openCount = convos.filter(c => c.status !== "Cozuldu").length;

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleGenerateDraft = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: selected.customer,
          topic: selected.topic,
          channel: selected.channel,
          message: selected.lastMessage,
          orderRef: selected.orderRef,
        }),
      });
      const data = await res.json();
      if (res.ok && data.draft) {
        setDraftText(prev => ({ ...prev, [selected.id]: data.draft }));
        showToast("Gemini ile yeni taslak oluşturuldu.");
      } else {
        throw new Error(data.error ?? "unknown");
      }
    } catch (e) {
      showToast("Taslak oluşturulamadı: " + (e instanceof Error ? e.message : "hata"), "error");
    }
    setGenerating(false);
  };

  const handleSend = async () => {
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setConvos(prev => prev.map(c =>
      c.id === selectedId ? { ...c, status: "Cozuldu", unread: 0 } : c
    ));
    showToast(`Yanıt ${selected.customer}'a gönderildi.`);
    setSending(false);
  };

  const handleDelegate = () => {
    setConvos(prev => prev.map(c =>
      c.id === selectedId ? { ...c, status: "Temsilci Bekliyor" } : c
    ));
    showToast("Konuşma temsilciye devredildi.");
  };

  const handleAddToKb = () => {
    setKbTitle(`${selected.customer} - ${selected.topic} Sorusu`);
    setKbContent(draftText[selected.id] ?? "");
    setShowKbModal(true);
  };

  const handleKbSave = async () => {
    if (!kbTitle.trim()) { showToast("Başlık zorunludur.", "error"); return; }
    if (!kbContent.trim()) { showToast("İçerik zorunludur.", "error"); return; }
    setKbSaving(true);
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: kbTitle,
          content: kbContent,
          category: kbCategory,
          addedBy: "AI Yardım Masası",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? "Hata");
      setShowKbModal(false);
      showToast("Bilgi tabanına eklendi. Bilgi Tabanı sayfasından görebilirsiniz.");
    } catch (e) {
      showToast("Eklenemedi: " + (e instanceof Error ? e.message : "hata"), "error");
    } finally {
      setKbSaving(false);
    }
  };

  return (
    <PageShell
      title="AI Yardım Masası"
      subtitle="Kanal bazlı talepler, duygu sinyalleri ve AI yanıt taslakları."
      badge={`${openCount} açık`}
      rightPanel={
        <div className="context-stack">
          <div className="context-card context-card--warm">
            <p className="context-kicker">Konuşma analizi</p>
            <h3 className="context-title">{selected.customer}</h3>
            <div className="context-list">
              <div className="context-row"><span>Duygu</span><strong>{displaySentiment(selected.sentiment)}</strong></div>
              <div className="context-row"><span>Intent</span><strong>{displayTopic(selected.topic)}</strong></div>
              <div className="context-row"><span>Kanal</span><strong>{selected.channel}</strong></div>
              <div className="context-row"><span>Sipariş</span><strong>{selected.orderRef ?? "Yok"}</strong></div>
            </div>
          </div>
          <div className="context-card">
            <p className="context-kicker">AI taslak kalitesi</p>
            <div className="context-list">
              <span className="pill low">Ton: Profesyonel</span>
              <span className="pill info">Kaynak: Bilgi tabanı + sipariş</span>
              <span className="pill mid">Kontrol: Temsilci onayı</span>
            </div>
          </div>
          <div className="context-card">
            <p className="context-kicker">Hızlı aksiyon</p>
            <div className="context-actions">
              <button type="button" className="button sm" onClick={handleGenerateDraft} disabled={generating}>
                Taslağı Yenile
              </button>
              <button type="button" className="button sm secondary" onClick={handleDelegate} disabled={selected.status === "Cozuldu"}>
                Temsilciye Devret
              </button>
            </div>
          </div>
        </div>
      }
    >
      <div className="grid inbox-layout">
        <section className="card">
          <div className="section-heading">
            <h3>Konuşmalar</h3>
            <span className="pill info">{convos.length} kayıt</span>
          </div>

          <div className="conversation-list">
            {convos.map((c) => (
              <article
                key={c.id}
                className={`conversation-item ${c.id === selectedId ? "conversation-item--active" : ""}`}
                onClick={() => setSelectedId(c.id)}
              >
                <div className="conversation-item__top">
                  <strong>{c.customer}</strong>
                  <span className={`pill ${statusClass(c.status)}`}>{displayStatus(c.status)}</span>
                </div>
                <p className="muted" style={{ margin: "7px 0 0" }}>{c.lastMessage}</p>
                <div className="conversation-meta">
                  <span className="pill">{c.channel}</span>
                  <span className="pill">{displayTopic(c.topic)}</span>
                  <span className={`pill ${sentimentClass(c.sentiment)}`}>{displaySentiment(c.sentiment)}</span>
                  {c.unread > 0 && <span className="pill mid">{c.unread} okunmadı</span>}
                </div>
                <div className="muted" style={{ marginTop: 7, fontSize: "0.72rem" }}>
                  {c.updatedAt.split("T")[1].slice(0, 5)} · {c.orderRef ? `Sipariş ${c.orderRef}` : "Sipariş yok"}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="card draft-panel">
          <div className="section-heading">
            <div>
              <h3>Seçili konuşma</h3>
              <p className="muted" style={{ margin: "4px 0 0" }}>{selected.customer}</p>
            </div>
            <span className={`pill ${statusClass(selected.status)}`}>{displayStatus(selected.status)}</span>
          </div>

          <div className="conversation-meta" style={{ margin: "0 0 12px" }}>
            <span className="pill">{selected.channel}</span>
            <span className="pill">{displayTopic(selected.topic)}</span>
            <span className={`pill ${sentimentClass(selected.sentiment)}`}>{displaySentiment(selected.sentiment)}</span>
            {selected.orderRef && <span className="pill mid">{selected.orderRef}</span>}
          </div>

          <p className="message-preview">{selected.lastMessage}</p>

          <div className="section-heading">
            <h4 style={{ margin: 0 }}>AI taslak yanıt</h4>
            <button
              type="button"
              className="button sm secondary"
              onClick={handleGenerateDraft}
              disabled={generating}
            >
              {generating ? "Üretiliyor..." : "Gemini ile Yenile"}
            </button>
          </div>

          <textarea
            className="form-input"
            value={draftText[selected.id]}
            onChange={e => setDraftText(prev => ({ ...prev, [selected.id]: e.target.value }))}
            rows={6}
            style={{ marginBottom: 16 }}
          />

          <div className="stack">
            <button
              type="button"
              className={`button ${selected.status === "Cozuldu" ? "secondary" : ""}`}
              onClick={handleSend}
              disabled={sending || selected.status === "Cozuldu"}
            >
              {sending ? "Gönderiliyor..." : selected.status === "Cozuldu" ? "Gönderildi" : "Yanıtı Gönder"}
            </button>
            <button
              type="button"
              className="button secondary"
              onClick={handleDelegate}
              disabled={selected.status === "Cozuldu"}
            >
              Temsilciye Devret
            </button>
            <button
              type="button"
              className="button secondary"
              onClick={handleAddToKb}
            >
              Bilgi Tabanına Ekle
            </button>
          </div>
        </section>
      </div>

      {showKbModal && (
        <div className="modal-overlay" onClick={() => setShowKbModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Bilgi Tabanına Ekle</h3>
            <div className="modal-field">
              <label>Başlık</label>
              <input
                className="form-input"
                value={kbTitle}
                onChange={e => setKbTitle(e.target.value)}
                placeholder="Konu başlığını girin"
              />
            </div>
            <div className="modal-field">
              <label>Kategori</label>
              <select
                className="form-input"
                value={kbCategory}
                onChange={e => setKbCategory(e.target.value)}
              >
                <option>Müşteri Hizmetleri</option>
                <option>Teknik Destek</option>
                <option>İade</option>
                <option>Kargo</option>
                <option>Kullanım Kılavuzu</option>
              </select>
            </div>
            <div className="modal-field">
              <label>İçerik</label>
              <textarea
                className="form-input"
                value={kbContent}
                onChange={e => setKbContent(e.target.value)}
                rows={4}
              />
            </div>
            <div className="stack" style={{ marginTop: 4 }}>
              <button type="button" className="button" onClick={handleKbSave} disabled={kbSaving}>
                {kbSaving ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <button type="button" className="button secondary" onClick={() => setShowKbModal(false)}>İptal</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast ${toast.type}`}>{toast.msg}</div>
      )}
    </PageShell>
  );
}
