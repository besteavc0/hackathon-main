"use client";
import { useState, useEffect } from "react";
import { PageShell } from "@/components/page-shell";
import { users as initialUsers } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";

type Toast = { msg: string; type: "success" | "error" } | null;

const tabs = [
  { key: "kullanicilar", label: "Kullanıcılar" },
  { key: "entegrasyonlar", label: "Entegrasyonlar" },
  { key: "bildirimler", label: "Bildirimler" }
] as const;

const integrations = [
  { name: "Shopify", desc: "E-ticaret sipariş entegrasyonu", connected: true, icon: "SH" },
  { name: "WhatsApp Business", desc: "Müşteri mesajlaşma kanalı", connected: true, icon: "WA" },
  { name: "Slack", desc: "Ekip bildirimleri ve kargo uyarıları", connected: true, icon: "SL" },
  { name: "Yurtiçi Kargo API", desc: "Kargo takip entegrasyonu", connected: false, icon: "YK" },
  { name: "Aras Kargo API", desc: "Kargo takip entegrasyonu", connected: false, icon: "AR" },
  { name: "ChromaDB", desc: "Vektörel bilgi tabanı (RAG)", connected: true, icon: "DB" },
];

const setupChecklist = [
  { label: "Shopify uygulaması bağlandı", status: "Tamamlandı", tone: "low", mark: "✓" },
  { label: "Sipariş webhook'u doğrulandı", status: "Tamamlandı", tone: "low", mark: "✓" },
  { label: "Kargo bildirim kanalı izleniyor", status: "Devam ediyor", tone: "mid", mark: "•" },
  { label: "AI bilgi tabanı senkronu", status: "Bekliyor", tone: "", mark: "…" }
] as const;

