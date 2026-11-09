"use client";

import { useEffect, useRef } from "react";

/**
 * Visual del hero: un "flow field" de partículas con estela, renderizado en
 * canvas. Las partículas siguen un campo de ángulos que evoluciona en el tiempo,
 * dejando trazos de luz en la paleta de RUN (cyan → blue → violet). Da la
 * sensación de un sistema vivo / IA — vanguardista, fuera de lo común.
 *
 * Performante: ~120 partículas, composición "lighter" para el glow, DPR-aware,
 * pausa con la pestaña oculta y respeta prefers-reduced-motion. `seed` hace que
 * el patrón sea único por cliente (bespoke).
 */
const PALETTE: [number, number, number][] = [
  [56, 189, 248], // brand-cyan  #38bdf8
  [99, 102, 241], // brand-blue  #6366f1
  [168, 85, 247], // brand-violet #a855f7
];

export function HeroVisual({ seed = 0, className }: { seed?: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const context = el.getContext("2d", { alpha: true });
    if (!context) return;
    const canvas: HTMLCanvasElement = el;
    const ctx: CanvasRenderingContext2D = context;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    type P = { x: number; y: number; c: [number, number, number]; sp: number };
    let parts: P[] = [];

    function resize() {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      const target = Math.round(Math.min(220, Math.max(70, (w * h) / 6000)));
      parts = Array.from({ length: target }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        c: PALETTE[(Math.random() * PALETTE.length) | 0],
        sp: 0.6 + Math.random() * 1.3,
      }));
      // Fondo inicial (ink) para que las estelas se acumulen sobre negro.
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, w, h);
    }

    // Campo de ángulos suave que evoluciona en el tiempo.
    function angle(x: number, y: number, t: number) {
      const s = 0.0016;
      return (
        (Math.sin(x * s + t * 0.00022 + seed) +
          Math.cos(y * s * 1.3 - t * 0.00017 + seed * 1.7)) *
        Math.PI
      );
    }

    function step(t: number) {
      // Desvanecer el frame anterior → estelas (fade bajo = estelas largas).
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(5,5,5,0.055)";
      ctx.fillRect(0, 0, w, h);

      // Dibujar partículas con glow aditivo.
      ctx.globalCompositeOperation = "lighter";
      for (const p of parts) {
        const a = angle(p.x, p.y, t);
        p.x += Math.cos(a) * p.sp;
        p.y += Math.sin(a) * p.sp;
        // wrap
        if (p.x < 0) p.x += w;
        else if (p.x > w) p.x -= w;
        if (p.y < 0) p.y += h;
        else if (p.y > h) p.y -= h;

        const [r, g, b] = p.c;
        // halo suave
        ctx.fillStyle = `rgba(${r},${g},${b},0.10)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.8, 0, Math.PI * 2);
        ctx.fill();
        // núcleo brillante
        ctx.fillStyle = `rgba(${r},${g},${b},0.7)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.25, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    }

    let raf = 0;
    let running = true;
    function loop(t: number) {
      if (!running) return;
      step(t);
      raf = requestAnimationFrame(loop);
    }

    function onVisibility() {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reduce) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    }

    resize();

    if (reduce) {
      // Un par de frames estáticos y pausa (sin movimiento continuo).
      for (let i = 0; i < 40; i++) step(i * 16);
    } else {
      raf = requestAnimationFrame(loop);
    }

    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) for (let i = 0; i < 40; i++) step(i * 16);
    });
    ro.observe(canvas);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [seed]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
