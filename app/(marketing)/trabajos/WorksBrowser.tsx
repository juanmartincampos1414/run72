"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { AnimatedArrow } from "@/components/marketing/AnimatedArrow";
import {
  CATEGORY_LABELS,
  DEMO_LABEL,
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
  const noun = n === 1 ? "trabajo" : "trabajos";
  return `Mostrando ${n} ${noun}${filterLabel ? ` en ${filterLabel}` : ""}`;
}

export function WorksBrowser({ works }: { works: Work[] }) {
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

      <ul className="work-grid" role="list">
        {visible.map((w, i) => (
          <li
            key={w.slug}
            className="work-cell"
            data-wide={i % 4 === 0 || i % 4 === 3 ? "true" : "false"}
          >
            <Link
              href={`/trabajos/${w.slug}`}
              className="work-card"
              style={{ "--work-accent": w.media.poster } as CSSProperties}
            >
              <span className="work-poster" aria-hidden="true">
                <span className="work-poster-ui">
                  <i />
                  <i />
                  <i />
                </span>
                {w.kind === "demo" && <span className="work-poster-tag m-mono">Datos ficticios</span>}
              </span>
              <span className="work-card-body">
                {w.kind === "demo" && <span className="work-badge m-mono">{DEMO_LABEL}</span>}
                <span className="work-card-title">{w.title}</span>
                <span className="work-card-meta m-mono">
                  {w.categories.map((c) => CATEGORY_LABELS[c]).join(" · ")} · {w.year}
                </span>
                <span className="work-card-summary">{w.summary}</span>
                <span className="work-card-link m-mono">
                  Ver trabajo <AnimatedArrow />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
