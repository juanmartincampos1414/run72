import Link from "next/link";
import { RunWordmarkSvg } from "./RunWordmarkSvg";

// Logo del header: vector definitivo del manual de marca (RUN-crema sobre oscuro),
// no una reconstrucción tipográfica. Hereda el color del tema (crema) y conserva
// su posición y jerarquía. Altura ~24px (≈ al wordmark anterior).
export function Wordmark({ className = "", onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="RUN · Inicio"
      className={`m-wordmark ${className}`}
      style={{
        color: "var(--m-text)",
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      <RunWordmarkSvg className="m-wordmark-svg" />
    </Link>
  );
}
