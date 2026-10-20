"use client";

import { useRef, useState } from "react";
import { HOME } from "@/lib/marketing/content";
import Link from "next/link";

// Proceso (5.4). Compacto y accesible: índice de etapas seleccionable por click o
// teclado (sin obligar a recorrer con scroll). Una etapa dominante a la vez.
// Conserva las 4 etapas, sus entregables y el enlace a "Cómo trabajamos en detalle".
export function StickyProcess() {
  const { eyebrow, title, steps, secondaryLink } = HOME.process;
  const [active, setActive] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let n = active;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") n = (active + 1) % steps.length;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") n = (active - 1 + steps.length) % steps.length;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = steps.length - 1;
    else return;
    e.preventDefault();
    setActive(n);
    railRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[n]?.focus();
  };

  const s = steps[active];

  return (
    <section className="m-section proc" id="proceso" aria-labelledby="process-title">
      <div className="m-container">
        <p className="m-eyebrow">{eyebrow}</p>
        <h2 id="process-title" className="proc-title">{title}</h2>

        <div className="proc-grid">
          <div className="proc-rail" role="tablist" aria-label="Pasos del proceso" ref={railRef} onKeyDown={onKeyDown}>
            {steps.map((st, i) => (
              <button
                key={st.n}
                type="button"
                role="tab"
                id={`proc-tab-${i}`}
                aria-selected={active === i}
                aria-controls="proc-panel"
                tabIndex={active === i ? 0 : -1}
                className={`proc-tab ${active === i ? "is-active" : ""}`}
                onClick={() => setActive(i)}
              >
                <span className="m-mono proc-tabn">{st.n}</span>
                <span className="proc-tabtitle">{st.title}</span>
              </button>
            ))}
          </div>

          <div className="proc-panel" id="proc-panel" role="tabpanel" aria-labelledby={`proc-tab-${active}`}>
            <span className="m-mono proc-paneln">{s.n}</span>
            <h3 className="proc-paneltitle">{s.title}</h3>
            <p className="proc-paneltext">{s.text}</p>
            <p className="m-mono proc-deliverable">Entregable · {s.deliverable}</p>
          </div>
        </div>

        <Link href={secondaryLink.href} className="proc-secondary m-mono" id="propiedad">
          {secondaryLink.label} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
