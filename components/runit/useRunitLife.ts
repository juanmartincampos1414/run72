"use client";

import { RefObject, useEffect } from "react";

/**
 * useRunitLife — da "vida" a las figuras `.rn-char` dentro de `ref`:
 * mirada que sigue el cursor, parpadeo y glitch ocasional (con glitch fuerte
 * de vez en cuando). Respeta prefers-reduced-motion.
 */
export function useRunitLife(
  ref: RefObject<HTMLElement | null>,
  opts: { glitch?: boolean; track?: boolean } = {},
) {
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const chars = Array.from(host.querySelectorAll<SVGSVGElement>(".rn-char"));
    if (!chars.length) return;

    const trackOn = opts.track !== false && window.matchMedia("(pointer:fine)").matches;
    const glitchOn = opts.glitch !== false;

    const onPointer = (e: PointerEvent) => {
      chars.forEach((svg) => {
        const g = svg.querySelector<SVGGElement>(".rn-gaze");
        if (!g) return;
        const r = svg.getBoundingClientRect();
        if (!r.width) return;
        const ex = r.left + r.width / 2;
        const ey = r.top + r.height * 0.48;
        const dx = e.clientX - ex;
        const dy = e.clientY - ey;
        const d = Math.hypot(dx, dy) || 1;
        const m = Math.min(8, d / 18);
        g.setAttribute("transform", `translate(${((dx / d) * m).toFixed(1)},${((dy / d) * m).toFixed(1)})`);
      });
    };
    if (trackOn) window.addEventListener("pointermove", onPointer, { passive: true });

    let blinkTO = window.setTimeout(function blink() {
      chars.forEach((svg) => {
        const eye = svg.querySelector(".rn-eye");
        if (eye) {
          eye.classList.add("rn-blink");
          window.setTimeout(() => eye.classList.remove("rn-blink"), 150);
        }
      });
      blinkTO = window.setTimeout(blink, 2600 + Math.random() * 3600);
    }, 2500);

    let glitchTO = 0;
    if (glitchOn) {
      glitchTO = window.setTimeout(function glitch() {
        chars.forEach((svg) => {
          const strong = Math.random() < 0.3;
          const cls = strong ? "rn-glitch-strong" : "rn-glitch";
          svg.classList.add(cls);
          window.setTimeout(() => svg.classList.remove(cls), strong ? 420 : 300);
        });
        glitchTO = window.setTimeout(glitch, 3200 + Math.random() * 5200);
      }, 3200);
    }

    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.clearTimeout(blinkTO);
      window.clearTimeout(glitchTO);
    };
  }, [ref, opts.glitch, opts.track]);
}
