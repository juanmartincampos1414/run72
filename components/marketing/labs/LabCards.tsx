"use client";

import Link from "next/link";
import type { PointerEvent } from "react";
import { AnimatedArrow } from "@/components/marketing/AnimatedArrow";
import { LabCardVisual, type LabViz } from "./LabCardVisual";
import { LABS_INDEX } from "@/lib/marketing/labs";

// Linterna cálida: la posición del puntero se guarda en --lx/--ly y un resplandor
// radial la acompaña (ver labs.css). Con teclado, :focus-within enciende un
// resplandor centrado por defecto. En táctil la composición ya es visible.
function onMove(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--lx", `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
  el.style.setProperty("--ly", `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
}

// Datos que la linterna revela al pasar por el visual de cada categoría (ficticios).
const REVEAL: Record<LabViz, { t: string; x: number; y: number }[]> = {
  operacion: [{ t: "142 registros", x: 18, y: 22 }, { t: "3 pendientes", x: 58, y: 52 }, { t: "al día", x: 30, y: 78 }],
  agente: [{ t: "consulta", x: 12, y: 50 }, { t: "fuente verificada", x: 44, y: 24 }, { t: "→ aprobación", x: 62, y: 74 }],
  integraciones: [{ t: "evento", x: 12, y: 30 }, { t: "sync ✓", x: 46, y: 60 }, { t: "reintento", x: 70, y: 32 }],
  mapa: [{ t: "4 fases", x: 16, y: 26 }, { t: "12 nodos", x: 54, y: 60 }, { t: "ejemplo", x: 36, y: 82 }],
};

function LabReveal({ kind }: { kind: LabViz }) {
  return (
    <span className="lab-reveal" aria-hidden="true">
      {REVEAL[kind].map((r) => (
        <span key={r.t} style={{ left: `${r.x}%`, top: `${r.y}px` }}>{r.t}</span>
      ))}
    </span>
  );
}

type Item = { id: string; kind: string; title: string; text: string; href: string; cta: string; viz: LabViz; map?: boolean };

export function LabCards() {
  const items: Item[] = [
    ...LABS_INDEX.cards.map((c) => ({ id: c.id, kind: c.kind, title: c.title, text: c.text, href: c.href, cta: c.cta, viz: c.id as LabViz })),
    { id: "mapa", kind: "Mapa", title: LABS_INDEX.map.title, text: LABS_INDEX.map.text, href: LABS_INDEX.map.href, cta: "Abrir el mapa", viz: "mapa", map: true },
  ];

  return (
    <ul className="lab-cards-grid">
      {items.map((c) => (
        <li key={c.id}>
          <Link
            href={c.href}
            onPointerMove={onMove}
            className={`lab-index-card m-arrow-host${c.map ? " lab-index-card--map" : ""}`}
          >
            <LabCardVisual kind={c.viz} />
            <LabReveal kind={c.viz} />
            <span className="lab-index-inner">
              <span className="m-eyebrow">{c.kind}</span>
              <span className="lab-index-title">{c.title}</span>
              <p className="lab-index-text">{c.text}</p>
              <span className="lab-index-cta">
                {c.cta}
                <AnimatedArrow />
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
