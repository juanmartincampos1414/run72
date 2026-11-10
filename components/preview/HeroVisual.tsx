"use client";

import { useEffect, useRef } from "react";

/**
 * Visual del hero: un MONITOR ECG / electrocardiograma. Varios trazos corren con
 * el latido (complejo PQRST) sobre una grilla tenue de monitor, con un pulso
 * brillante en el borde de avance. Evoca salud / medicina y a la vez se siente
 * vanguardista. En la paleta del cliente (`palette`), o la de RUN por defecto.
 *
 * Performante: pocas líneas, glow con shadowBlur, DPR-aware, pausa con la
 * pestaña oculta y respeta prefers-reduced-motion. `seed` lo hace único por lead.
 */
const RUN_PALETTE: [number, number, number][] = [
  [56, 189, 248], // brand-cyan  #38bdf8
  [99, 102, 241], // brand-blue  #6366f1
  [168, 85, 247], // brand-violet #a855f7
];

/** Complejo ECG (PQRST) para una fase ph en [0,1) por latido. */
function ecg(ph: number): number {
  const g = (mu: number, sig: number) => Math.exp(-((ph - mu) * (ph - mu)) / (2 * sig * sig));
  let v = 0;
  v += 0.14 * g(0.14, 0.018); // P
  v -= 0.16 * g(0.255, 0.007); // Q
  v += 1.0 * g(0.285, 0.008); // R (pico)
  v -= 0.26 * g(0.315, 0.008); // S
  v += 0.3 * g(0.56, 0.032); // T
  return v;
}

export function HeroVisual({
  seed = 0,
  palette,
  className,
}: {
  seed?: number;
  palette?: [number, number, number][];
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const context = el.getContext("2d", { alpha: true });
    if (!context) return;
    const canvas: HTMLCanvasElement = el;
    const ctx: CanvasRenderingContext2D = context;

    const COLORS = palette && palette.length >= 2 ? palette : RUN_PALETTE;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    // Trazos ECG: cada uno a una altura, color y ritmo (beat) distinto.
    type Trace = { y: number; amp: number; beat: number; speed: number; phase: number; c: [number, number, number] };
    let traces: Trace[] = [];

    function build() {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      const n = w < 640 ? 2 : 3;
      traces = Array.from({ length: n }, (_, i) => {
        const t = i / (n - 1); // n es 2 o 3
        return {
          y: h * (0.3 + 0.42 * t), // repartidos en la banda central-baja
          amp: h * (0.17 - 0.03 * i),
          beat: 230 + i * 46 + (seed % 3) * 14, // ancho de un latido en px
          speed: 0.05 + i * 0.012, // fases/seg
          phase: (seed * 0.37 + i * 0.3) % 1,
          c: COLORS[i % COLORS.length],
        };
      });
    }

    function grid() {
      const [r, g, b] = COLORS[1] ?? COLORS[0];
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${r},${g},${b},0.045)`;
      const gap = 30;
      ctx.beginPath();
      for (let x = 0; x <= w; x += gap) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y <= h; y += gap) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();
    }

    function drawTrace(tr: Trace, time: number) {
      const [r, g, b] = tr.c;
      const off = tr.phase + time * tr.speed; // corrimiento del latido
      const stepPx = 3;
      // Trazo con glow aditivo + gradiente de opacidad (más brillante a la derecha).
      ctx.globalCompositeOperation = "lighter";
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.shadowColor = `rgba(${r},${g},${b},0.9)`;
      ctx.shadowBlur = 14;

      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, `rgba(${r},${g},${b},0.04)`);
      grad.addColorStop(0.65, `rgba(${r},${g},${b},0.5)`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0.95)`);
      ctx.strokeStyle = grad;

      ctx.beginPath();
      let headY = tr.y;
      for (let x = 0; x <= w; x += stepPx) {
        const ph = (x / tr.beat + off) % 1;
        const y = tr.y - ecg(((ph % 1) + 1) % 1) * tr.amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        headY = y;
      }
      ctx.stroke();

      // Pulso brillante en el borde de avance.
      ctx.shadowBlur = 22;
      ctx.fillStyle = `rgba(${r},${g},${b},1)`;
      ctx.beginPath();
      ctx.arc(w - 2, headY, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "source-over";
    }

    function frame(time: number) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, w, h);
      grid();
      for (const tr of traces) drawTrace(tr, time);
    }

    let raf = 0;
    let running = true;
    let start = 0;
    function loop(ts: number) {
      if (!running) return;
      if (!start) start = ts;
      frame((ts - start) / 1000);
      raf = requestAnimationFrame(loop);
    }

    function onVisibility() {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reduce) {
        running = true;
        start = 0;
        raf = requestAnimationFrame(loop);
      }
    }

    build();
    if (reduce) {
      frame(0);
    } else {
      raf = requestAnimationFrame(loop);
    }

    const ro = new ResizeObserver(() => {
      build();
      if (reduce) frame(0);
    });
    ro.observe(canvas);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [seed, palette]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
