"use client";

import { useEffect, useRef } from "react";
import type { PointerEvent } from "react";

// Cómo trabajamos (RUN-18): evolución del trabajo en 3D — problema → alcance →
// construcción → operación. Cada etapa es una plataforma con volumen, más
// "construida" que la anterior (una chispa, un plano, módulos que se apilan, un
// sistema en marcha), ascendiendo con un pulso que la recorre. Sin WebGL; entrada
// al entrar en viewport, parallax, fallback y reduced-motion.
const STEPS: { label: string; cls: string }[] = [
  { label: "Problema", cls: "cw3-s1" },
  { label: "Alcance", cls: "cw3-s2" },
  { label: "Construcción", cls: "cw3-s3" },
  { label: "Operación", cls: "cw3-s4" },
];

export function ComoEvolution() {
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
    <div ref={ref} className="cw3" onPointerMove={onMove} onPointerLeave={onLeave} aria-hidden="true">
      <div className="cw3-scene">
        <div className="cw3-stage">
          <span className="cw3-key" />
          <span className="cw3-link" />
          <span className="cw3-pulse" />
          {STEPS.map(({ label, cls }) => (
            <span key={label} className={`cw3-step ${cls}`}>
              <span className="cw3-plat">
                <span className="cw3-glyph" />
              </span>
              <b>{label}</b>
            </span>
          ))}
        </div>
      </div>
      <p className="cw3-cap m-eyebrow">Problema → alcance → construcción → operación</p>
    </div>
  );
}
