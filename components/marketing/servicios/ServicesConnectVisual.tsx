"use client";

import type { PointerEvent } from "react";

// Composición protagonista del índice de Servicios: software (capas que se
// ensamblan), agentes (nodo con herramientas) e integración (flujo entre nodos),
// conectados, con profundidad por parallax y un pulso que recorre los enlaces.
// SVG + CSS (sin WebGL). prefers-reduced-motion deja el estado quieto (ver CSS).
function onMove(e: PointerEvent<HTMLDivElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const px = ((e.clientX - r.left) / r.width - 0.5) * 2; // -1..1
  const py = ((e.clientY - r.top) / r.height - 0.5) * 2;
  el.style.setProperty("--px", px.toFixed(3));
  el.style.setProperty("--py", py.toFixed(3));
}
function onLeave(e: PointerEvent<HTMLDivElement>) {
  e.currentTarget.style.setProperty("--px", "0");
  e.currentTarget.style.setProperty("--py", "0");
}

export function ServicesConnectVisual() {
  return (
    <div className="svc-connect" onPointerMove={onMove} onPointerLeave={onLeave} aria-hidden="true">
      <svg viewBox="0 0 760 300" fill="none" className="svc-connect-svg">
        {/* Enlaces entre capacidades */}
        <g className="scx-links">
          <path className="scx-link" d="M232 150 C300 150 300 118 372 118" />
          <path className="scx-link" d="M452 118 C540 118 500 156 556 156" />
          <path className="scx-link scx-link-dim" d="M210 178 C360 250 470 250 586 196" />
        </g>
        {/* Pulsos que recorren los enlaces */}
        <circle className="scx-pulse scx-pulse-1" r="4" />
        <circle className="scx-pulse scx-pulse-2" r="4" />

        {/* Software: capas que se ensamblan */}
        <g className="scx-group scx-soft">
          <rect className="scx-layer scx-layer-3" x="96" y="108" width="120" height="26" rx="8" />
          <rect className="scx-layer scx-layer-2" x="84" y="130" width="132" height="26" rx="8" />
          <rect className="scx-layer scx-layer-1" x="72" y="152" width="144" height="26" rx="8" />
          <text className="scx-label" x="144" y="206">SOFTWARE</text>
        </g>

        {/* Agentes: nodo con herramientas y supervisión */}
        <g className="scx-group scx-ag">
          <path className="scx-tool" d="M412 118 L380 86" />
          <path className="scx-tool" d="M412 118 L452 92" />
          <path className="scx-tool" d="M412 118 L452 146" />
          <circle className="scx-tool-dot" cx="380" cy="86" r="6" />
          <circle className="scx-tool-dot" cx="452" cy="92" r="6" />
          <circle className="scx-tool-dot scx-approve" cx="452" cy="146" r="7" />
          <circle className="scx-node" cx="412" cy="118" r="22" />
          <circle className="scx-node-core" cx="412" cy="118" r="8" />
          <text className="scx-label" x="412" y="206">AGENTES</text>
        </g>

        {/* Integración: flujo entre nodos */}
        <g className="scx-group scx-int">
          <path className="scx-flow" d="M576 156 L634 124 L634 188 L692 156" />
          <circle className="scx-flow-node" cx="576" cy="156" r="8" />
          <circle className="scx-flow-node" cx="634" cy="124" r="8" />
          <circle className="scx-flow-node" cx="634" cy="188" r="8" />
          <circle className="scx-flow-node scx-flow-end" cx="692" cy="156" r="7" />
          <text className="scx-label" x="634" y="230">INTEGRACIÓN</text>
        </g>
      </svg>
    </div>
  );
}
