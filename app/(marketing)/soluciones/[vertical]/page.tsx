import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnimatedArrow } from "@/components/marketing/AnimatedArrow";
import { DetailBreadcrumbs } from "@/components/marketing/DetailBreadcrumbs";
import { GradientButton } from "@/components/marketing/GradientButton";
import { GradientText } from "@/components/marketing/GradientText";
import { PointerGlow } from "@/components/marketing/PointerGlow";
import { SolAgentJourney, type VerticalSlug } from "@/components/marketing/soluciones/SolAgentJourney";
import { VERTICALS, VERTICALS_INDEX, VERTICALS_PROMISE, getVertical } from "@/lib/marketing/verticals";
import "../soluciones.css";

type Params = { vertical: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return VERTICALS.map((v) => ({ vertical: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { vertical } = await params;
  const v = getVertical(vertical);
  if (!v) return {};
  const url = `/soluciones/${v.slug}`;
  return {
    title: v.meta.title,
    description: v.meta.description,
    alternates: { canonical: url },
    openGraph: { title: v.meta.title, description: v.meta.description, url },
  };
}

function List({ items }: { items: readonly string[] }) {
  return (
    <ul className="sol-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default async function VerticalPage({ params }: { params: Promise<Params> }) {
  const { vertical } = await params;
  const v = getVertical(vertical);
  if (!v) notFound();

  const blocks: { id: string; eyebrow: string; title: string; body: React.ReactNode }[] = [
    { id: "handles", eyebrow: "Alcance", title: "Qué conversaciones y tareas gestiona", body: <List items={v.handles} /> },
    { id: "actions", eyebrow: "Acciones", title: "Qué puede ejecutar", body: <List items={v.actions} /> },
    { id: "integrations", eyebrow: "Integraciones", title: "Con qué sistemas puede integrarse", body: <List items={v.integrations} /> },
    { id: "data", eyebrow: "Datos", title: "Qué datos necesita", body: <List items={v.data} /> },
  ];

  return (
    <article className="sol-detail">
      <DetailBreadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: VERTICALS_INDEX.eyebrow, href: "/soluciones" },
          { label: v.name },
        ]}
      />

      <header className="sol-hero sol-hero--detail">
        <div className="sol-hero-bg" aria-hidden="true" />
        <div className="m-container">
          <p className="sol-badge sol-hero-badge">{v.status}</p>
          <h1 className="sol-h1">Agente para {v.name.toLowerCase()}.</h1>
          <p className="sol-bajada">{v.tagline}</p>
          <div className="sol-hero-actions">
            <GradientButton href={VERTICALS_INDEX.cta.href}>
              {VERTICALS_INDEX.cta.label}
              <AnimatedArrow />
            </GradientButton>
          </div>
          <SolAgentJourney slug={v.slug as VerticalSlug} />
        </div>
      </header>

      <section className="sol-intro" aria-label="Problema y usuario">
        <div className="m-container sol-intro-grid">
          <div className="sol-problem">
            <p className="m-eyebrow">Qué problema resuelve</p>
            <p className="sol-problem-text">{v.problema}</p>
          </div>
          <div className="sol-user">
            <p className="m-eyebrow">Quién lo usa</p>
            <p className="sol-user-text">{v.userType}</p>
          </div>
        </div>
      </section>

      <section className="m-section sol-blocks" aria-label="Qué hace el agente">
        <div className="m-container">
          <ul className="sol-block-grid">
            {blocks.map((b) => (
              <li key={b.id} className="sol-block">
                <PointerGlow className="sol-block-glow">
                  <div className="sol-block-body">
                    <p className="m-eyebrow">{b.eyebrow}</p>
                    <h2 className="sol-h3">{b.title}</h2>
                    {b.body}
                  </div>
                </PointerGlow>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="m-section sol-split" aria-labelledby="sol-controls-h">
        <div className="m-container sol-split-grid">
          <div>
            <p className="m-eyebrow">Permisos y controles</p>
            <h2 id="sol-controls-h" className="sol-h2">
              Vos definís hasta dónde llega.
            </h2>
            <List items={v.controls} />
          </div>
          <div>
            <p className="m-eyebrow">Adaptación</p>
            <h2 className="sol-h2">Se adapta a tu operación.</h2>
            <p className="sol-split-text">{v.adapts}</p>
          </div>
        </div>
      </section>

      <section className="m-section sol-status" aria-labelledby="sol-status-h">
        <div className="m-container">
          <PointerGlow className="sol-status-card">
            <div className="sol-status-body">
              <p className="m-eyebrow">Estado</p>
              <h2 id="sol-status-h" className="sol-status-title">
                <span className="sol-badge">{v.status}</span>
                <span>En desarrollo, implementación adaptable</span>
              </h2>
              <p className="sol-status-text">{VERTICALS_PROMISE}</p>
              <p className="sol-status-text sol-status-next">
                <strong>Próximo paso.</strong> {v.nextStep}
              </p>
            </div>
          </PointerGlow>
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
    </article>
  );
}
