"use client";

import Link from "next/link";
import { useState } from "react";
import { HOME } from "@/lib/marketing/content";

// Trabajos seleccionados (5.5). Tres filas de ancho completo; al hover/foco el
// nombre se ilumina y emerge una miniatura 16:9 dentro de la fila. En touch la
// miniatura se muestra sin requerir hover (A44).
export function WorkRows() {
  const { eyebrow, rows, allLink, demosLink } = HOME.works;
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="m-section m-works" id="experiencia" aria-labelledby="works-title">
      <div className="m-container">
        <p className="m-eyebrow">{eyebrow}</p>
        <h2 id="works-title" className="sr-only">Trabajos seleccionados</h2>
      </div>

      <div className="m-works-list" onMouseLeave={() => setOpen(null)}>
        {rows.map((row, i) => (
          <Link
            key={row.slug}
            href={`/trabajos/${row.slug}`}
            className={`m-work-row ${open === i ? "is-open" : ""}`}
            onMouseEnter={() => setOpen(i)}
            onFocus={() => setOpen(i)}
            onBlur={() => setOpen(null)}
          >
            <div className="m-container m-work-rowinner">
              <span className="m-work-text">
                <span className="m-work-meta">
                  <span className="m-work-badge m-eyebrow">{row.tag}</span>
                  {row.state && <span className="m-work-state">{row.state}</span>}
                </span>
                <span className="m-work-name">{row.title}</span>
                {row.desc && <span className="m-work-desc">{row.desc}</span>}
              </span>
              <span className="m-work-thumb" aria-hidden="true" data-i={i}>
                <span className="m-work-thumbinner" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="m-container m-works-ctas">
        <Link href={allLink.href} className="m-btn-ghost">{allLink.label}</Link>
        <Link href={demosLink.href} className="m-btn-ghost">{demosLink.label}</Link>
      </div>
      <span id="faq" aria-hidden="true" />
    </section>
  );
}
