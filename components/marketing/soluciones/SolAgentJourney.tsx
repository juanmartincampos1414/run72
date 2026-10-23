"use client";

import { useEffect, useRef } from "react";
import type { PointerEvent } from "react";

// Recorrido operativo del agente por industria, con volumen (perspective +
// preserve-3d) e iluminación cálida: las entidades propias de la operación entran,
// el AGENTE las procesa (contexto + reglas) y produce un RESULTADO, con derivación
// a una persona. Estructura común (sistema RUN) y entidades propias de cada rubro.
// Sin WebGL; entrada al entrar en viewport, parallax, fallback y reduced-motion.

export type VerticalSlug = "restaurantes" | "hoteles" | "real-estate";

const DATA: Record<VerticalSlug, { inputs: [string, string, string]; result: string; branch: string }> = {
  restaurantes: { inputs: ["Reservas", "Pedidos", "Clientes"], result: "Costos y seguimiento", branch: "Deriva a una persona" },
  hoteles: { inputs: ["Huéspedes", "Estadías", "Atención"], result: "Operación y reputación", branch: "Deriva al equipo" },
  "real-estate": { inputs: ["Propiedades", "Consultas", "Calificación"], result: "Visitas y seguimiento", branch: "Deriva al asesor" },
};

export function SolAgentJourney({ slug }: { slug: VerticalSlug }) {
  const ref = useRef<HTMLElement>(null);
  const d = DATA[slug];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (es) => { for (const e of es) if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function onMove(e: PointerEvent<HTMLElement>) {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--px", (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
    el.style.setProperty("--py", (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
  }
  function onLeave(e: PointerEvent<HTMLElement>) {
    e.currentTarget.style.setProperty("--px", "0");
    e.currentTarget.style.setProperty("--py", "0");
  }

  return (
    <figure
      ref={ref}
      className="sol-j3"
      role="img"
      aria-label={`Recorrido del agente para ${slug.replace("-", " ")}: entra la operación (${d.inputs.join(", ")}), el agente la procesa y produce ${d.result.toLowerCase()}, con ${d.branch.toLowerCase()}.`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <span className="sol-j3-scene" aria-hidden="true">
        <span className="sol-j3-stage">
          <span className="sol-j3-key" />
          <span className="sol-j3-link" />
          <span className="sol-j3-pulse" />
          <span className="sol-j3-lab sol-j3-lab-in">OPERACIÓN</span>
          <span className="sol-j3-lab sol-j3-lab-ag">AGENTE</span>
          <span className="sol-j3-lab sol-j3-lab-res">RESULTADO</span>
          <span className="sol-j3-inputs">
            {d.inputs.map((t) => <span key={t} className="sol-j3-chip">{t}</span>)}
          </span>
          <span className="sol-j3-core"><i /></span>
          <span className="sol-j3-result"><b>{d.result}</b></span>
          <span className="sol-j3-person">{d.branch}</span>
        </span>
      </span>
      <figcaption className="sol-journey-cap m-eyebrow" aria-hidden="true">Recorrido conceptual · Datos ficticios</figcaption>
    </figure>
  );
}
