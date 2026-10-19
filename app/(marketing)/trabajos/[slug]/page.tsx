import type { Metadata } from "next";
import Image from "next/image";
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

const MVP_EVIDENCE_COPY =
  "MVP documentado a partir de su código, arquitectura y recorridos funcionales. Actualmente no dispone de un entorno público demostrativo.";
const OPERATIONAL_EVIDENCE_COPY =
  "Producto operativo documentado a partir de su código, arquitectura y recorridos. Capturas con datos reales no se publican por privacidad.";
/** Productos sin evidencia pública (sin URL): se verifican desde el repositorio y su entorno local. */
const PRIVATE_EVIDENCE_COPY =
  "Aplicación funcional verificada desde el repositorio y su entorno local. Las capturas muestran la interfaz real con una organización demostrativa y datos anonimizados.";

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

  const { next, prev, index, total } = seq;
  const nextIndex = (index % total) + 1;
  const prevIndex = ((index - 2 + total) % total) + 1;
  const isDemo = work.kind === "demo";
  const isProduct = work.kind === "producto";
  const pendingFields = getPendingFields(work);
  const isMvp = work.section === "mvp";
  const hasPublicEvidence = Boolean(work.evidence?.length);
  const productTypeLabel =
    work.section === "mvp-uso" ? "MVP funcional en uso privado" : isMvp ? "MVP desarrollado" : "Producto operativo";
  const typeLabel = isDemo ? DEMO_LABEL : isProduct ? productTypeLabel : "Caso de cliente";
  const gallery = work.media.gallery ?? [];
  const cover = gallery[0];
  const categories = work.categories.map((c) => CATEGORY_LABELS[c]).join(" · ");

  const prevStyle = {
    "--work-next-chars": prev.title.length,
    "--work-next-word": longestWord(prev.title),
    "--work-accent": prev.media.poster,
  } as CSSProperties;

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
        {isProduct && work.statusLabel && <p className="work-badge m-mono">{work.statusLabel}</p>}
        {isProduct && pendingFields.length > 0 && (
          <p className="work-badge m-mono">Contenido en validación</p>
        )}
      </header>

      <div className="m-container">
        <figure className="work-cover">
          {cover ? (
            <div className="work-poster work-poster-wide" style={{ aspectRatio: "16 / 9" }}>
              <Image
                src={cover.src}
                alt={cover.alt}
                fill
                priority
                sizes="(min-width: 1200px) 1200px, 100vw"
                style={{ objectFit: "cover", objectPosition: "top left" }}
              />
            </div>
          ) : (
            <div
              className="work-poster work-poster-wide"
              role="img"
              aria-label={work.media.logo ? `Logo de ${work.title}` : `Portada ilustrativa de ${work.title}`}
              style={work.media.logo ? { display: "grid", placeItems: "center" } : undefined}
            >
              {work.media.logo ? (
                <Image
                  src={work.media.logo}
                  alt=""
                  width={360}
                  height={240}
                  priority
                  style={{
                    position: "relative",
                    width: "min(46%, 320px)",
                    height: "auto",
                    padding: 16,
                    borderRadius: 20,
                    background: "#fff",
                  }}
                />
              ) : (
                <span className="work-poster-ui" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              )}
              {isDemo && <span className="work-poster-tag m-mono">Datos ficticios</span>}
            </div>
          )}
          {cover && <figcaption className="work-note" style={{ marginTop: 12 }}>{cover.caption}</figcaption>}
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
        {hasPublicEvidence && (
          <div className="work-pair-col">
            <h2 className="work-label m-mono">Evidencia</h2>
            <FieldList items={work.evidence} />
          </div>
        )}
      </section>

      <section className="m-container work-block" aria-labelledby="work-media-h">
        <h2 id="work-media-h" className="work-label m-mono">
          {gallery.length > 0 && hasPublicEvidence ? "Capturas y medios" : "Evidencia del producto"}
        </h2>
        {gallery.length > 0 && !hasPublicEvidence && <p className="work-text">{PRIVATE_EVIDENCE_COPY}</p>}
        {gallery.length > 0 && (
          <>
            <ul
              role="list"
              style={{
                display: "grid",
                gap: 20,
                margin: 0,
                padding: 0,
                listStyle: "none",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
              }}
            >
              {gallery.slice(1).map((shot) => (
                <li key={shot.src} style={{ margin: 0 }}>
                  <figure style={{ margin: 0, display: "grid", gap: 10 }}>
                    <Image
                      src={shot.src}
                      alt={shot.alt}
                      width={1920}
                      height={1080}
                      sizes="(min-width: 768px) 50vw, 100vw"
                      style={{ width: "100%", height: "auto", borderRadius: 16, border: "1px solid var(--m-line)" }}
                    />
                    <figcaption className="work-text">{shot.caption}</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
            {hasPublicEvidence && (
              <p className="work-note" style={{ marginTop: 16 }}>
                Capturas reales de la aplicación, con una organización de demostración y datos de prueba.
              </p>
            )}
          </>
        )}
        {gallery.length === 0 && !hasPublicEvidence && <p className="work-text">{PRIVATE_EVIDENCE_COPY}</p>}
        {hasPublicEvidence && (isMvp || gallery.length === 0) && (
          <div className="work-media-placeholder" style={gallery.length > 0 ? { marginTop: 24 } : undefined}>
            {gallery.length > 0 && <h3 className="work-label m-mono">Evidencia del producto</h3>}
            <p className="work-text">{isMvp ? MVP_EVIDENCE_COPY : OPERATIONAL_EVIDENCE_COPY}</p>
          </div>
        )}
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
            <dd data-pending={isProduct && !work.teamRole}>{isProduct ? (work.teamRole ?? PENDING) : "RUN"}</dd>
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

      <section className="work-next-wrap" aria-label="Trabajo anterior">
        <div className="m-container">
          <Link
            href={workPath(prev)}
            className="work-next"
            style={prevStyle}
            aria-label={`Trabajo anterior: ${prev.title}, ${prevIndex} de ${total}`}
          >
            <span className="work-next-top">
              <span className="work-label m-mono">Trabajo anterior</span>
              <span className="work-next-counter m-mono" aria-hidden="true">
                {formatCounter(prevIndex, total)}
              </span>
            </span>
            <span className="work-next-name" aria-hidden="true">
              {prev.title}
            </span>
          </Link>
        </div>
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
