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
  PENDING,
  formatCounter,
  getPendingFields,
  getWork,
  getWorkSequence,
  getWorkSlugs,
  isPending,
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

/** Texto de ficha: los campos sin validar se muestran tal cual, atenuados. */
function Field({ value }: { value: string | undefined }) {
  const text = value || PENDING;
  return (
    <p className="work-text work-field" data-pending={isPending(text)}>
      {text}
    </p>
  );
}

function FieldList({ items }: { items: string[] | undefined }) {
  const list = items?.length ? items : [PENDING];
  return (
    <ul className="work-list" role="list">
      {list.map((item, i) => (
        <li key={`${i}-${item}`} className="work-text work-field" data-pending={isPending(item)}>
          {item}
        </li>
      ))}
    </ul>
  );
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
  const isProduct = work.kind === "producto";
  const pendingFields = getPendingFields(work);
  const typeLabel = isDemo ? DEMO_LABEL : isProduct ? "Producto real" : "Caso de cliente";
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
          {categories}
          {work.year ? ` · ${work.year}` : ""}
        </p>
        <h1 className="work-title">{work.title}</h1>
        <p className="work-subtitle">{work.subtitle}</p>
        {isDemo && <p className="work-badge m-mono">{DEMO_LABEL}</p>}
        {isProduct && pendingFields.length > 0 && (
          <p className="work-badge m-mono">Contenido en validación</p>
        )}
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

      {isProduct ? (
        <>
      <section className="m-container work-pair" aria-label="Contexto y usuario">
        <div className="work-pair-col">
          <h2 className="work-label m-mono">Contexto</h2>
          <Field value={work.context} />
        </div>
        <div className="work-pair-col">
          <h2 className="work-label m-mono">Tipo de usuario</h2>
          <Field value={work.userType} />
        </div>
      </section>

      <section className="m-container work-block" aria-labelledby="work-built-h">
        <h2 id="work-built-h" className="work-label m-mono">
          Qué construyó RUN
        </h2>
        <Field value={work.built} />
      </section>

      <section className="m-container work-block" aria-labelledby="work-features-h">
        <h2 id="work-features-h" className="work-label m-mono">
          Funcionalidades
        </h2>
        <FieldList items={work.features} />
      </section>

      <section className="m-container work-block" aria-labelledby="work-flow-h">
        <h2 id="work-flow-h" className="work-label m-mono">
          Flujo
        </h2>
        <Field value={work.flow} />
      </section>

      <section className="m-container work-block" aria-labelledby="work-stack-h">
        <h2 id="work-stack-h" className="work-label m-mono">
          Arquitectura y stack
        </h2>
        <dl className="work-stack">
          <div>
            <dt className="work-label m-mono">Arquitectura</dt>
            <dd data-pending={isPending(work.stack?.architecture ?? PENDING)}>{work.stack?.architecture ?? PENDING}</dd>
          </div>
          <div>
            <dt className="work-label m-mono">Tecnologías</dt>
            <dd data-pending={isPending(work.stack?.technologies ?? PENDING)}>{work.stack?.technologies ?? PENDING}</dd>
          </div>
          <div>
            <dt className="work-label m-mono">Integraciones</dt>
            <dd data-pending={isPending(work.stack?.integrations ?? PENDING)}>{work.stack?.integrations ?? PENDING}</dd>
          </div>
        </dl>
      </section>

      <section className="m-container work-block" aria-labelledby="work-decisions-h">
        <h2 id="work-decisions-h" className="work-label m-mono">
          Decisiones
        </h2>
        <Field value={work.decisions} />
      </section>

      <section className="m-container work-pair" aria-label="Estado y evidencia">
        <div className="work-pair-col">
          <h2 className="work-label m-mono">Estado</h2>
          <Field value={work.status} />
        </div>
        <div className="work-pair-col">
          <h2 className="work-label m-mono">Evidencia</h2>
          <FieldList items={work.evidence} />
        </div>
      </section>

      <section className="m-container work-block" aria-labelledby="work-media-h">
        <h2 id="work-media-h" className="work-label m-mono">
          Capturas y medios
        </h2>
        <div className="work-media-placeholder" data-pending="true">
          <p className="work-text work-field" data-pending="true">
            {work.media.images?.length ? `${work.media.images.length} medios aprobados` : `Capturas reales: ${PENDING}`}
          </p>
        </div>
      </section>

      {pendingFields.length > 0 && (
        <section className="m-container work-block" aria-label="Contenido en validación">
          <p className="work-note">
            <strong>Contenido en validación.</strong> Campos pendientes: {pendingFields.join(", ")}.
          </p>
        </section>
      )}

        </>
      ) : (
        <>
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
        </>
      )}

      <section className="m-container work-scope" aria-labelledby="work-scope-h">
        <h2 id="work-scope-h" className="work-label m-mono">
          {isProduct ? "Créditos" : "Alcance y créditos"}
        </h2>
        {!isProduct && <p className="work-text">{work.scope}</p>}
        <dl className="work-credits">
          <div>
            <dt className="work-label m-mono">Tipo</dt>
            <dd>{typeLabel}</dd>
          </div>
          <div>
            <dt className="work-label m-mono">Disciplina</dt>
            <dd>{categories}</dd>
          </div>
          <div>
            <dt className="work-label m-mono">Año</dt>
            <dd data-pending={work.year === null}>{work.year ?? PENDING}</dd>
          </div>
          <div>
            <dt className="work-label m-mono">{isProduct ? "Rol de RUN" : "Diseño y desarrollo"}</dt>
            <dd data-pending={isProduct}>{isProduct ? PENDING : "RUN"}</dd>
          </div>
        </dl>
      </section>

      <section className="m-container work-cta" aria-label="Próximos pasos">
        {work.demoHref && work.ctaDemoLabel && (
          <GradientButton href={work.demoHref}>
            {work.ctaDemoLabel} <AnimatedArrow />
          </GradientButton>
        )}
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
