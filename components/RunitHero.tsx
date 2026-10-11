"use client";

import { useRef } from "react";
import { RunitFigure } from "./runit/RunitFigure";
import { useRunitLife } from "./runit/useRunitLife";

/** Runit en grande para el hero: flota con aura, anillo y chispas en órbita. */
export function RunitHero() {
  const ref = useRef<HTMLDivElement>(null);
  useRunitLife(ref);

  return (
    <div ref={ref} className="rn-hero" aria-hidden="true">
      <span className="rn-hero-ring" />
      <span className="rn-hero-aura" />
      <span className="rn-hero-orbit o1">
        <i />
      </span>
      <span className="rn-hero-orbit o2">
        <i />
      </span>
      <span className="rn-hero-float">
        <RunitFigure idp="rh" />
      </span>
    </div>
  );
}
