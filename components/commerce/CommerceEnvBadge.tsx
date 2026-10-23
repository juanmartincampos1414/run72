import { deployEnv } from "@/lib/commerce-guard";

// Indicador visible en el recorrido comercial cuando NO corre en producción
// (Preview/local): deja claro que es entorno de prueba y pagos sandbox. En
// producción no se renderiza nada.
export function CommerceEnvBadge() {
  if (deployEnv() === "production") return null;
  return (
    <div
      role="status"
      aria-label="Entorno de prueba, pagos sandbox"
      style={{
        position: "fixed",
        bottom: 12,
        left: 12,
        zIndex: 9999,
        background: "#1b1109",
        color: "#ffd29a",
        border: "1px solid rgba(255,138,76,0.5)",
        borderRadius: 999,
        padding: "6px 12px",
        font: "600 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace",
        letterSpacing: "0.04em",
        boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
        pointerEvents: "none",
      }}
    >
      ENTORNO DE PRUEBA · SANDBOX
    </div>
  );
}
