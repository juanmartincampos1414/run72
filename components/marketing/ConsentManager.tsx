"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

// Gestor de consentimiento (§14.2). Categorías: Necesarias (siempre),
// Analítica y Marketing. El Pixel de Meta solo se carga tras consentir
// Marketing. Persistencia versionada por categoría en localStorage.

const KEY = "run-consent-v1";
const VERSION = "2026-10-18";
const META_PIXEL_ID = "1125099563395216";

type Consent = { necessary: true; analytics: boolean; marketing: boolean; version: string };

function read(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Consent;
    if (c.version !== VERSION) return null; // re-preguntar si cambió la versión
    return c;
  } catch {
    return null;
  }
}

export function ConsentManager() {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const c = read();
    setConsent(c);
    setAnalytics(c?.analytics ?? false);
    setMarketing(c?.marketing ?? false);
    setReady(true);
    const onOpen = () => setOpen(true);
    window.addEventListener("run:open-consent", onOpen);
    return () => window.removeEventListener("run:open-consent", onOpen);
  }, []);

  const save = (next: { analytics: boolean; marketing: boolean }) => {
    const c: Consent = { necessary: true, analytics: next.analytics, marketing: next.marketing, version: VERSION };
    try {
      localStorage.setItem(KEY, JSON.stringify(c));
    } catch {
      /* ignore */
    }
    setConsent(c);
    setOpen(false);
  };

  const showBanner = ready && (!consent || open);
  const pixelOn = !!consent?.marketing;

  return (
    <>
      {pixelOn && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
        </Script>
      )}

      {showBanner && (
        <div role="dialog" aria-modal="false" aria-label="Preferencias de privacidad" style={styles.wrap}>
          <div style={styles.card}>
            <p style={styles.title}>Privacidad</p>
            <p style={styles.text}>
              Usamos cookies necesarias para que el sitio funcione. Con tu permiso, sumamos analítica
              propia y marketing. Podés cambiarlo cuando quieras.
            </p>
            <div style={styles.opts}>
              <label style={styles.opt}><input type="checkbox" checked readOnly disabled /> <span>Necesarias (siempre activas)</span></label>
              <label style={styles.opt}><input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} /> <span>Analítica</span></label>
              <label style={styles.opt}><input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} /> <span>Marketing</span></label>
            </div>
            <div style={styles.actions}>
              <button type="button" style={styles.ghost} onClick={() => save({ analytics: false, marketing: false })}>Solo necesarias</button>
              <button type="button" style={styles.ghost} onClick={() => save({ analytics, marketing })}>Guardar preferencias</button>
              <button type="button" style={styles.primary} onClick={() => save({ analytics: true, marketing: true })}>Aceptar todo</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 80, display: "flex", justifyContent: "center", padding: "16px", paddingBottom: "calc(16px + env(safe-area-inset-bottom))", pointerEvents: "none" },
  card: { pointerEvents: "auto", width: "100%", maxWidth: 680, background: "rgba(10,10,10,0.96)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 18, padding: 20, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", color: "#fff", fontFamily: "ui-sans-serif, system-ui, sans-serif" },
  title: { fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9CA3AF", margin: 0 },
  text: { fontSize: 14, lineHeight: "20px", color: "rgba(255,255,255,0.75)", margin: "8px 0 14px" },
  opts: { display: "flex", flexWrap: "wrap", gap: "12px 20px", marginBottom: 16 },
  opt: { display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, color: "#fff" },
  actions: { display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "flex-end" },
  ghost: { height: 40, padding: "0 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.18)", background: "transparent", color: "#fff", fontSize: 14, cursor: "pointer" },
  primary: { height: 40, padding: "0 18px", borderRadius: 12, border: 0, background: "linear-gradient(100deg,#18ACFF,#5583FF 48%,#8960FF)", color: "#fff", fontSize: 14, cursor: "pointer" },
};
