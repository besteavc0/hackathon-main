"use client";
import { useState, useEffect } from "react";
import { PageShell } from "@/components/page-shell";
import { Shipment } from "@/lib/mock-data";
import { apiErrorMessage } from "@/lib/api-error";

type Toast = { msg: string; type: "success" | "error" } | null;
type RiskFilter = "Tumu" | "Yuksek" | "Orta" | "Dusuk";

function shipmentKey(s: Shipment) {
  return `${s.orderId}-${s.trackingNo}`;
}

function riskClass(risk: Shipment["risk"]) {
  if (risk === "Yuksek") return "high";
  if (risk === "Orta") return "mid";
  return "low";
}

function displayRisk(risk: Shipment["risk"] | RiskFilter) {
  if (risk === "Tumu") return "Tümü";
  if (risk === "Yuksek") return "Yüksek";
  if (risk === "Dusuk") return "Düşük";
  return risk;
}

export default function ShippingPage() {
  const [data, setData] = useState<Shipment[]>([]);
  const [notifying, setNotifying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [filterRisk, setFilterRisk] = useState<RiskFilter>("Tumu");
  const [selectedShipmentKey, setSelectedShipmentKey] = useState("");

  useEffect(() => {
    fetch("/api/shipping").then(r => r.json()).then((res) => {
      if (Array.isArray(res) && res.length > 0) {
        setData(res as Shipment[]);
        setSelectedShipmentKey(shipmentKey(res[0] as Shipment));
      }
    }).catch(() => {});
  }, []);

  const critical = data.filter(s => s.risk === "Yuksek").length;
  const filtered = filterRisk === "Tumu" ? data : data.filter(s => s.risk === filterRisk);
  const selectedShipment = data.find(s => shipmentKey(s) === selectedShipmentKey) ?? filtered[0] ?? data[0] ?? null;
  const selectedKey = selectedShipment ? shipmentKey(selectedShipment) : "";

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleNotify = async () => {
    setNotifying(true);
    const riskyShipments = data.filter(s => s.risk === "Yuksek");
    const riskyOrders = riskyShipments.map(s => s.orderId).join(", ");
    const slackText = riskyShipments.map(s =>
      `• *${s.orderId}* - ${s.customer} (${s.destination}): ${s.status} | SLA: ${s.slaHoursLeft > 0 ? "+" : ""}${s.slaHoursLeft}s`
    ).join("\n");

    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slackText: `*OpsMind Proaktif Bilgilendirme* - Yüksek Riskli Kargolar:\n${slackText}`,
          wpText: riskyShipments.map(s =>
            `Acil: ${s.orderId} - ${s.customer}: ${s.status}. SLA: ${s.slaHoursLeft > 0 ? "+" : ""}${s.slaHoursLeft}s`
          ).join("\n"),
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok !== false) {
        showToast(`WhatsApp + Slack bildirimi gönderildi: ${riskyOrders}`);
      } else {
        throw new Error(apiErrorMessage(data, "Bildirim gönderilemedi."));
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Bildirim gönderilemedi. Lütfen webhook ayarlarını kontrol edin.",
        "error"
      );
    }
    setNotifying(false);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      window.location.href = "/api/shipping/export";
      showToast("Kargo raporu indirildi.");
    } catch {
      showToast("Rapor indirilemedi.", "error");
    }
    setDownloading(false);
  };

  return (
    <PageShell
      title="Kargo Takibi"
      subtitle="Takip numarası, SLA ve son olaylar ile riskli gönderileri yönetin."
      badge={`${critical} kritik`}
      rightPanel={
        <div className="context-stack">
          <div className="context-card context-card--warm">
            <p className="context-kicker">Riskli gönderi</p>
            <h3 className="context-title">{selectedShipment?.orderId} · {selectedShipment?.customer}</h3>
            {selectedShipment && (
              <div className="context-list">
                <div className="context-row"><span>Varış</span><strong>{selectedShipment.destination}</strong></div>
                <div className="context-row"><span>SLA</span><strong>{selectedShipment.slaHoursLeft > 0 ? "+" : ""}{selectedShipment.slaHoursLeft}s</strong></div>
                <div className="context-row"><span>Firma</span><strong>{selectedShipment.provider}</strong></div>
                <div className="context-row"><span>Risk</span><strong>{displayRisk(selectedShipment.risk)}</strong></div>
              </div>
            )}
          </div>
          <div className="context-card">
            <p className="context-kicker">Önerilen aksiyon</p>
            <p className="muted" style={{ margin: 0 }}>
              Müşteriye proaktif gecikme mesajı gönder, kargo firmasından son olay doğrulaması iste.
            </p>
            <div className="context-actions">
              <button type="button" className="button sm" onClick={handleNotify} disabled={notifying}>
                Bildirim Gönder
              </button>
              <button type="button" className="button sm secondary" onClick={handleDownload} disabled={downloading}>
                Rapor İndir
              </button>
            </div>
          </div>
          <div className="context-card">
            <p className="context-kicker">Operasyon özeti</p>
            <div className="context-list">
              <div className="context-row"><span>Aktif gönderi</span><strong>{data.length}</strong></div>
              <div className="context-row"><span>Yüksek risk</span><strong>{critical}</strong></div>
            </div>
          </div>
        </div>
      }
    >
      <div className="grid grid-3" style={{ marginBottom: 16 }}>
        <article className="card card--metric">
          <div>
            <p className="card__eyebrow">Aktif gönderi</p>
            <p className="kpi">{data.length}</p>
          </div>
          <p className="metric-note">Toplam aktif kargo</p>
        </article>

        <article className="card card--metric">
          <div>
            <p className="card__eyebrow">Yüksek risk</p>
            <p className="kpi" style={{ color: "var(--danger)" }}>{critical}</p>
          </div>
          <p className="metric-note">SLA aşımı veya kargo uyarısı</p>
        </article>

        <article className="card card--action">
          <div>
            <p className="card__eyebrow">Toplu aksiyon</p>
            <p className="metric-note">Riskli kargolar için bildirim gönderin veya CSV raporu indirin.</p>
          </div>
          <div className="stack">
            <button
              type="button"
              className="button"
              onClick={handleNotify}
              disabled={notifying}
            >
              {notifying ? "Gönderiliyor..." : "Proaktif Bilgilendirme"}
            </button>
            <button
              type="button"
              className="button secondary"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? "Hazırlanıyor..." : "Rapor İndir"}
            </button>
          </div>
        </article>
      </div>

      <section className="card">
        <div className="table-titlebar">
          <h3>Kargo tablosu</h3>
          <div className="segmented" role="tablist" aria-label="Risk filtresi">
            {(["Tumu", "Yuksek", "Orta", "Dusuk"] as const).map(r => (
              <button
                key={r}
                type="button"
                className={`button sm ${filterRisk === r ? "is-active" : ""}`}
                onClick={() => setFilterRisk(r)}
              >
                {displayRisk(r)}
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Sipariş</th>
                <th>Müşteri</th>
                <th>Ürün</th>
                <th>Firma</th>
                <th>Takip no</th>
                <th>Varış</th>
                <th>Durum</th>
                <th>SLA</th>
                <th>Tahmini</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.orderId + s.trackingNo}
                  className={`selectable-row ${s.slaHoursLeft < 0 ? "row-warning" : ""} ${shipmentKey(s) === selectedKey ? "is-selected" : ""}`}
                  onClick={() => setSelectedShipmentKey(shipmentKey(s))}
                >
                  <td><strong>{s.orderId}</strong></td>
                  <td>{s.customer}</td>
                  <td className="muted">{s.product}</td>
                  <td>{s.provider}</td>
                  <td className="muted" style={{ fontSize: "0.72rem" }}>{s.trackingNo}</td>
                  <td>{s.destination}</td>
                  <td>
                    <span className="td-main">
                      <span>{s.status}</span>
                      <span className="muted">{s.lastEvent}</span>
                    </span>
                  </td>
                  <td
                    className="numeric"
                    style={{
                      color: s.slaHoursLeft < 0 ? "var(--warning)" : undefined,
                      fontWeight: s.slaHoursLeft < 0 ? 750 : undefined
                    }}
                  >
                    {s.slaHoursLeft > 0 ? "+" : ""}{s.slaHoursLeft}s
                  </td>
                  <td>{s.estimatedDelivery}</td>
                  <td>
                    <span className={`pill ${riskClass(s.risk)}`}>{displayRisk(s.risk)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </PageShell>
  );
}
