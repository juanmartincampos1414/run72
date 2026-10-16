// Helper seguro para disparar eventos del Meta Pixel desde el cliente.
// fbq se carga en app/layout.tsx; si por algún motivo no está (adblock, SSR),
// esta función no rompe nada.

type Fbq = (action: string, event: string, params?: Record<string, unknown>) => void;

declare global {
  interface Window {
    fbq?: Fbq;
  }
}

export function fbTrack(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    window.fbq?.("track", event, params);
  } catch {
    /* noop */
  }
}
