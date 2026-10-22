"use client";

import type { PointerEvent } from "react";

// RUN Express (RUN-12): módulos de alcance cerrado que se ensamblan en un
// producto y conducen al cotizador (precio definido). Volumen por inclinación
// 3D al puntero + pulso que viaja hacia el cotizador. SVG + CSS; reduced-motion
// deja el estado quieto (ver express.css).
function onMove(e: PointerEvent<HTMLDivElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--tx", (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
  el.style.setProperty("--ty", (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
}
function onLeave(e: PointerEvent<HTMLDivElement>) {
  e.currentTarget.style.setProperty("--tx", "0");
  e.currentTarget.style.setProperty("--ty", "0");
}

const MODS: [string, string][] = [
  ["Landing", "ex-mod-a"],
  ["Web corporativa", "ex-mod-b"],
  ["Ecommerce", "ex-mod-c"],
  ["Branding", "ex-mod-d"],
];

export function ExpressModulesVisual() {
  return (
    <div className="ex-modules" onPointerMove={onMove} onPointerLeave={onLeave} aria-hidden="true">
      <svg viewBox="0 0 460 220" fill="none" className="ex-mod-svg">
        {/* módulos que se ensamblan */}
        {MODS.map(([label, cls], i) => (
          <g key={label} className={`ex-mod ${cls}`}>
            <rect x="46" y={44 + i * 32} width="168" height="26" rx="8" />
            <text x="60" y={61 + i * 32}>{label}</text>
          </g>
        ))}
        {/* enlace al cotizador */}
        <path className="ex-mod-link" d="M214 108 H300" />
        <circle className="ex-mod-pulse" r="4" />
        {/* cotizador / precio */}
        <g className="ex-mod-quote">
          <circle cx="330" cy="108" r="24" />
          <text className="ex-mod-sign" x="330" y="115" textAnchor="middle">$</text>
          <text className="ex-mod-label" x="330" y="150" textAnchor="middle">COTIZADOR</text>
          <text className="ex-mod-sub" x="330" y="166" textAnchor="middle">precio definido</text>
        </g>
      </svg>
    </div>
  );
}
