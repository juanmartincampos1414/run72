import type { Metadata } from "next";
import Link from "next/link";
import { AnimatedArrow } from "@/components/marketing/AnimatedArrow";
import { GradientButton } from "@/components/marketing/GradientButton";
import { GradientText } from "@/components/marketing/GradientText";
import { PointerGlow } from "@/components/marketing/PointerGlow";
import { SolCardGlyph } from "@/components/marketing/soluciones/SolCardGlyph";
import { VERTICALS, VERTICALS_INDEX, VERTICALS_PROMISE } from "@/lib/marketing/verticals";
import "./soluciones.css";

export const metadata: Metadata = {
  title: VERTICALS_INDEX.meta.title,
  description: VERTICALS_INDEX.meta.description,
  alternates: { canonical: "/soluciones" },
  openGraph: {
    title: VERTICALS_INDEX.meta.title,
    description: VERTICALS_INDEX.meta.description,
    url: "/soluciones",
  },
};

export default function SolucionesPage() {
  return (
    <>
      <header className="sol-hero">
        <div className="sol-hero-bg" aria-hidden="true" />
        <div className="m-container">
          <p className="m-eyebrow sol-hero-eyebrow">{VERTICALS_INDEX.eyebrow}</p>
          <h1 className="sol-h1">{VERTICALS_INDEX.h1}</h1>
          <p className="sol-bajada">{VERTICALS_INDEX.bajada}</p>
          <p className="sol-promise">{VERTICALS_PROMISE}</p>
          <div className="sol-hero-actions">
            <GradientButton href={VERTICALS_INDEX.cta.href}>
              {VERTICALS_INDEX.cta.label}
              <AnimatedArrow />
            </GradientButton>
          </div>
        </div>
      </header>

      <section className="m-section sol-cards-section" aria-label="Agentes por industria">
        <div className="m-container">
          <ul className="sol-cards">
            {VERTICALS.map((v, i) => (
              <li key={v.slug} className="sol-card">
                <PointerGlow className="sol-card-glow">
                  <Link href={v.href} className="sol-card-link m-arrow-host">
                    <span className="sol-card-top">
                      <span className="m-eyebrow" aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="sol-badge">{v.status}</span>
                    </span>
                    <span className="sol-card-title">{v.name}</span>
                    <span className="sol-card-text">{v.tagline}</span>
                    <SolCardGlyph />
                    <span className="sol-card-cta">
                      Ver el agente
                      <AnimatedArrow />
                    </span>
                  </Link>
                </PointerGlow>
              </li>
            ))}
          </ul>
          <p className="sol-note">{VERTICALS_INDEX.statusNote}</p>
        </div>
      </section>

      <section className="m-section sol-closing" aria-labelledby="sol-closing-h">
        <div className="m-container sol-closing-inner">
          <h2 id="sol-closing-h" className="sol-question">
            {VERTICALS_INDEX.closing.title}
          </h2>
          <p className="sol-closing-text">
            <GradientText>{VERTICALS_INDEX.closing.text}</GradientText>
          </p>
          <GradientButton href={VERTICALS_INDEX.cta.href}>
            {VERTICALS_INDEX.cta.label}
            <AnimatedArrow />
          </GradientButton>
        </div>
      </section>
    </>
  );
}
