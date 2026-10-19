"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type Props = {
  lines: ReactNode[];
  as?: ElementType;
  className?: string;
  lineClassName?: string;
  stagger?: number; // ms
  // mask=true: revelado con máscara (overflow hidden). mask=false: fundido sin
  // recorte (para titulares grandes donde el clip puede comer ascendentes/descendentes).
  mask?: boolean;
};

// Reveal por líneas con máscara (4.4). SSR: texto visible sin JS; las máscaras
// y el estado inicial oculto se activan solo tras hidratar + observar.
export function WordReveal({ lines, as: Tag = "div", className = "", lineClassName = "", stagger = 45, mask = true }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setReady(false);
      setShown(true);
      return;
    }
    setReady(true);

    // Si ya está en viewport al montar (p. ej. el hero, o al volver a la Home),
    // mostrar de inmediato para que el texto nunca quede oculto.
    const rect = el.getBoundingClientRect();
    const inView = rect.top < (window.innerHeight || 0) && rect.bottom > 0;
    if (inView) {
      const raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    // Red de seguridad: si el observer no dispara, mostrar igual.
    const safety = window.setTimeout(() => setShown(true), 700);
    return () => {
      io.disconnect();
      window.clearTimeout(safety);
    };
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<HTMLElement>}
      className={`m-reveal ${mask ? "" : "m-reveal--plain"} ${className}`}
      data-ready={ready ? "true" : undefined}
      data-shown={shown ? "true" : undefined}
    >
      {lines.map((line, i) => (
        <span key={i} className={`m-reveal-line ${lineClassName}`}>
          <span
            className="m-reveal-inner"
            style={ready ? { transitionDelay: `${i * stagger}ms` } : undefined}
          >
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
