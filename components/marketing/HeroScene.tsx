"use client";

import { useEffect, useRef } from "react";

// Escena propia del hero de RUN: profundidad (grilla en perspectiva), paneles
// de vidrio flotando a distintas distancias, orbes de luz y una cinta RUN
// volumétrica. Movimiento continuo + parallax por puntero/scroll.
// Con prefers-reduced-motion queda una composición estática cuidada.
export function HeroScene() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.motion = "off";
      return;
    }
    el.dataset.motion = "on";

    let raf = 0;
    let tx = 0, ty = 0, cx = 0, cy = 0;

    const onPointer = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2; // -1..1
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onScroll = () => {
      // Progreso de scroll dentro del hero → profundidad de la escena (--sy).
      const r = el.getBoundingClientRect();
      const sy = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height)));
      el.style.setProperty("--sy", sy.toFixed(3));
    };
    const loop = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      el.style.setProperty("--px", cx.toFixed(3));
      el.style.setProperty("--py", cy.toFixed(3));
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
      }
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={root} className="hs" aria-hidden="true">
      {/* aurora de fondo */}
      <div className="hs-aurora" />
      {/* grilla en perspectiva (piso con profundidad) */}
      <div className="hs-floor"><div className="hs-grid" /></div>

      {/* orbes de luz */}
      <div className="hs-orb hs-orb-1" />
      <div className="hs-orb hs-orb-2" />
      <div className="hs-orb hs-orb-3" />

      {/* paneles de vidrio a distintas profundidades */}
      <div className="hs-stage">
        <div className="hs-panel hs-panel-a">
          <span className="hs-chip" />
          <span className="hs-bar" style={{ width: "72%" }} />
          <span className="hs-bar" style={{ width: "48%" }} />
          <span className="hs-bar hs-bar-glow" style={{ width: "60%" }} />
        </div>
        <div className="hs-panel hs-panel-b">
          <span className="hs-dot" /><span className="hs-dot" /><span className="hs-dot" />
          <span className="hs-bar" style={{ width: "80%" }} />
          <span className="hs-bar" style={{ width: "40%" }} />
        </div>
        <div className="hs-panel hs-panel-c">
          <span className="hs-ring" />
        </div>

        {/* cinta RUN volumétrica */}
        <div className="hs-ribbon">
          <svg viewBox="0 0 220 220" fill="none">
            <defs>
              <linearGradient id="hsg1" x1="20" y1="30" x2="200" y2="190" gradientUnits="userSpaceOnUse">
                <stop stopColor="#18ACFF" /><stop offset="0.5" stopColor="#5583FF" /><stop offset="1" stopColor="#8960FF" />
              </linearGradient>
              <linearGradient id="hsg2" x1="30" y1="190" x2="200" y2="20" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8960FF" /><stop offset="1" stopColor="#FFD873" />
              </linearGradient>
              <filter id="hsblur" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="10" /></filter>
            </defs>
            <g filter="url(#hsblur)" opacity="0.9">
              <path d="M36 140 C 60 56, 132 48, 176 78 C 138 90, 104 110, 78 152 C 64 176, 48 168, 36 140 Z" fill="url(#hsg1)" />
              <path d="M52 174 C 92 118, 150 108, 192 126 C 158 142, 128 158, 108 186 C 94 206, 70 200, 52 174 Z" fill="url(#hsg2)" />
            </g>
            <path d="M36 140 C 60 56, 132 48, 176 78 C 138 90, 104 110, 78 152 C 64 176, 48 168, 36 140 Z" fill="url(#hsg1)" />
            <path d="M52 174 C 92 118, 150 108, 192 126 C 158 142, 128 158, 108 186 C 94 206, 70 200, 52 174 Z" fill="url(#hsg2)" />
          </svg>
        </div>
      </div>

      {/* viñeta para legibilidad del texto a la izquierda */}
      <div className="hs-veil" />
    </div>
  );
}
