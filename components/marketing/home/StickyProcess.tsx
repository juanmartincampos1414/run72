"use client";

import { useEffect, useRef, useState } from "react";
import { HOME } from "@/lib/marketing/content";
import Link from "next/link";

// Proceso (5.4 + 4.4). Escritorio: escena sticky 100dvh sobre envolvente
// 500dvh con 4 pasos y botones. Móvil / reduced-motion: lista estática
// completa con scroll nativo.
export function StickyProcess() {
  const { eyebrow, title, steps, secondaryLink } = HOME.process;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [p, setP] = useState(0);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 1024px)");
    const update = () => setInteractive(desktop.matches && !reduce.matches);
    update();
    reduce.addEventListener("change", update);
    desktop.addEventListener("change", update);
    return () => {
      reduce.removeEventListener("change", update);
      desktop.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!interactive) return;
    const el = wrapRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = el.getBoundingClientRect();
        const recorrido = el.offsetHeight - window.innerHeight;
        const scrolled = -rect.top;
        const prog = Math.min(1, Math.max(0, recorrido > 0 ? scrolled / recorrido : 0));
        setP(prog);
        setActive(Math.min(steps.length - 1, Math.floor(prog * steps.length)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [interactive, steps.length]);

  const goTo = (i: number) => {
    const el = wrapRef.current;
    if (!el || !interactive) return;
    const recorrido = el.offsetHeight - window.innerHeight;
    const center = (i + 0.5) / steps.length; // .125, .375, .625, .875
    const top = el.offsetTop + recorrido * center;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <section className="m-section m-process" id="proceso" aria-labelledby="process-title">
      <div className="m-container">
        <p className="m-eyebrow">{eyebrow}</p>
        <h2 id="process-title" className="m-process-title">{title}</h2>
      </div>

      {/* Envolvente: alta solo en modo interactivo (desktop) */}
      <div ref={wrapRef} className={`m-process-wrap ${interactive ? "is-interactive" : ""}`}>
        <div className="m-process-scene">
          <div className="m-container m-process-cols">
            <div className="m-process-rail" role="tablist" aria-label="Pasos del proceso">
              <span className="m-process-track" aria-hidden="true">
                <span className="m-process-fill" style={interactive ? { transform: `scaleY(${p})` } : undefined} />
              </span>
              {steps.map((s, i) => (
                <button
                  key={s.n}
                  type="button"
                  role="tab"
                  aria-selected={active === i}
                  className={`m-process-tab ${active === i ? "is-active" : ""}`}
                  onClick={() => goTo(i)}
                >
                  <span className="m-mono m-process-tabn">{s.n}</span>
                  <span className="m-process-tabtitle">{s.title}</span>
                </button>
              ))}
            </div>

            <div className="m-process-panels">
              {steps.map((s, i) => (
                <article
                  key={s.n}
                  className={`m-process-panel ${interactive ? (active === i ? "is-active" : "is-dim") : "is-static"}`}
                  aria-hidden={interactive ? active !== i : undefined}
                >
                  <span className="m-mono m-process-paneln">{s.n}</span>
                  <h3 className="m-process-paneltitle">{s.title}</h3>
                  <p className="m-process-paneltext">{s.text}</p>
                  <p className="m-process-deliverable m-mono">Entregable · {s.deliverable}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="m-container" id="propiedad">
        <Link href={secondaryLink.href} className="m-process-secondary m-mono m-arrow-host">
          {secondaryLink.label}
          <span className="m-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <svg viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        </Link>
      </div>
    </section>
  );
}
