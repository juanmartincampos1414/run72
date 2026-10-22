import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnimatedArrow } from "@/components/marketing/AnimatedArrow";
import { DetailBreadcrumbs } from "@/components/marketing/DetailBreadcrumbs";
import { GradientButton } from "@/components/marketing/GradientButton";
import { GradientText } from "@/components/marketing/GradientText";
import { PointerGlow } from "@/components/marketing/PointerGlow";
import { SpecialtyVisual } from "@/components/marketing/servicios/SpecialtyVisual";
import { HOME } from "@/lib/marketing/content";
import { SOLUTIONS, getSolution } from "@/lib/marketing/solutions";
import "../servicios.css";

type Params = { especialidad: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return SOLUTIONS.map((s) => ({ especialidad: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { especialidad } = await params;
  const solution = getSolution(especialidad);
  if (!solution) return {};
  const url = `/servicios/${solution.slug}`;
  return {
    title: solution.meta.title,
    description: solution.meta.description,
    alternates: { canonical: url },
    openGraph: { title: solution.meta.title, description: solution.meta.description, url },
  };
}


export default async function SpecialtyPage({ params }: { params: Promise<Params> }) {
  const { especialidad } = await params;
  const solution = getSolution(especialidad);
  if (!solution) notFound();

  return (
    <article className={`svc-detail svc-detail--${solution.id}`}>
      <DetailBreadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Servicios", href: "/servicios" },
          { label: solution.navTitle },
        ]}
      />

      <header className="svc-hero svc-hero--detail">
        <div className="svc-hero-bg" aria-hidden="true" />
        <div className="m-container">
          <h1 className="svc-h1">{solution.h1}</h1>
          <p className="svc-bajada">{solution.bajada}</p>
          <div className="svc-hero-actions">
            <GradientButton href={solution.ctaContacto.href}>
              {solution.ctaContacto.label}
              <AnimatedArrow />
            </GradientButton>
            <GradientButton href={solution.demo.href} variant="ghost">
              {solution.demo.label}
            </GradientButton>
          </div>
        </div>
      </header>

      <section className="svc-intro" aria-label="Punto de partida">
        <div className="m-container svc-intro-grid">
          <SpecialtyVisual kind={solution.id} />
          <div className="svc-problem">
            <p className="m-eyebrow">Punto de partida</p>
            <p className="svc-problem-text">{solution.problema}</p>
          </div>
        </div>
      </section>

      <section className="m-section svc-caps" aria-labelledby="svc-caps-h">
        <div className="m-container">
          <p className="m-eyebrow">{HOME.capabilities.eyebrow}</p>
          <h2 id="svc-caps-h" className="svc-h2">
            Capacidades
          </h2>
          <ul className="svc-cap-grid">
            {solution.capacidades.map((c, i) => (
              <li key={c.title} className="svc-cap">
                <PointerGlow className="svc-cap-glow">
                  <div className="svc-cap-body">
                    <span className="svc-cap-n m-eyebrow" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="svc-h3">{c.title}</h3>
                    <p className="svc-cap-text">{c.text}</p>
                  </div>
                </PointerGlow>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="m-section svc-method" aria-labelledby="svc-method-h">
        <div className="m-container svc-method-grid">
          <div>
            <p className="m-eyebrow">Método</p>
            <h2 id="svc-method-h" className="svc-h2">
              {solution.metodo.title}
            </h2>
          </div>
          <p className="svc-method-text">{solution.metodo.text}</p>
        </div>
      </section>

      <section className="m-section svc-demo" aria-labelledby="svc-demo-h">
        <div className="m-container">
          <PointerGlow className="svc-demo-card">
            <Link href={solution.demo.href} className="svc-demo-link m-arrow-host">
              <span className="m-eyebrow svc-demo-eyebrow">Demo relacionada</span>
              <span id="svc-demo-h" className="svc-demo-title">
                {solution.demo.label}
                <AnimatedArrow className="svc-demo-arrow" />
              </span>
              <span className="svc-demo-badge">{solution.demo.badge}</span>
            </Link>
          </PointerGlow>
        </div>
      </section>

      <section className="m-section svc-faq" aria-labelledby="svc-faq-h">
        <div className="m-container svc-faq-grid">
          <h2 id="svc-faq-h" className="svc-h2">
            Preguntas frecuentes
          </h2>
          <div className="svc-faq-list">
            {solution.faqs.map((f) => (
              <details key={f.q} className="svc-faq-item">
                <summary className="svc-faq-q">
                  <span>{f.q}</span>
                  <span className="svc-faq-ico" aria-hidden="true" />
                </summary>
                <p className="svc-faq-a">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="m-section svc-closing" aria-labelledby="svc-final-h">
        <div className="m-container svc-closing-inner">
          <h2 id="svc-final-h" className="svc-question">
            {HOME.closing.muted}
          </h2>
          <p className="svc-closing-text">
            <GradientText>{HOME.closing.strong}</GradientText>
          </p>
          <GradientButton href={solution.ctaContacto.href}>
            {solution.ctaContacto.label}
            <AnimatedArrow />
          </GradientButton>
        </div>
      </section>
    </article>
  );
}
