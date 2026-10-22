// Mini-recorrido del agente para las tarjetas del índice de Soluciones:
// consulta → agente → acción → resultado, con un pulso. Estructura común del
// sistema RUN. SVG + CSS; prefers-reduced-motion lo deja quieto (ver soluciones.css).
export function SolCardGlyph() {
  return (
    <span className="sol-cg" aria-hidden="true">
      <svg viewBox="0 0 170 36" fill="none" className="sol-cg-svg">
        <path className="sol-cg-track" d="M14 18 H156" />
        <circle className="sol-cg-dot" cx="14" cy="18" r="5" />
        <circle className="sol-cg-dot sol-cg-agent" cx="62" cy="18" r="8" />
        <circle className="sol-cg-core" cx="62" cy="18" r="3" />
        <circle className="sol-cg-dot" cx="110" cy="18" r="5" />
        <circle className="sol-cg-dot sol-cg-end" cx="156" cy="18" r="5" />
        <rect className="sol-cg-event" x="9" y="13" width="10" height="10" rx="3" />
      </svg>
    </span>
  );
}
