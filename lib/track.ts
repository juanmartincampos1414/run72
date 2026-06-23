/** Event tracking del funnel (cliente). Fire-and-forget, nunca rompe el flujo. */

const SID_KEY = "run72_sid";

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let sid = localStorage.getItem(SID_KEY);
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem(SID_KEY, sid);
    }
    return sid;
  } catch {
    return "";
  }
}

export type EventType =
  | "cotizador_started"
  | "step_completed"
  | "service_selected"
  | "microservice_toggled"
  | "preview_viewed"
  | "preview_scored"
  | "checkout_started"
  | "payment_initiated"
  | "payment_completed";

export function track(eventType: EventType, metadata: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  try {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType,
        sessionId: getSessionId(),
        leadId: metadata.leadId ?? null,
        metadata,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* noop */
  }
}
