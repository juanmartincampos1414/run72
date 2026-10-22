"use client";

import { useEffect, useRef } from "react";
import type { PointerEvent } from "react";

// RUN Express (RUN-12): composición 3D de módulos con volumen que se ensamblan en un
// producto terminado y resuelven en un precio (→ cotizador). Profundidad real con
// perspectiva + preserve-3d, iluminación cálida (key-light ámbar, cantos ember).
// El estado por defecto es "ya ensamblado" (texto y CTA siempre legibles, respaldo
// sin JS y reduced-motion); la entrada de ensamblado se reproduce una vez al entrar
// en viewport. Parallax al puntero. Sin WebGL: liviano en móvil (ver express.css).
const MODS: { label: string; sub: string; cls: string }[] = [
  { label: "Landing", sub: "una página que convierte", cls: "ex3d-m1" },
  { label: "Web corporativa", sub: "tu empresa, completa", cls: "ex3d-m2" },
  { label: "Ecommerce", sub: "vender en línea", cls: "ex3d-m3" },
  { label: "Branding", sub: "identidad y marca", cls: "ex3d-m4" },
];

export function ExpressModulesVisual() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); }
      },
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
    <div ref={ref} className="ex3d" onPointerMove={onMove} onPointerLeave={onLeave} aria-hidden="true">
      <div className="ex3d-scene">
        <div className="ex3d-stage">
          <span className="ex3d-key" />
          {/* Producto terminado: el slab con la UI armada. */}
          <div className="ex3d-product">
            <div className="ex3d-screen">
              <span className="ex3d-bar" />
              <span className="ex3d-row ex3d-row-a" />
              <span className="ex3d-row ex3d-row-b" />
              <span className="ex3d-tiles">
                <i /><i /><i />
              </span>
              <span className="ex3d-cta" />
            </div>
          </div>
          {/* Módulos de alcance cerrado que vuelan y se encastran. */}
          {MODS.map((m) => (
            <div key={m.label} className={`ex3d-slot ${m.cls}`}>
              <div className="ex3d-mod">
                <b>{m.label}</b>
                <span>{m.sub}</span>
              </div>
            </div>
          ))}
          {/* El precio resuelve: alcance cerrado → cotizador. */}
          <div className="ex3d-price">
            <span className="ex3d-price-sign">$</span>
            <span className="ex3d-price-txt">precio definido</span>
          </div>
        </div>
      </div>
      <p className="ex3d-cap">Elegís los módulos · se arma tu producto · obtenés el precio al instante</p>
    </div>
  );
}