const notificationItems = [
  { key: "cargo_high", label: "Yüksek riskli kargo uyarısı", target: "WhatsApp" },
  { key: "stock_low", label: "Stok eşik altı bildirimi", target: "Slack" },
  { key: "ai_draft", label: "AI taslağı hazır olduğunda", target: "E-posta" },
  { key: "daily_summary", label: "Günlük operasyon özeti", target: "Slack" },
  { key: "sentiment_neg", label: "Müşteri olumsuz sentiment alarmı", target: "WhatsApp" },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState(initialUsers);
  const [toast, setToast] = useState<Toast>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Destek", department: "" });
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("kullanicilar");
  const [selectedUserId, setSelectedUserId] = useState(initialUsers[0].id);
  const [selectedIntegrationName, setSelectedIntegrationName] = useState(integrations[0].name);
  const [selectedNotificationKey, setSelectedNotificationKey] = useState(notificationItems[0].key);
  const [notifPrefs, setNotifPrefs] = useState(notificationItems.map(n => ({ ...n, enabled: true })));

  useEffect(() => {
    fetch("/api/users").then(r => r.json()).then(data => {
      if (Array.isArray(data)) { setUsers(data); if (data.length > 0) setSelectedUserId(data[0].id); }
    }).catch(() => {});
    fetch("/api/notifications").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setNotifPrefs(data);
    }).catch(() => {});
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const testIntegration = async (name: string) => {
    try {
      const res = await fetch("/api/integration-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.ok) {
        showToast(`${name}: ${data.detail}`);
      } else {
        showToast(`${name} bağlantı hatası: ${data.detail}`, "error");
      }
    } catch {
      showToast(`${name} bağlantı testi başarısız.`, "error");
    }
  };

  const isAdmin = user?.role === "Admin";

  const handleToggleActive = async (id: string) => {
    if (!isAdmin) { showToast("Bu işlemi yapmak için Admin yetkisi gereklidir.", "error"); return; }
    const u = users.find(u => u.id === id);
    if (!u) return;
    try {
      await fetch(`/api/users/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !u.active }) });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u));
      showToast("Kullanıcı durumu güncellendi.");
    } catch { showToast("Güncelleme başarısız.", "error"); }
  };

  const handleRoleChange = async (id: string, role: string) => {
    if (!isAdmin) { showToast("Bu işlemi yapmak için Admin yetkisi gereklidir.", "error"); return; }
    try {
      await fetch(`/api/users/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
      showToast("Rol güncellendi.");
    } catch { showToast("Güncelleme başarısız.", "error"); }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.department) {
      showToast("Tüm alanlar zorunludur.", "error"); return;
    }
    try {
      const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newUser) });
      const data = await res.json();
      if (data.ok) {
        setUsers(prev => [...prev, data.entry]);
        setSelectedUserId(data.entry.id);
        setShowAddModal(false);
        setNewUser({ name: "", email: "", role: "Destek", department: "" });
        showToast("Kullanıcı eklendi.");
      }
    } catch { showToast("Ekleme başarısız.", "error"); }
  };

  const handleSaveNotifications = async () => {
    try {
      const res = await fetch("/api/notifications", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: notifPrefs }) });
      const data = await res.json();
      if (data.ok) showToast("Bildirim tercihleri kaydedildi.");
    } catch { showToast("Kaydetme başarısız.", "error"); }
  };

  const selectedUser = users.find(u => u.id === selectedUserId) ?? users[0];
  const selectedIntegration = integrations.find(i => i.name === selectedIntegrationName) ?? integrations[0];
  const selectedNotification =
    notificationItems.find(item => item.key === selectedNotificationKey) ?? notificationItems[0];

  return (
    <PageShell
      title="Ayarlar"
      subtitle="Kullanıcı yetkilendirme, entegrasyon ve bildirim ayarları."
      badge={isAdmin ? "Admin" : user?.role ?? ""}
      rightPanel={
        <div className="context-stack">
          <div className="context-card context-card--warm">
            {tab === "kullanicilar" && (
              <>
                <p className="context-kicker">Seçili kullanıcı</p>
                <h3 className="context-title">{selectedUser.name}</h3>
                <div className="context-list">
                  <div className="context-row"><span>Rol</span><strong>{selectedUser.role}</strong></div>
                  <div className="context-row"><span>Departman</span><strong>{selectedUser.department}</strong></div>
                  <div className="context-row"><span>Durum</span><strong>{selectedUser.active ? "Aktif" : "Pasif"}</strong></div>
                </div>
              </>
            )}
            {tab === "entegrasyonlar" && (
              <>
                <p className="context-kicker">Seçili entegrasyon</p>
                <h3 className="context-title">{selectedIntegration.name}</h3>
                <p className="muted" style={{ margin: "10px 0 0" }}>{selectedIntegration.desc}</p>
                <div className="context-list">
                  <div className="context-row"><span>Durum</span><strong>{selectedIntegration.connected ? "Bağlı" : "Bağlı değil"}</strong></div>
                  <div className="context-row"><span>Son test</span><strong>Bugün 14:32</strong></div>
                </div>
              </>
            )}
            {tab === "bildirimler" && (
              <>
                <p className="context-kicker">Seçili bildirim</p>
                <h3 className="context-title">{selectedNotification.label}</h3>
                <div className="context-list">
                  <div className="context-row"><span>Kanal</span><strong>{selectedNotification.target}</strong></div>
                  <div className="context-row"><span>Durum</span><strong>Aktif</strong></div>
                </div>
              </>
            )}
          </div>
          <div className="context-card">
            {tab === "kullanicilar" && (
              <>
                <p className="context-kicker">Kullanıcı aksiyonu</p>
                <div className="context-actions">
                  <button
                    type="button"
                    className="button sm secondary"
                    onClick={() => handleToggleActive(selectedUser.id)}
                    disabled={!isAdmin}
                  >
                    {selectedUser.active ? "Deaktive Et" : "Aktive Et"}
                  </button>
                </div>
              </>
            )}
            {tab === "entegrasyonlar" && (
              <>
                <p className="context-kicker">Entegrasyon aksiyonu</p>
                <div className="context-actions">
                  <button
                    type="button"
                    className="button sm"
                    onClick={() => testIntegration(selectedIntegration.name)}
                  >
                    Bağlantıyı Test Et
                  </button>
                  {selectedIntegration.name === "Shopify" && (
                    <button type="button" className="button sm secondary" onClick={() => testIntegration("Shopify")}>
                      Webhook Test Et
                    </button>
                  )}
                </div>
              </>
            )}
            {tab === "bildirimler" && (
              <>
                <p className="context-kicker">Bildirim aksiyonu</p>
                <div className="context-actions">
                  <button
                    type="button"
                    className="button sm"
                    onClick={() => showToast(`${selectedNotification.label} ayarı güncellendi.`)}
                  >
                    Ayarı Güncelle
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="context-card">
            <p className="context-kicker">Sistem özeti</p>
            <div className="context-list">
              <div className="context-row"><span>Aktif rol</span><strong>{user?.role ?? "-"}</strong></div>
              <div className="context-row"><span>Aktif kullanıcı</span><strong>{users.filter(u => u.active).length}</strong></div>
              <div className="context-row"><span>Bağlı entegrasyon</span><strong>{integrations.filter(i => i.connected).length}</strong></div>
            </div>
          </div>
        </div>
      }
    >
      <div className="segmented settings-tabs" role="tablist" aria-label="Ayarlar sekmeleri">
        {tabs.map(t => (
          <button
            key={t.key}
            type="button"
            className={`button sm ${tab === t.key ? "is-active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "kullanicilar" && (
        <section className="card">
          <div className="table-titlebar">
            <h3>Kullanıcı Yönetimi</h3>
            {isAdmin && (
              <button type="button" className="button sm" onClick={() => setShowAddModal(true)}>
                Kullanıcı Ekle
              </button>
            )}
          </div>
          {!isAdmin && (
            <div className="insight-banner" style={{ marginBottom: 16 }}>
              <div>
                <p className="insight-banner__label">Sınırlı Erişim</p>
                <p>Kullanıcı yönetimi sadece Admin rolüne sahip kullanıcılar tarafından yapılabilir.</p>
              </div>
            </div>
          )}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ad Soyad</th>
                  <th>E-posta</th>
                  <th>Departman</th>
                  <th>Rol</th>
                  <th>Durum</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr
                    key={u.id}
                    className={`selectable-row ${u.id === selectedUser.id ? "is-selected" : ""}`}
                    onClick={() => setSelectedUserId(u.id)}
                  >
                    <td><strong>{u.name}</strong></td>
                    <td className="muted">{u.email}</td>
                    <td>{u.department}</td>
                    <td>
                      {isAdmin ? (
                        <select
                          className="form-input"
                          style={{ padding: "6px 8px", minWidth: 128 }}
                          value={u.role}
                          onClick={e => e.stopPropagation()}
                          onChange={e => { setSelectedUserId(u.id); handleRoleChange(u.id, e.target.value); }}
                        >
                          <option>Admin</option>
                          <option>Operasyon</option>
                          <option>Destek</option>
                          <option>Satın Alma</option>
                        </select>
                      ) : (
                        <span className="pill">{u.role}</span>
                      )}
                    </td>
                    <td>
                      <span className={`pill ${u.active ? "low" : "high"}`}>
                        {u.active ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="button sm secondary"
                        onClick={(e) => { e.stopPropagation(); setSelectedUserId(u.id); handleToggleActive(u.id); }}
                        disabled={!isAdmin}
                        style={u.active ? { color: "var(--danger)", borderColor: "rgba(189,100,102,0.32)" } : {}}
                      >
                        {u.active ? "Deaktive Et" : "Aktive Et"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "entegrasyonlar" && (
        <div className="grid">
          <div className="grid grid-2">
            <section className="status-panel">
              <div className="section-heading">
                <h3>Mağaza bağlantısı</h3>
                <span className="pill low">Bağlı</span>
              </div>
              <p className="muted" style={{ margin: 0 }}>
                Shopify mağazası sipariş, ürün ve webhook olayları için izleniyor.
              </p>
              <div className="status-list">
                <div className="status-row">
                  <span>Bağlı mağaza</span>
                  <span>opsmind-demo.myshopify.com</span>
                </div>
                <div className="status-row">
                  <span>Webhook durumu</span>
                  <span>Aktif · 200 OK</span>
                </div>
                <div className="status-row">
                  <span>Son senkron</span>
                  <span>Bugün 14:32</span>
                </div>
              </div>
              <div className="stack" style={{ marginTop: 14 }}>
                <button type="button" className="button" onClick={() => testIntegration("Shopify")}>
                  Shopify ile Tekrar Bağlan
                </button>
                <button type="button" className="button secondary" onClick={() => testIntegration("Shopify")}>
                  Webhook Test Et
                </button>
              </div>
            </section>

            <section className="status-panel">
              <div className="section-heading">
                <h3>Kurulum kontrolü</h3>
                <span className="pill info">2/4 tamam</span>
              </div>
              <div className="checklist">
                {setupChecklist.map(item => (
                  <div className="checklist-item" key={item.label}>
                    <span className={`checkmark ${item.tone}`}>{item.mark}</span>
                    <span>{item.label}</span>
                    <span className={`pill ${item.tone}`}>{item.status}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid grid-3">
            {integrations.map(intg => (
              <article
                key={intg.name}
                className={`integration-card selectable-card ${intg.name === selectedIntegration.name ? "is-selected" : ""}`}
                onClick={() => setSelectedIntegrationName(intg.name)}
              >
                <div className="integration-card__top">
                  <span className="integration-icon">{intg.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="section-heading" style={{ marginBottom: 4 }}>
                      <h4>{intg.name}</h4>
                      <span className={`pill ${intg.connected ? "low" : ""}`}>
                        {intg.connected ? "Bağlı" : "Bağlı Değil"}
                      </span>
                    </div>
                    <p className="muted" style={{ margin: 0 }}>{intg.desc}</p>
                  </div>
                </div>
                <div className="stack" style={{ marginTop: 14 }}>
                  <button
                    type="button"
                    className={`button sm ${intg.connected ? "secondary" : ""}`}
                    onClick={(e) => { e.stopPropagation(); setSelectedIntegrationName(intg.name); testIntegration(intg.name); }}
                  >
                    {intg.connected ? "Bağlantıyı Test Et" : "Bağlan"}
                  </button>
                  {intg.connected && (
                    <button
                      type="button"
                      className="button sm secondary"
                      onClick={(e) => { e.stopPropagation(); setSelectedIntegrationName(intg.name); showToast(`${intg.name} ayarları güncellendi.`); }}
                    >
                      Ayarlar
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {tab === "bildirimler" && (
        <div className="grid grid-2">
          <section className="rules-panel">
            <div className="section-heading">
              <h3>Bildirim Tercihleri</h3>
              <span className="pill info">Operasyon</span>
            </div>
            <div className="status-list">
              {notifPrefs.map(item => (
                <div
                  key={item.key}
                  className={`status-row selectable-row ${item.key === selectedNotification.key ? "is-selected" : ""}`}
                  onClick={() => setSelectedNotificationKey(item.key)}
                >
                  <span>{item.label}</span>
                  <button
                    type="button"
                    className={`button sm ${item.enabled ? "secondary" : ""}`}
                    onClick={(e) => { e.stopPropagation(); setNotifPrefs(prev => prev.map(n => n.key === item.key ? { ...n, enabled: !n.enabled } : n)); }}
                  >
                    {item.enabled ? item.target : "Kapalı"}
                  </button>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <button type="button" className="button" onClick={handleSaveNotifications}>
                Kaydet
              </button>
            </div>
          </section>

          <section className="rules-panel">
            <div className="section-heading">
              <h3>AI Kuralları</h3>
              <span className="pill low">Aktif</span>
            </div>
            <p className="muted" style={{ margin: 0 }}>
              Yanıt taslakları ve operasyon önerileri için temel güvenlik ve eskalasyon kuralları.
            </p>
            <div className="rule-list">
              <div className="rule-item">
                <strong>Riskli kargo</strong>
                <p className="muted" style={{ margin: 0 }}>SLA negatifse müşteriye proaktif bilgilendirme taslağı hazırla.</p>
              </div>
              <div className="rule-item">
                <strong>Kritik stok</strong>
                <p className="muted" style={{ margin: 0 }}>Tükenme 7 gün altına düşerse satın alma ekibine görev oluştur.</p>
              </div>
              <div className="rule-item">
                <strong>Olumsuz duygu</strong>
                <p className="muted" style={{ margin: 0 }}>Müşteri mesajında olumsuz sinyal varsa temsilciye devretmeyi öner.</p>
              </div>
            </div>
          </section>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Yeni Kullanıcı Ekle</h3>
            {(["name", "email", "department"] as const).map(field => (
              <div key={field} className="modal-field">
                <label>{field === "name" ? "Ad Soyad" : field === "email" ? "E-posta" : "Departman"}</label>
                <input
                  className="form-input"
                  value={newUser[field]}
                  onChange={e => setNewUser(p => ({ ...p, [field]: e.target.value }))}
                  type={field === "email" ? "email" : "text"}
                />
              </div>
            ))}
            <div className="modal-field">
              <label>Rol</label>
              <select className="form-input" value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}>
                <option>Admin</option>
                <option>Operasyon</option>
                <option>Destek</option>
                <option>Satın Alma</option>
              </select>
            </div>
            <div className="stack" style={{ marginTop: 8 }}>
              <button type="button" className="button" onClick={handleAddUser}>Ekle</button>
              <button type="button" className="button secondary" onClick={() => setShowAddModal(false)}>İptal</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </PageShell>
  );
}
