"use client";

import { useEffect, useRef } from "react";
import type { PointerEvent } from "react";

// Visual protagonista por especialidad (figura del detalle de Servicios), con
// volumen real (perspective + preserve-3d), iluminación cálida y un mecanismo que
// explica el contenido:
//  - software: capas (Datos → Lógica → Interfaz → Integraciones) que se organizan
//    en una arquitectura común, con un pulso de datos que las recorre.
//  - agentes: un núcleo recibe contexto, consulta herramientas y propone una acción
//    con supervisión (límite).
//  - automatización: sistemas independientes conectados por un flujo con evento,
//    validación, reintento y registro (trazabilidad).
// Sin WebGL. El estado base queda ensamblado (legible sin JS / reduced-motion); la
// entrada y los pulsos se activan al entrar en viewport. Parallax al puntero.

export type SpecialtyKind = "software" | "agentes" | "automatizacion";

const ALT: Record<SpecialtyKind, string> = {
  software: "Arquitectura de un sistema a medida: capas de datos, lógica, interfaz e integraciones organizadas en una estructura común, con volumen y profundidad.",
  agentes: "Un agente: recibe contexto, consulta herramientas (datos, API, reglas) y propone una acción que pasa por supervisión.",
  automatizacion: "Una automatización: sistemas independientes conectados por un flujo con evento, validación, reintento y registro.",
};

export function SpecialtyVisual({ kind }: { kind: SpecialtyKind }) {
  const ref = useRef<HTMLElement>(null);

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
    <figure ref={ref} className={`svc-visual sv3 sv3-${kind}`} role="img" aria-label={ALT[kind]} onPointerMove={onMove} onPointerLeave={onLeave}>
      <span className="sv3-scene" aria-hidden="true">
        <span className="sv3-stage">
          <span className="sv3-key" />
          {kind === "software" && <Software />}
          {kind === "agentes" && <Agentes />}
          {kind === "automatizacion" && <Automatizacion />}
        </span>
      </span>
      <figcaption className="svc-visual-cap m-eyebrow" aria-hidden="true">Concepto · Datos ficticios</figcaption>
    </figure>
  );
}

function Software() {
  const LAYERS: [string, string][] = [
    ["Integraciones", "sv3-p4"],
    ["Interfaz", "sv3-p3"],
    ["Lógica", "sv3-p2"],
    ["Datos", "sv3-p1"],
  ];
  return (
    <>
      {LAYERS.map(([label, cls]) => (
        <span key={label} className={`sv3-plane ${cls}`}>
          <b>{label}</b>
          <i /><i /><i />
        </span>
      ))}
      <span className="sv3-rise" />
    </>
  );
}

function Agentes() {
  return (
    <>
      <span className="sv3-ctx">contexto</span>
      <span className="sv3-tool sv3-t1"><b>Datos</b></span>
      <span className="sv3-tool sv3-t2"><b>API</b></span>
      <span className="sv3-tool sv3-t3"><b>Reglas</b></span>
      <span className="sv3-core"><i /></span>
      <span className="sv3-action"><b>Acción</b><em>con supervisión</em></span>
      <span className="sv3-wire sv3-w1" /><span className="sv3-wire sv3-w2" /><span className="sv3-wire sv3-w3" />
    </>
  );
}

function Automatizacion() {
  return (
    <>
      <span className="sv3-sys sv3-sa"><b>Sistema A</b></span>
      <span className="sv3-step sv3-valid"><b>Validación</b></span>
      <span className="sv3-sys sv3-sb"><b>Sistema B</b></span>
      <span className="sv3-log"><b>Registro</b><i /><i /><i /></span>
      <span className="sv3-pipe" />
      <span className="sv3-packet" />
      <span className="sv3-retry" />
    </>
  );
}
