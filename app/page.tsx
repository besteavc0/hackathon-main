import type { ReactElement } from "react";
import { PageShell } from "@/components/page-shell";
import { activityFeed, aiInsight, kpis, recentOrders, tasks } from "@/lib/mock-data";

function formatTry(n: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0
  }).format(n);
}

function displayFulfillment(status: string) {
  if (status === "Hazirlaniyor") return "Hazırlanıyor";
  return status;
}

export default function HomePage(): ReactElement {
  const fulfillmentMix = [
    { label: "Kargoda", pct: 42, className: "shipped" },
    { label: "Hazırlanıyor", pct: 28, className: "preparing" },
    { label: "Gecikme", pct: 12, className: "delayed" },
    { label: "Teslim", pct: 18, className: "delivered" }
  ];

  return (
    <PageShell
      title="Genel Bakış"
      subtitle="Sipariş, kargo riski, stok ve AI yardım masası tek ekranda."
      badge="Canlı"
      rightPanel={
        <div className="context-stack">
          <div className="context-card context-card--warm">
            <p className="context-kicker">AI Öncelik</p>
            <h3 className="context-title">Kargo ve stok riski bugün operasyonun ana odağı.</h3>
            <p className="muted" style={{ margin: "10px 0 0" }}>{aiInsight}</p>
          </div>
          <div className="context-card">
            <p className="context-kicker">Bugünkü riskler</p>
            <div className="context-list">
              <div className="context-row"><span>Riskli kargo</span><strong>{kpis.riskyShipments}</strong></div>
              <div className="context-row"><span>Kritik SKU</span><strong>{kpis.lowStockSkus}</strong></div>
              <div className="context-row"><span>İlk yanıt</span><strong>{kpis.avgFirstResponseMin} dk</strong></div>
            </div>
          </div>
          <div className="context-card">
            <p className="context-kicker">Önerilen aksiyonlar</p>
            <div className="context-list">
              <span className="pill mid">#128 gecikme mesajı</span>
              <span className="pill info">Galaxy Ring tedarik taslağı</span>
              <span className="pill low">AI çözümleri izle</span>
            </div>
          </div>
        </div>
      }
    >
      <div className="insight-banner">
        <div className="insight-content">
          <div>
            <p className="insight-banner__label">AI Özet</p>
            <p>{aiInsight}</p>
          </div>
          <div className="insight-side">
            <span className="pill mid">Risk seviyesi: Orta</span>
            <span className="pill info">Öneri: Kargo ekibini bilgilendir</span>
          </div>
        </div>
      </div>

      <section className="grid grid-4">
        <article className="card card--metric">
          <div className="metric-head">
            <div>
              <p className="card__eyebrow">Bugünkü sipariş</p>
              <p className="kpi kpi--accent">{kpis.todayOrders}</p>
            </div>
            <span className="metric-icon">SP</span>
          </div>
          <div>
            <p className="metric-note">Önceki güne göre +18%</p>
            <p className="stat-trend">Trend yukarı</p>
          </div>
        </article>

        <article className="card card--metric">
          <div className="metric-head">
            <div>
              <p className="card__eyebrow">Ciro bugün</p>
              <p className="kpi">{formatTry(kpis.revenueTry)}</p>
            </div>
            <span className="metric-icon">₺</span>
          </div>
          <p className="metric-note">KDV dahil tamamlanan ödeme</p>
        </article>

        <article className="card card--metric">
          <div className="metric-head">
            <div>
              <p className="card__eyebrow">Riskli kargo</p>
              <p className="kpi" style={{ color: "var(--warning)" }}>{kpis.riskyShipments}</p>
            </div>
            <span className="metric-icon">RK</span>
          </div>
          <div>
            <p className="metric-note">SLA aşımı veya operasyon uyarısı</p>
            <p className="stat-trend stat-trend--warn">Müdahale gerekli</p>
          </div>
        </article>

        <article className="card card--metric">
          <div className="metric-head">
            <div>
              <p className="card__eyebrow">AI çözülen talep</p>
              <p className="kpi">{kpis.autoResolvedTickets}</p>
            </div>
            <span className="metric-icon">AI</span>
          </div>
          <p className="metric-note">Ortalama ilk yanıt {kpis.avgFirstResponseMin} dk</p>
        </article>
      </section>

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <section className="card">
          <div className="table-titlebar">
            <h3>Son siparişler</h3>
            <span className="pill info">Canlı akış</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Sipariş</th>
                  <th>Müşteri</th>
                  <th>Ürün</th>
                  <th>Tutar</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td><strong>{o.name}</strong></td>
                    <td>
                      <span className="td-main">
                        <strong>{o.customer}</strong>
                        <span className="muted">{o.city}</span>
                      </span>
                    </td>
                    <td className="muted">{o.product}</td>
                    <td className="numeric">{formatTry(o.totalTry)}</td>
                    <td>
                      <span className={`pill ${o.fulfillmentStatus === "Gecikme" ? "high" : o.fulfillmentStatus === "Kargoda" ? "mid" : "low"}`}>
                        {displayFulfillment(o.fulfillmentStatus)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid">
          <article className="card">
            <div className="section-heading">
              <h3>Görevler</h3>
              <span className="pill mid">{tasks.length} açık</span>
            </div>
            <ul className="activity-list">
              {tasks.map((t) => (
                <li key={t.id}>
                  <time>{t.due.split(" ")[0]}</time>
                  <span>
                    <strong>{t.title}</strong>
                    <span className="muted"> · {t.owner}</span>
                  </span>
                </li>
              ))}
            </ul>
          </article>

          <article className="card">
            <div className="section-heading">
              <h3>Fulfillment dağılımı</h3>
            </div>
            {fulfillmentMix.map((row) => (
              <div key={row.label} style={{ marginBottom: 12 }}>
                <div className="toolbar toolbar--split" style={{ marginBottom: 0 }}>
                  <span className="muted">{row.label}</span>
                  <span className="numeric">{row.pct}%</span>
                </div>
                <div className="progress-bar">
                  <div className={`progress-bar__fill ${row.className}`} style={{ width: `${row.pct}%` }} />
                </div>
              </div>
            ))}
          </article>
        </section>
      </div>

      <section className="card" style={{ marginTop: 16 }}>
        <div className="section-heading">
          <h3>Son aktivite</h3>
        </div>
        <ul className="activity-list">
          {activityFeed.map((item, i) => (
            <li key={i}>
              <time>{item.time}</time>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
