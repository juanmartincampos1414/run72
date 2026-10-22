"use client";

import type { PointerEvent } from "react";

// Visual protagonista por especialidad (figura 16:10 del detalle de Servicios).
// Volumen por inclinación 3D al puntero + movimiento del mecanismo:
//  - software: capas/módulos que se ensamblan
//  - agentes: consulta → herramientas → acción, con supervisión
//  - automatización: conexiones y flujo con una secuencia legible
// SVG + CSS; prefers-reduced-motion deja el estado quieto (ver servicios.css).

export type SpecialtyKind = "software" | "agentes" | "automatizacion";

const ALT: Record<SpecialtyKind, string> = {
  software: "Esquema de un sistema a medida: módulos y capas que se ensamblan en una estructura.",
  agentes: "Esquema de un agente: una consulta usa herramientas y propone una acción que pasa por supervisión.",
  automatizacion: "Esquema de una integración: un evento recorre validación, sincronización y registro, con reintento.",
};

function onMove(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--tx", (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
  el.style.setProperty("--ty", (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
}
function onLeave(e: PointerEvent<HTMLElement>) {
  e.currentTarget.style.setProperty("--tx", "0");
  e.currentTarget.style.setProperty("--ty", "0");
}

export function SpecialtyVisual({ kind }: { kind: SpecialtyKind }) {
  return (
    <figure
      className={`svc-visual sv-tilt sv-${kind}`}
      role="img"
      aria-label={ALT[kind]}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <span className="sv-stage" aria-hidden="true">
        {kind === "software" && <SoftwareSvg />}
        {kind === "agentes" && <AgentesSvg />}
        {kind === "automatizacion" && <FlowSvg />}
      </span>
      <figcaption className="svc-visual-cap m-eyebrow" aria-hidden="true">
        Concepto · Datos ficticios
      </figcaption>
    </figure>
  );
}

function SoftwareSvg() {
  return (
    <svg viewBox="0 0 400 250" fill="none" className="sv-svg">
      <g className="sv-depth-3">
        <rect className="sv-layer sv-l-back" x="120" y="54" width="200" height="40" rx="10" />
        <text className="sv-tag" x="134" y="78">Datos</text>
      </g>
      <g className="sv-depth-2">
        <rect className="sv-layer sv-l-mid" x="96" y="102" width="224" height="40" rx="10" />
        <text className="sv-tag" x="110" y="126">Lógica de negocio</text>
      </g>
      <g className="sv-depth-1">
        <rect className="sv-layer sv-l-front" x="72" y="150" width="248" height="40" rx="10" />
        <text className="sv-tag sv-tag-on" x="86" y="174">Interfaz y roles</text>
      </g>
      <g className="sv-connectors">
        <path d="M150 94 V102 M160 142 V150" />
        <path d="M280 94 V102 M260 142 V150" />
      </g>
    </svg>
  );
}

function AgentesSvg() {
  return (
    <svg viewBox="0 0 400 250" fill="none" className="sv-svg">
      <g className="sv-edges">
        <path d="M74 125 H150" />
        <path d="M186 110 Q250 70 250 70 H250" />
        <path d="M186 125 H250" />
        <path d="M186 140 Q250 180 250 180" />
        <path className="sv-edge-out" d="M196 125 H300" />
        <path className="sv-edge-sup" d="M168 160 V196 H250" />
      </g>
      {/* consulta */}
      <g className="sv-io">
        <rect x="24" y="112" width="50" height="26" rx="7" />
        <text className="sv-tag" x="30" y="129">Consulta</text>
      </g>
      {/* herramientas */}
      <circle className="sv-tool" cx="250" cy="70" r="9" />
      <circle className="sv-tool" cx="250" cy="125" r="9" />
      <circle className="sv-tool" cx="250" cy="180" r="9" />
      <text className="sv-tag sv-tag-dim" x="268" y="74">Herramientas</text>
      {/* nodo agente */}
      <circle className="sv-node" cx="168" cy="125" r="20" />
      <circle className="sv-node-core" cx="168" cy="125" r="7" />
      {/* acción */}
      <g className="sv-io sv-io-out">
        <rect x="300" y="112" width="52" height="26" rx="7" />
        <text className="sv-tag sv-tag-on" x="307" y="129">Acción</text>
      </g>
      {/* supervisión */}
      <g className="sv-sup">
        <rect x="250" y="183" width="96" height="26" rx="7" />
        <path className="sv-sup-check" d="M258 196 l4 4 l8 -9" />
        <text className="sv-tag" x="272" y="200">Supervisión</text>
      </g>
      <circle className="sv-pulse sv-pulse-ag" r="4" />
    </svg>
  );
}

function FlowSvg() {
  const steps = [
    { x: 54, k: "Evento" },
    { x: 164, k: "Validación" },
    { x: 274, k: "Sincroniza" },
    { x: 360, k: "Registro" },
  ];
  return (
    <svg viewBox="0 0 400 250" fill="none" className="sv-svg">
      <path className="sv-track" d="M54 110 H360" />
      <path className="sv-retry" d="M274 110 q0 40 -55 40 q-55 0 -55 -40" />
      <text className="sv-tag sv-tag-dim" x="190" y="176">reintento</text>
      {steps.map((s, i) => (
        <g key={s.k}>
          <circle className={`sv-step${i === steps.length - 1 ? " sv-step-end" : ""}`} cx={s.x} cy={110} r={i === steps.length - 1 ? 9 : 11} />
          <text className="sv-tag" x={s.x} y={88} textAnchor="middle">{s.k}</text>
        </g>
      ))}
      <rect className="sv-event" x="47" y="103" width="14" height="14" rx="4" />
    </svg>
  );
}
