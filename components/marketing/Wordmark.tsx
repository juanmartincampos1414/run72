import Link from "next/link";

// Wordmark RUN (Switzer 600, tracking -0.04em). Vector propio editable:
// se dibuja con la familia cargada; no reutiliza el logo RUN raster.
export function Wordmark({ className = "", onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="RUN · Inicio"
      className={`m-wordmark ${className}`}
      style={{
        fontFamily: "var(--font-run-display), system-ui, sans-serif",
        fontWeight: 600,
        letterSpacing: "-0.04em",
        fontSize: "22px",
        lineHeight: 1,
        color: "var(--m-text)",
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      RUN
    </Link>
  );
}
