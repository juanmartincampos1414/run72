import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { AnimatedArrow } from "@/components/marketing/AnimatedArrow";
import { DetailBreadcrumbs } from "@/components/marketing/DetailBreadcrumbs";
import { GradientButton } from "@/components/marketing/GradientButton";
import { GradientText } from "@/components/marketing/GradientText";
import { PointerGlow } from "@/components/marketing/PointerGlow";
import { HOME } from "@/lib/marketing/content";
import { SOLUTIONS, getSolution, type MarketingSolutionId } from "@/lib/marketing/solutions";
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

// ---------- Recursos visuales propios (16:10, paleta RUN, sin fotos de stock) ----------
// Decorativos: ilustran el tipo de demo implementada en Labs, con datos ficticios.

function SoftwareVisual() {
  const rows = [
    { w: "62%", s: "ok", t: "Al día" },
    { w: "48%", s: "wip", t: "En curso" },
    { w: "70%", s: "ok", t: "Al día" },
    { w: "40%", s: "wait", t: "Pendiente" },
  ] as const;
  return (
    <div className="svc-ui">
      <div className="svc-ui-side">
        <i className="svc-ui-logo" />
        <i className="is-on" />
        <i />
        <i />
        <i />
      </div>
      <div className="svc-ui-main">
        <div className="svc-ui-top">
          <i style={{ width: "28%" }} />
          <b />
        </div>
        <div className="svc-ui-stats">
          <div><em>Abiertos</em><strong>24</strong></div>
          <div><em>En curso</em><strong>9</strong></div>
          <div><em>Resueltos</em><strong>131</strong></div>
        </div>
        <div className="svc-ui-table">
          {rows.map((r, i) => (
            <div key={i} className="svc-ui-row">
              <i style={{ width: r.w }} />
              <span className={`svc-chip svc-chip--${r.s}`}>{r.t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AgentVisual() {
  return (
    <div className="svc-chat">
      <div className="svc-msg svc-msg--user">
        <i style={{ width: "92%" }} />
        <i style={{ width: "58%" }} />
      </div>
      <div className="svc-msg svc-msg--agent">
        <i style={{ width: "96%" }} />
        <i style={{ width: "84%" }} />
        <i style={{ width: "40%" }} />
        <div className="svc-chat-chips">
          <span className="svc-chip svc-chip--src">Fuente · Documento interno</span>
        </div>
      </div>
      <div className="svc-action">
        <span className="svc-action-k">Acción propuesta</span>
        <span className="svc-action-v">Crear tarea y derivar al equipo</span>
        <span className="svc-chip svc-chip--wait">Requiere aprobación</span>
      </div>
    </div>
  );
}

function FlowVisual() {
  const nodes = [
    { k: "Evento", s: "ok", t: "Recibido" },
    { k: "Validación", s: "ok", t: "Correcta" },
    { k: "Sincronización", s: "wip", t: "Reintento 1/3" },
  ] as const;
  return (
    <div className="svc-flow">
      <div className="svc-flow-track">
        {nodes.map((n, i) => (
          <div key={n.k} className="svc-flow-step">
            <div className="svc-node">
              <span className="svc-node-n">{String(i + 1).padStart(2, "0")}</span>
              <span className="svc-node-k">{n.k}</span>
              <span className={`svc-chip svc-chip--${n.s}`}>{n.t}</span>
            </div>
            {i < nodes.length - 1 && <span className="svc-flow-link" />}
          </div>
        ))}
      </div>
      <div className="svc-flow-log">
        <i style={{ width: "74%" }} />
        <i style={{ width: "52%" }} />
        <i style={{ width: "63%" }} />
      </div>
    </div>
  );
}

const VISUALS: Record<MarketingSolutionId, { alt: string; node: () => ReactElement }> = {
  software: {
    alt: "Ilustración conceptual de una interfaz de sistema interno con datos ficticios.",
    node: SoftwareVisual,
  },
  agentes: {
    alt: "Ilustración conceptual de una conversación con un agente, con fuente citada y una acción pendiente de aprobación.",
    node: AgentVisual,
  },
  automatizacion: {
    alt: "Ilustración conceptual de un flujo entre herramientas con estados, validación y reintento.",
    node: FlowVisual,
  },
};

export default async function SpecialtyPage({ params }: { params: Promise<Params> }) {
  const { especialidad } = await params;
  const solution = getSolution(especialidad);
  if (!solution) notFound();

  const Visual = VISUALS[solution.id];

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
          <figure className="svc-visual" role="img" aria-label={Visual.alt}>
            <div className="svc-visual-glow" aria-hidden="true" />
            <div className="svc-visual-inner" aria-hidden="true">
              <Visual.node />
            </div>
            <figcaption className="svc-visual-cap m-eyebrow" aria-hidden="true">
              Concepto · Datos ficticios
            </figcaption>
          </figure>
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
