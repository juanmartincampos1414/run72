// Flecha con dos SVG: uno sale arriba/derecha, otro entra abajo/izquierda (4.4).
// Decorativa: el host (enlace/botón) aporta el texto accesible.
function Glyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AnimatedArrow({ className = "" }: { className?: string }) {
  return (
    <span className={`m-arrow ${className}`} aria-hidden="true">
      <Glyph />
      <Glyph />
    </span>
  );
}
