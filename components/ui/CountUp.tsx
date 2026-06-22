"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

/**
 * Animated number that counts up once it scrolls into view.
 * Accepts strings like "+300" or "72h" — preserves any non-digit affixes.
 */
export function CountUp({ value, duration = 1.6 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState("0");

  const match = value.match(/[\d.]+/);
  const target = match ? parseFloat(match[0]) : 0;
  const prefix = match ? value.slice(0, match.index) : value;
  const suffix = match ? value.slice((match.index ?? 0) + match[0].length) : "";

  useEffect(() => {
    if (!inView) return;
    if (target === 0) {
      setDisplay(value);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(target * eased);
      setDisplay(`${prefix}${current}${suffix}`);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration, prefix, suffix, value]);

  return (
    <span ref={ref} aria-label={value}>
      {display}
    </span>
  );
}
