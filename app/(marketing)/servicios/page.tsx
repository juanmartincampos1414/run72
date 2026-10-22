import type { Metadata } from "next";
import Link from "next/link";
import { AnimatedArrow } from "@/components/marketing/AnimatedArrow";
import { GradientButton } from "@/components/marketing/GradientButton";
import { GradientText } from "@/components/marketing/GradientText";
import { PointerGlow } from "@/components/marketing/PointerGlow";
import { ServicesConnectVisual } from "@/components/marketing/servicios/ServicesConnectVisual";
import { SERVICES_INDEX, SOLUTIONS } from "@/lib/marketing/solutions";
import "./servicios.css";

export const metadata: Metadata = {
  title: SERVICES_INDEX.meta.title,
  description: SERVICES_INDEX.meta.description,
  alternates: { canonical: "/servicios" },
  openGraph: {
    title: SERVICES_INDEX.meta.title,
    description: SERVICES_INDEX.meta.description,
    url: "/servicios",
  },
};

export default function ServiciosPage() {
  return (
    <>
      <header className="svc-hero svc-hero--index">
        <div className="svc-hero-bg" aria-hidden="true" />
        <div className="m-container">
          <p className="m-eyebrow svc-hero-eyebrow">Servicios</p>
          <h1 className="svc-h1">{SERVICES_INDEX.h1}</h1>
          <p className="svc-bajada">{SERVICES_INDEX.bajada}</p>
          <ServicesConnectVisual />
        </div>
      </header>

      <section className="m-section svc-bands-section" aria-label="Especialidades">
        <div className="m-container">
          <ul className="svc-bands">
            {SOLUTIONS.map((s, i) => (
              <li key={s.id} className="svc-band">
                <PointerGlow className="svc-band-glow">
                  <Link href={s.href} className="svc-band-link m-arrow-host">
                    <span className="svc-band-n m-eyebrow" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="svc-band-main">
                      <span className="svc-band-title">{s.navTitle}</span>
                      <span className="svc-band-text">{s.description}</span>
                      <span className="svc-band-cta">
                        Ver especialidad
                        <AnimatedArrow />
                      </span>
                    </div>
                    <div className="svc-band-ex">
                      <span className="m-eyebrow">Ejemplos</span>
                      <ul className="svc-band-exlist">
                        {s.ejemplos.map((e) => (
                          <li key={e}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  </Link>
                </PointerGlow>
              </li>
            ))}
            <li className="svc-band svc-band--express">
              <PointerGlow className="svc-band-glow">
                <Link href="/express" className="svc-band-link m-arrow-host">
                  <span className="svc-band-n m-eyebrow" aria-hidden="true">RUN Express</span>
                  <div className="svc-band-main">
                    <span className="svc-band-title">¿Ya sabés qué necesitás? RUN Express</span>
                    <span className="svc-band-text">Webs, ecommerce e identidad con alcance y precio definidos, mediante un proceso simplificado y un cotizador.</span>
                    <span className="svc-band-cta">
                      Ver RUN Express
                      <AnimatedArrow />
                    </span>
                  </div>
                  <div className="svc-band-ex">
                    <span className="m-eyebrow">Incluye</span>
                    <ul className="svc-band-exlist">
                      <li>Landing y webs corporativas</li>
                      <li>Ecommerce de alcance cerrado</li>
                      <li>Branding e identidad</li>
                    </ul>
                  </div>
                </Link>
              </PointerGlow>
            </li>
          </ul>
          <p className="svc-note">Capacidades propuestas; cada proyecto se define según el proceso y los datos de tu empresa. RUN Express es la vía para productos estandarizados con alcance y precio cerrados.</p>
        </div>
      </section>

      <section className="m-section svc-closing" aria-labelledby="svc-closing-q">
        <div className="m-container svc-closing-inner">
          <h2 id="svc-closing-q" className="svc-question">
            {SERVICES_INDEX.closing.question}
          </h2>
          <p className="svc-closing-text">
            <GradientText>{SERVICES_INDEX.closing.text}</GradientText>
          </p>
          <GradientButton href={SERVICES_INDEX.closing.cta.href}>
            {SERVICES_INDEX.closing.cta.label}
            <AnimatedArrow />
          </GradientButton>
        </div>
      </section>
    </>
  );
}
