"use client";

import { useEffect, useMemo, useState } from "react";
import { HubShell } from "./HubShell";

type Partner = {
  id: string;
  category: string;
  name: string;
  description: string | null;
  contact: string | null;
  website: string | null;
  whatsapp: string | null;
  notes: string | null;
};

export function HubPartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hub/partners")
      .then((r) => r.json())
      .then((d) => setPartners(d.partners ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const byCategory = useMemo(() => {
    const m = new Map<string, Partner[]>();
    for (const p of partners) {
      const arr = m.get(p.category) ?? [];
      arr.push(p);
      m.set(p.category, arr);
    }
    return [...m.entries()];
  }, [partners]);

  return (
    <HubShell>
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Partners recomendados</h1>
        <p className="mt-1 text-sm text-muted">
          Proveedores de confianza, seleccionados por RUN72, para lo que necesite tu negocio.
        </p>
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-faint">Cargando…</p>
      ) : partners.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-line bg-surface/20 py-12 text-center">
          <p className="text-sm text-muted">Pronto vas a ver acá nuestros partners recomendados.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {byCategory.map(([category, list]) => (
            <div key={category}>
              <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-faint">{category}</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((p) => (
                  <div key={p.id} className="flex flex-col rounded-3xl border border-line bg-surface/40 p-5">
                    <p className="font-medium tracking-tight">{p.name}</p>
                    {p.description && <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">{p.description}</p>}
                    {p.notes && <p className="mt-2 text-xs leading-relaxed text-faint">{p.notes}</p>}
                    <div className="mt-4 flex flex-wrap gap-3 text-sm">
                      {p.website && (
                        <a href={hrefOf(p.website)} target="_blank" rel="noopener noreferrer" className="text-brand-cyan hover:underline">
                          Sitio
                        </a>
                      )}
                      {p.whatsapp && (
                        <a href={`https://wa.me/${p.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-brand-cyan hover:underline">
                          WhatsApp
                        </a>
                      )}
                      {p.contact && <span className="text-muted">{p.contact}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </HubShell>
  );
}

function hrefOf(url: string): string {
  return /^https?:\/\//.test(url) ? url : `https://${url}`;
}
