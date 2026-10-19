import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { AnimatedArrow } from "@/components/marketing/AnimatedArrow";
import { GradientText } from "@/components/marketing/GradientText";
import {
  CATEGORY_LABELS,
  DEMO_LABEL,
  getDemos,
  getMvpProducts,
  getPrincipalProducts,
  workPath,
} from "@/lib/marketing/cases";
import { WorksBrowser } from "./WorksBrowser";
import "./trabajos.css";

export const metadata: Metadata = {
  title: "Trabajos",
  description:
    "Software y productos reales de RUN, y un bloque aparte de Labs con demos conceptuales de datos ficticios.",
  alternates: { canonical: "/trabajos" },
};

export default function TrabajosPage() {
  const principals = getPrincipalProducts();
  const mvps = getMvpProducts();
  const demos = getDemos();
  const total = principals.length + mvps.length;

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
        <p className="work-count m-mono">
          {total} {total === 1 ? "producto real" : "productos reales"} · {principals.length}{" "}
          {principals.length === 1 ? "principal" : "principales"} · {mvps.length}{" "}
          {mvps.length === 1 ? "MVP desarrollado" : "MVPs desarrollados"}
        </p>
      </section>

      {principals.length > 0 && (
        <section className="m-container work-index-list" aria-labelledby="work-principal-h">
          <h3 id="work-principal-h" className="work-section-title work-section-title-sm">
            Productos principales
          </h3>
          <WorksBrowser works={principals} />
        </section>
      )}

      {mvps.length > 0 && (
        <section className="m-container work-index-list" aria-labelledby="work-mvp-h">
          <h3 id="work-mvp-h" className="work-section-title work-section-title-sm">
            MVPs desarrollados
          </h3>
          <WorksBrowser works={mvps} />
        </section>
      )}

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
