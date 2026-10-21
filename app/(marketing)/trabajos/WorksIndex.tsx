"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { AnimatedArrow } from "@/components/marketing/AnimatedArrow";
import {
  CATEGORY_LABELS,
  DEMO_LABEL,
  hasPendingFields,
  isWorkCategory,
  type Work,
  type WorkCategory,
} from "@/lib/marketing/cases";

type Filter = "todos" | WorkCategory;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "software", label: CATEGORY_LABELS.software },
  { id: "ia", label: CATEGORY_LABELS.ia },
  { id: "automatizacion", label: CATEGORY_LABELS.automatizacion },
];

const STORAGE_KEY = "run-trabajos-filtro";

export type WorkGroup = { id: string; title: string; works: Work[] };

function readInitialFilter(): Filter {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("categoria");
    if (isWorkCategory(fromUrl)) return fromUrl;
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (isWorkCategory(stored)) return stored;
  } catch {
    // Sin acceso a storage: se parte de "Todos".
  }
  return "todos";
}

function countText(n: number, filterLabel: string): string {
  const noun = n === 1 ? "producto" : "productos";
  return `Mostrando ${n} ${noun}${filterLabel ? ` en ${filterLabel}` : ""}`;
}

/** Tarjeta de producto: portada real visible sin hover, nombre, descripción breve, estado y acceso a la ficha. */
function WorkCard({ work: w, index }: { work: Work; index: number }) {
  return (
    <li className="work-row-item">
      <Link
        href={`/trabajos/${w.slug}`}
        className="work-card work-row"
        style={{ "--work-accent": w.media.poster } as CSSProperties}
      >
        <span className="work-poster" aria-hidden="true">
          {w.media.gallery?.[0] ? (
            <Image
              src={w.media.gallery[0].src}
              alt=""
              fill
              sizes="(min-width: 768px) 42vw, 100vw"
              className="work-poster-img"
            />
          ) : (
            <span className="work-poster-ui">
              <i />
              <i />
              <i />
            </span>
          )}
        </span>
        <span className="work-card-body">
          <span className="work-row-top">
            <span className="work-card-meta m-mono">
              {String(index + 1).padStart(2, "0")} · {w.categories.map((c) => CATEGORY_LABELS[c]).join(" · ")}
            </span>
            {hasPendingFields(w) && <span className="work-badge m-mono">Contenido en validación</span>}
          </span>
          <span className="work-card-title">{w.title}</span>
          <span className="work-card-summary">{w.subtitle}</span>
          <span className="work-card-state m-mono">
            {w.kind === "demo" ? DEMO_LABEL : w.statusLabel ?? ""}
          </span>
          <span className="work-card-link m-mono">
            Ver ficha <AnimatedArrow />
          </span>
        </span>
      </Link>
    </li>
  );
}

/**
 * Índice de Trabajos con UN solo filtro general sobre todos los grupos de madurez.
 * Antes cada grupo montaba su propia barra de filtros (cuatro barras repetidas).
 * `order`: slugs en orden global, para una numeración continua estable entre grupos.
 */
export function WorksIndex({ groups, order }: { groups: WorkGroup[]; order: string[] }) {
  const [filter, setFilter] = useState<Filter>("todos");

  // El filtro persiste por query (?categoria=) y sessionStorage.
  useEffect(() => {
    const initial = readInitialFilter();
    if (initial !== "todos") setFilter(initial);
  }, []);

  const select = useCallback((next: Filter) => {
    setFilter(next);
    try {
      const url = new URL(window.location.href);
      if (next === "todos") {
        url.searchParams.delete("categoria");
        window.sessionStorage.removeItem(STORAGE_KEY);
      } else {
        url.searchParams.set("categoria", next);
        window.sessionStorage.setItem(STORAGE_KEY, next);
      }
      window.history.replaceState(null, "", url);
    } catch {
      // Persistencia opcional.
    }
  }, []);

  const matches = (w: Work) => filter === "todos" || w.categories.includes(filter);
  const visibleGroups = groups
    .map((g) => ({ ...g, works: g.works.filter(matches) }))
    .filter((g) => g.works.length > 0);
  const visibleCount = visibleGroups.reduce((n, g) => n + g.works.length, 0);
  const activeLabel = filter === "todos" ? "" : CATEGORY_LABELS[filter];
  const indexOf = (slug: string) => order.indexOf(slug);

  return (
    <>
      <div className="m-container work-index-controls">
        <div className="work-filters" role="group" aria-label="Filtrar trabajos por categoría">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className="work-filter"
              aria-pressed={filter === f.id}
              onClick={() => select(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="work-count m-mono" role="status" aria-live="polite">
          {countText(visibleCount, activeLabel)}
        </p>
      </div>

      {visibleCount === 0 ? (
        <p className="m-container work-empty">Todavía no hay productos publicados en esta categoría.</p>
      ) : (
        visibleGroups.map((g) => (
          <section key={g.id} className="m-container work-index-list" aria-label={g.title}>
            <h3 className="work-section-title work-section-title-sm">{g.title}</h3>
            <ul className="work-rows" role="list">
              {g.works.map((w) => (
                <WorkCard key={w.slug} work={w} index={indexOf(w.slug)} />
              ))}
            </ul>
          </section>
        ))
      )}
    </>
  );
}
