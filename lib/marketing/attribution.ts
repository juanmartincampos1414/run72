"use client";

// Captura y conserva la atribución (UTM, referrer, landing) en la primera
// visita, para que sobreviva la navegación hasta el envío de un formulario.
// No se muestra en campos visibles. No se envía a analítica (solo al backend
// junto con el lead).

const KEY = "run-attribution-v1";

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  fbclid?: string;
  referrer?: string;
  landing_page?: string;
  first_visit_at?: string;
};

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"] as const;

// Deriva un canal de adquisición simple a partir de UTM/referrer.
export function deriveChannel(a: Attribution): string {
  const src = (a.utm_source || "").toLowerCase();
  const med = (a.utm_medium || "").toLowerCase();
  if (a.gclid || src.includes("google")) return med.includes("cpc") || med.includes("paid") || a.gclid ? "google_ads" : "google";
  if (a.fbclid || src.includes("facebook") || src.includes("meta") || src.includes("instagram")) return "meta_ads";
  if (src.includes("linkedin")) return "linkedin";
  if (med.includes("cpc") || med.includes("paid") || med.includes("ads")) return "paid";
  if (a.referrer && !a.referrer.includes(location.host)) return "referral";
  if (!a.referrer && !src) return "direct";
  return "organic";
}

// Llamar una vez al montar el sitio (AttributionTracker). Solo escribe si no
// hay atribución previa (first-touch).
export function captureAttribution() {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(KEY)) return;
    const params = new URLSearchParams(window.location.search);
    const a: Attribution = {
      referrer: document.referrer || undefined,
      landing_page: window.location.pathname || "/",
      first_visit_at: new Date().toISOString(),
    };
    for (const k of UTM_KEYS) {
      const v = params.get(k);
      if (v) a[k] = v.slice(0, 200);
    }
    localStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    /* ignore */
  }
}

export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : {};
  } catch {
    return {};
  }
}
