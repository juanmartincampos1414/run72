"use client";

import type { PointerEvent } from "react";

// Recorrido operativo del agente por industria: consulta → agente (contexto) →
// acción → resultado, con derivación a una persona. Estructura común (sistema
// RUN) y etiquetas propias de cada industria. Volumen por inclinación 3D al
// puntero + pulso que recorre el flujo. SVG + CSS; reduced-motion lo deja quieto.

export type VerticalSlug = "restaurantes" | "hoteles" | "real-estate";

const JOURNEY: Record<VerticalSlug, { steps: [string, string, string, string]; branch: string }> = {
  restaurantes: { steps: ["Reserva / grupo", "Reglas del local", "Toma la reserva", "Confirma y avisa"], branch: "Deriva a una persona" },
  hoteles: { steps: ["Disponibilidad", "Tarifas e info", "Registra pedido", "Atiende y deriva"], branch: "Deriva al equipo" },
  "real-estate": { steps: ["Lead entrante", "Califica interés", "Coordina visita", "Registra en CRM"], branch: "Deriva al asesor" },
};

const STAGES = ["CONSULTA", "AGENTE", "ACCIÓN", "RESULTADO"] as const;

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

export function SolAgentJourney({ slug }: { slug: VerticalSlug }) {
  const j = JOURNEY[slug];
  const xs = [70, 210, 350, 470];
  return (
    <figure
      className="sol-journey sv-tilt"
      role="img"
      aria-label={`Recorrido del agente para ${slug.replace("-", " ")}: ${STAGES.map((s, i) => `${s.toLowerCase()} (${j.steps[i]})`).join(", ")}, con ${j.branch.toLowerCase()}.`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <span className="sol-journey-stage" aria-hidden="true">
        <svg viewBox="0 0 540 234" fill="none" className="sv-svg">
          <path className="sj-track" d="M70 118 H470" />
          {/* derivación a persona */}
          <path className="sj-branch" d="M210 139 V192 H320" />
          <g className="sj-person">
            <circle cx="332" cy="192" r="6" />
            <text className="sv-tag sv-tag-dim" x="346" y="196">{j.branch}</text>
          </g>

          {xs.map((x, i) => (
            <g key={i}>
              <text className="sv-tag sj-stage" x={x} y={66} textAnchor="middle">{STAGES[i]}</text>
              {i === 1 ? (
                <>
                  <circle className="sj-node sj-agent" cx={x} cy={118} r="20" />
                  <circle className="sj-core" cx={x} cy={118} r="7" />
                </>
              ) : (
                <circle className={`sj-node${i === 3 ? " sj-node-end" : ""}`} cx={x} cy={118} r={i === 3 ? 9 : 11} />
              )}
              <text className="sv-tag sj-label" x={x} y={156} textAnchor="middle">{j.steps[i]}</text>
            </g>
          ))}

          <rect className="sv-event sj-event" x="63" y="111" width="13" height="13" rx="4" />
        </svg>
      </span>
      <figcaption className="sol-journey-cap m-eyebrow" aria-hidden="true">Recorrido conceptual · Datos ficticios</figcaption>
    </figure>
  );
}
