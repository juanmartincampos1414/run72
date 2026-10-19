import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { AnimatedArrow } from "@/components/marketing/AnimatedArrow";
import { GradientText } from "@/components/marketing/GradientText";
import { CATEGORY_LABELS, DEMO_LABEL, getDemos, getProducts, workPath } from "@/lib/marketing/cases";
import { WorksBrowser } from "./WorksBrowser";
import "./trabajos.css";

export const metadata: Metadata = {
  title: "Trabajos",
  description:
    "Software y productos reales de RUN, y un bloque aparte de Labs con demos conceptuales de datos ficticios.",
  alternates: { canonical: "/trabajos" },
};

export default function TrabajosPage() {
  const products = getProducts();
  const demos = getDemos();

  return (
    <div className="work-page">
      <section className="m-container work-index-head">
        <h1 className="work-index-title">
          <GradientText>Trabajos</GradientText>
        </h1>
        <p className="work-index-lede">
          Primero, los productos reales. Después, en Labs, demos conceptuales con datos ficticios que muestran cómo
          pensamos un sistema, un agente y una integración.
        </p>
      </section>

      <section className="m-container work-index-list" aria-labelledby="work-products-h">
        <h2 id="work-products-h" className="work-section-title">
          Software y productos reales
        </h2>
        <WorksBrowser works={products} />
      </section>

      <section className="m-container work-labs" aria-labelledby="work-labs-h">
        <div className="work-labs-head">
          <h2 id="work-labs-h" className="work-section-title work-section-title-sm">
            Labs · demos conceptuales
          </h2>
          <p className="work-labs-note">
            No son clientes ni productos en producción: son ejemplos propios con datos ficticios, cada uno con su demo
            funcional en Labs.
          </p>
        </div>
        <ul className="work-demo-grid" role="list">
          {demos.map((w) => (
            <li key={w.slug} className="work-demo-item">
              <Link
                href={workPath(w)}
                className="work-card work-card-demo"
                style={{ "--work-accent": w.media.poster } as CSSProperties}
              >
                <span className="work-card-body">
                  <span className="work-badge m-mono">{DEMO_LABEL}</span>
                  <span className="work-card-title">{w.title}</span>
                  <span className="work-card-meta m-mono">
                    {w.categories.map((c) => CATEGORY_LABELS[c]).join(" · ")}
                    {w.year ? ` · ${w.year}` : ""}
                  </span>
                  <span className="work-card-summary">{w.summary}</span>
                  <span className="work-card-link m-mono">
                    Ver demo <AnimatedArrow />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
