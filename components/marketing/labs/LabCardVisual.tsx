// Mini-visuales por categoría para las tarjetas de Labs. SVG liviano con
// movimiento definido en CSS (labs.css) para respetar prefers-reduced-motion.
// Volumen y profundidad con capas cálidas (ember/crema sobre walnut).

export type LabViz = "operacion" | "agente" | "integraciones" | "mapa";

export function LabCardVisual({ kind }: { kind: LabViz }) {
  return (
    <span className="lab-viz" aria-hidden="true">
      {kind === "operacion" && <Operacion />}
      {kind === "agente" && <Agente />}
      {kind === "integraciones" && <Integraciones />}
      {kind === "mapa" && <Mapa />}
    </span>
  );
}

// Sistema operativo: registros/módulos que se ordenan.
function Operacion() {
  return (
    <svg viewBox="0 0 240 120" fill="none" className="lv lv-op">
      <g className="lv-rows">
        <rect className="lv-row lv-row-a" x="24" y="20" width="150" height="13" rx="6.5" />
        <rect className="lv-row lv-row-b" x="24" y="41" width="188" height="13" rx="6.5" />
        <rect className="lv-row lv-row-c" x="24" y="62" width="112" height="13" rx="6.5" />
        <rect className="lv-row lv-row-d" x="24" y="83" width="166" height="13" rx="6.5" />
      </g>
      <g className="lv-dots">
        <circle className="lv-dot lv-dot-a" cx="14" cy="26.5" r="3.5" />
        <circle className="lv-dot lv-dot-b" cx="14" cy="47.5" r="3.5" />
        <circle className="lv-dot lv-dot-c" cx="14" cy="68.5" r="3.5" />
        <circle className="lv-dot lv-dot-d" cx="14" cy="89.5" r="3.5" />
      </g>
    </svg>
  );
}

// Agente operativo: un nodo consulta una fuente y deriva a aprobación.
function Agente() {
  return (
    <svg viewBox="0 0 240 120" fill="none" className="lv lv-ag">
      <path className="lv-link" d="M48 60 H118" />
      <path className="lv-link" d="M122 60 Q150 60 150 40 H188" />
      <path className="lv-link lv-link-dim" d="M122 60 Q150 60 150 80 H188" />
      {/* fuente */}
      <g className="lv-source">
        <ellipse cx="34" cy="48" rx="18" ry="6" />
        <path d="M16 48 V72 Q16 78 34 78 Q52 78 52 72 V48" />
      </g>
      {/* nodo agente */}
      <circle className="lv-node lv-node-main" cx="120" cy="60" r="14" />
      <circle className="lv-node-core" cx="120" cy="60" r="5" />
      {/* aprobación */}
      <g className="lv-approve">
        <rect x="190" y="30" width="34" height="20" rx="6" />
        <path className="lv-check" d="M198 40 l4 4 l8 -9" />
      </g>
      <rect className="lv-wait" x="190" y="70" width="34" height="20" rx="6" />
      {/* pulso que viaja fuente → nodo → aprobación */}
      <circle className="lv-pulse" r="3.5" cx="0" cy="0" />
    </svg>
  );
}

// Integración operativa: un evento recorre los nodos.
function Integraciones() {
  return (
    <svg viewBox="0 0 240 120" fill="none" className="lv lv-in">
      <path className="lv-track" d="M28 60 H212" />
      <g className="lv-stops">
        <circle className="lv-stop" cx="28" cy="60" r="9" />
        <circle className="lv-stop" cx="104" cy="60" r="9" />
        <circle className="lv-stop" cx="180" cy="60" r="9" />
        <circle className="lv-stop lv-stop-end" cx="212" cy="60" r="7" />
      </g>
      <rect className="lv-event" x="-7" y="53" width="14" height="14" rx="4" />
    </svg>
  );
}

// Mapa de implementación: etapas y conexiones con profundidad.
function Mapa() {
  return (
    <svg viewBox="0 0 240 120" fill="none" className="lv lv-mp">
      <g className="lv-edges">
        <path d="M40 76 L104 44" />
        <path d="M104 44 L168 70" />
        <path d="M104 44 L150 26" />
        <path d="M168 70 L206 48" />
      </g>
      <circle className="lv-m-node lv-depth-far" cx="150" cy="26" r="6" />
      <circle className="lv-m-node lv-depth-mid" cx="104" cy="44" r="9" />
      <circle className="lv-m-node lv-depth-near" cx="40" cy="76" r="11" />
      <circle className="lv-m-node lv-depth-mid" cx="168" cy="70" r="8" />
      <circle className="lv-m-node lv-depth-far" cx="206" cy="48" r="6" />
    </svg>
  );
}
