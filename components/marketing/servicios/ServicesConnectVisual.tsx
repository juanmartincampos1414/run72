"use client";

import { useEffect, useRef } from "react";
import type { PointerEvent } from "react";

// Composición protagonista del índice de Servicios: las tres capacidades
// (software a medida, agentes de IA, integración) como objetos con volumen,
// conectados por un flujo. Profundidad real (perspective + preserve-3d),
// iluminación cálida y un pulso que recorre los enlaces. Sin WebGL; entrada al
// entrar en viewport, parallax al puntero, fallback y reduced-motion (ver CSS).
export function ServicesConnectVisual() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (es) => { for (const e of es) if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function onMove(e: PointerEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--px", (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
    el.style.setProperty("--py", (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
  }
  function onLeave(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.style.setProperty("--px", "0");
    e.currentTarget.style.setProperty("--py", "0");
  }

  return (
    <div ref={ref} className="svc3x" onPointerMove={onMove} onPointerLeave={onLeave} aria-hidden="true">
      <div className="svc3x-scene">
        <div className="svc3x-stage">
          <span className="svc3x-key" />
          <span className="svc3x-link" />
          <span className="svc3x-pulse" />
          <div className="svc3x-cap svc3x-c1">
            <span className="svc3x-glyph g-soft"><i /><i /><i /></span>
            <b>Software a medida</b><em>capas y datos</em>
          </div>
          <div className="svc3x-cap svc3x-c2">
            <span className="svc3x-glyph g-core"><i /></span>
            <b>Agentes de IA</b><em>contexto · herramientas</em>
          </div>
          <div className="svc3x-cap svc3x-c3">
            <span className="svc3x-glyph g-flow"><i /><i /><i /></span>
            <b>Integración</b><em>sistemas conectados</em>
          </div>
        </div>
      </div>
    </div>
  );
}
