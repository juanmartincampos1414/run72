"use client";

// Analítica propia minimizada (sección 14.2). Solo se emite si la categoría
// "analytics" está consentida. Props permitidas: route, solutionId, demoId,
// location. Nunca incluye nombre, email, problema, presupuesto libre, tokens
// ni conversación (A26).

export type AnalyticsEvent =
  | "cta_click"
  | "solution_view"
  | "demo_open"
  | "demo_complete"
  | "inquiry_started"
  | "inquiry_submitted";

type AllowedProps = Partial<Record<"route" | "solutionId" | "demoId" | "location", string>>;

const CONSENT_KEY = "run-consent-v1";

type Consent = { necessary: boolean; analytics: boolean; marketing: boolean; version: string };

export function readConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}

function pickAllowed(props?: Record<string, unknown>): AllowedProps {
  const out: AllowedProps = {};
  if (!props) return out;
  for (const k of ["route", "solutionId", "demoId", "location"] as const) {
    const v = props[k];
    if (typeof v === "string") out[k] = v.slice(0, 120);
  }
  return out;
}

export function track(event: AnalyticsEvent, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const consent = readConsent();
  if (!consent?.analytics) return;
  const payload = pickAllowed(props);
  // Sin backend de analítica propio por ahora: se deja el gancho listo y
  // controlado. No se transmite PII. Un listener puede reenviarlo si se
  // configura un destino consentido.
  window.dispatchEvent(new CustomEvent("run:analytics", { detail: { event, ...payload } }));
}
