"use client";

import { useRef, type ReactNode } from "react";

// Halo local de 220px que sigue al puntero (4.1/4.4). Usa rAF para no
// retrasar la interacción. En touch/reduced-motion el :hover simplemente
// no se dispara y el contenido se ve igual.
export function PointerGlow({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--gx", `${x}px`);
      el.style.setProperty("--gy", `${y}px`);
      frame.current = 0;
    });
  };

  return (
    <div ref={ref} className={`m-glow-host ${className}`} onPointerMove={onMove}>
      <span className="m-glow" aria-hidden="true" />
      {children}
    </div>
  );
}
