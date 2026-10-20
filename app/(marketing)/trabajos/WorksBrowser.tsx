"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { AnimatedArrow } from "@/components/marketing/AnimatedArrow";
import {
  CATEGORY_LABELS,
  PENDING,
  getEvidenceSummary,
  hasPendingFields,
  isPending,
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

/** `order`: slugs en orden global, para una numeración continua entre secciones (estable ante filtros). */
export function WorksBrowser({ works, order }: { works: Work[]; order?: string[] }) {
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

  const visible = filter === "todos" ? works : works.filter((w) => w.categories.includes(filter));
  const activeLabel = filter === "todos" ? "" : CATEGORY_LABELS[filter];

  return (
    <>
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
        {countText(visible.length, activeLabel)}
      </p>

      {visible.length === 0 ? (
        <p className="work-empty">Todavía no hay productos publicados en esta categoría.</p>
      ) : (
        <ul className="work-rows" role="list">
          {visible.map((w, i) => (
            <li key={w.slug} className="work-row-item">
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
                      {String((order ? order.indexOf(w.slug) : -1) >= 0 ? order!.indexOf(w.slug) + 1 : i + 1).padStart(2, "0")} · {w.categories.map((c) => CATEGORY_LABELS[c]).join(" · ")}
                    </span>
                    {hasPendingFields(w) && <span className="work-badge m-mono">Contenido en validación</span>}
                  </span>
                  <span className="work-card-title">{w.title}</span>
                  <span className="work-card-summary">{w.summary}</span>
                  <dl className="work-row-facts">
                    <div>
                      <dt className="work-label m-mono">Usuario</dt>
                      <dd data-pending={isPending(w.userType)}>{w.userType ?? PENDING}</dd>
                    </div>
                    <div>
                      <dt className="work-label m-mono">Estado</dt>
                      <dd data-pending={isPending(w.status)}>{w.status ?? PENDING}</dd>
                    </div>
                    <div>
                      <dt className="work-label m-mono">Evidencia</dt>
                      <dd data-pending={isPending(getEvidenceSummary(w))}>{getEvidenceSummary(w)}</dd>
                    </div>
                  </dl>
                  <span className="work-card-link m-mono">
                    Ver ficha <AnimatedArrow />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
