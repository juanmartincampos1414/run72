"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type Props = {
  lines: ReactNode[];
  as?: ElementType;
  className?: string;
  lineClassName?: string;
  stagger?: number; // ms
};

// Reveal por líneas con máscara (4.4). SSR: texto visible sin JS; las máscaras
// y el estado inicial oculto se activan solo tras hidratar + observar.
export function WordReveal({ lines, as: Tag = "div", className = "", lineClassName = "", stagger = 45 }: Props) {
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
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<HTMLElement>}
      className={`m-reveal ${className}`}
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
