import { Navigation } from "@/components/navigation";
import { ReactNode } from "react";

type Props = {
  title: string;
  subtitle: string;
  badge?: string;
  rightPanel?: ReactNode;
  children: ReactNode;
};

export function PageShell({ title, subtitle, badge, rightPanel, children }: Props) {
  return (
    <div className="layout">
      <Navigation />
      <main className="content">
        <div className="workspace-layout">
          <section className="workspace-panel">
            <header className="page-header">
              <div className="page-header__row">
                <div>
                  <h1 className="page-title">{title}</h1>
                  <p className="page-subtitle">{subtitle}</p>
                </div>
                {badge && <span className="page-badge">{badge}</span>}
              </div>
            </header>
            <div className="workspace-content">
              {children}
            </div>
          </section>

          {rightPanel && (
            <aside className="context-panel" aria-label="Bağlamsal panel">
              {rightPanel}
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
