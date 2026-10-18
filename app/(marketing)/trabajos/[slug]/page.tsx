import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { AnimatedArrow } from "@/components/marketing/AnimatedArrow";
import { DetailBreadcrumbs } from "@/components/marketing/DetailBreadcrumbs";
import { GradientButton } from "@/components/marketing/GradientButton";
import {
  CATEGORY_LABELS,
  DEMO_LABEL,
  formatCounter,
  getWork,
  getWorkSequence,
  getWorkSlugs,
  workPath,
} from "@/lib/marketing/cases";
import "../trabajos.css";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getWorkSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) return {};
  const description = `${work.subtitle} ${work.kind === "demo" ? `${DEMO_LABEL}.` : ""}`.trim();
  return {
    title: work.title,
    description,
    alternates: { canonical: workPath(work) },
    openGraph: { title: work.title, description, url: workPath(work), type: "article" },
  };
}

function longestWord(text: string): number {
  return text.split(/\s+/).reduce((max, w) => Math.max(max, w.length), 1);
}

export default async function TrabajoPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const work = getWork(slug);
  const seq = getWorkSequence(slug);
  if (!work || !seq) notFound();

  const { next, index, total } = seq;
  const nextIndex = (index % total) + 1;
  const isDemo = work.kind === "demo";
  const categories = work.categories.map((c) => CATEGORY_LABELS[c]).join(" · ");

  const nextStyle = {
    "--work-next-chars": next.title.length,
    "--work-next-word": longestWord(next.title),
    "--work-accent": next.media.poster,
  } as CSSProperties;

  return (
    <article className="work-page work-detail" style={{ "--work-accent": work.media.poster } as CSSProperties}>
      <DetailBreadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Trabajos", href: "/trabajos" },
          { label: work.title },
        ]}
      />
      <Link href="/trabajos" className="work-close" aria-label="Cerrar y volver a Trabajos">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </Link>

      <header className="m-container work-hero">
        <p className="work-label m-mono">
          {categories} · {work.year}
        </p>
        <h1 className="work-title">{work.title}</h1>
        <p className="work-subtitle">{work.subtitle}</p>
        {isDemo && <p className="work-badge m-mono">{DEMO_LABEL}</p>}
      </header>

      <div className="m-container">
        <figure className="work-cover">
          <div className="work-poster work-poster-wide" role="img" aria-label={`Portada ilustrativa de ${work.title}`}>
            <span className="work-poster-ui" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            {isDemo && <span className="work-poster-tag m-mono">Datos ficticios</span>}
          </div>
        </figure>
      </div>

      <section className="m-container work-body" aria-labelledby="work-intro">
        <h2 id="work-intro" className="work-label m-mono">
          Introducción
        </h2>
        <p className="work-lead">{work.summary}</p>
      </section>

      <section className="m-container work-pair" aria-label="Problema y solución">
        <div className="work-pair-col">
          <h2 className="work-label m-mono">Problema</h2>
          <p className="work-text">{work.problem}</p>
        </div>
        <div className="work-pair-col">
          <h2 className="work-label m-mono">Solución</h2>
          <p className="work-text">{work.solution}</p>
        </div>
      </section>

      <section className="m-container work-scope" aria-labelledby="work-scope-h">
        <h2 id="work-scope-h" className="work-label m-mono">
          Alcance y créditos
        </h2>
        <p className="work-text">{work.scope}</p>
        <dl className="work-credits">
          <div>
            <dt className="work-label m-mono">Tipo</dt>
            <dd>{isDemo ? DEMO_LABEL : "Caso de cliente"}</dd>
          </div>
          <div>
            <dt className="work-label m-mono">Disciplina</dt>
            <dd>{categories}</dd>
          </div>
          <div>
            <dt className="work-label m-mono">Año</dt>
            <dd>{work.year}</dd>
          </div>
          <div>
            <dt className="work-label m-mono">Diseño y desarrollo</dt>
            <dd>RUN</dd>
          </div>
        </dl>
      </section>

      <section className="m-container work-cta" aria-label="Próximos pasos">
        <GradientButton href={work.demoHref}>
          {work.ctaDemoLabel} <AnimatedArrow />
        </GradientButton>
        <GradientButton href={work.ctaContacto.href} variant="ghost">
          {work.ctaContacto.label} <AnimatedArrow />
        </GradientButton>
      </section>

      <section className="work-next-wrap" aria-label="Siguiente trabajo">
        <div className="m-container">
          <Link
            href={workPath(next)}
            className="work-next"
            style={nextStyle}
            aria-label={`Siguiente trabajo: ${next.title}, ${nextIndex} de ${total}`}
          >
            <span className="work-next-top">
              <span className="work-label m-mono">Siguiente trabajo</span>
              <span className="work-next-counter m-mono" aria-hidden="true">
                {formatCounter(nextIndex, total)}
              </span>
            </span>
            <span className="work-next-name" aria-hidden="true">
              {next.title}
            </span>
          </Link>
        </div>
      </section>
    </article>
  );
}
