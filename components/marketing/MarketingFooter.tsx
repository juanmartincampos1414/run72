import Link from "next/link";
import { FOOTER, SITE } from "@/lib/marketing/content";
import { ConsentSettingsButton } from "./ConsentSettingsButton";

// Footer atmosférico (3.2): arcos luminosos cyan/azul/violeta, marca RUN,
// columnas de exploración/conexión/legal. Año dinámico.
export function MarketingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="m-footer">
      <div className="m-footer-glow" aria-hidden="true">
        <svg viewBox="0 0 1200 340" preserveAspectRatio="xMidYMax slice" width="100%" height="100%">
          <defs>
            <linearGradient id="fg-cyan" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#18acff" stopOpacity="0" />
              <stop offset="1" stopColor="#18acff" stopOpacity="0.55" />
            </linearGradient>
            <linearGradient id="fg-violet" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#8960ff" stopOpacity="0.55" />
              <stop offset="1" stopColor="#5583ff" stopOpacity="0" />
            </linearGradient>
            <filter id="fg-blur"><feGaussianBlur stdDeviation="22" /></filter>
          </defs>
          <g filter="url(#fg-blur)">
            <path d="M-50 360 Q 350 120 700 300" stroke="url(#fg-cyan)" strokeWidth="3" fill="none" />
            <path d="M400 380 Q 760 140 1260 320" stroke="url(#fg-violet)" strokeWidth="3" fill="none" />
            <path d="M120 400 Q 600 180 1120 360" stroke="#5583ff" strokeOpacity="0.3" strokeWidth="2" fill="none" />
          </g>
        </svg>
      </div>

      <div className="m-container m-footer-inner">
        <div className="m-footer-brand">
          <span className="m-wordmark" style={{ fontFamily: "var(--font-run-display)", fontWeight: 600, letterSpacing: "-0.04em", fontSize: 24 }}>
            RUN
          </span>
          <p className="m-footer-desc m-mono">{FOOTER.description}</p>
        </div>

        <div className="m-footer-cols">
          {FOOTER.columns.map((col) => (
            <nav key={col.title} className="m-footer-col" aria-label={col.title}>
              <p className="m-footer-coltitle m-eyebrow">{col.title}</p>
              <ul>
                {col.links.map((l) => {
                  const isConsent = "id" in l && l.id === "consent-settings";
                  if (isConsent) {
                    return (
                      <li key={l.label}>
                        <ConsentSettingsButton className="m-footer-link">{l.label}</ConsentSettingsButton>
                      </li>
                    );
                  }
                  const external = /^https?:\/\//.test(l.href) || l.href.startsWith("mailto:");
                  return (
                    <li key={l.label}>
                      {external ? (
                        <a href={l.href} className="m-footer-link">{l.label}</a>
                      ) : (
                        <Link href={l.href} className="m-footer-link">{l.label}</Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="m-container m-footer-base">
        <p className="m-mono">© {year} RUN</p>
        <a href={`mailto:${SITE.email}`} className="m-footer-link m-mono">{SITE.email}</a>
      </div>
    </footer>
  );
}
