"use client";

export type MapArea = { area: string; short?: string; service: string; acciones: string[] };
export type MapFase = { nombre: string; objetivo: string };
export type MapData = { negocio: string; resumen: string; fases: MapFase[]; areas: MapArea[] };

const COLORS = ["#38bdf8", "#6366f1", "#a855f7", "#22d3ee", "#8b5cf6", "#ec4899"];

export function MapaView({ data, print = false, cta = false }: { data: MapData; print?: boolean; cta?: boolean }) {
  return (
    <div>
      {print && (
        <div className="mb-5 print:hidden">
          <button
            onClick={() => window.print()}
            className="rounded-full border border-line px-5 py-2.5 text-sm text-muted transition hover:border-brand-violet hover:text-fg"
          >
            Imprimir / Guardar PDF
          </button>
        </div>
      )}

      <div id="mapa-print">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-violet">
            <span className="inline-block h-4 w-4 rounded bg-[conic-gradient(from_210deg,#38bdf8,#6366f1,#a855f7)]" />
            Mapa de IA · RUN72
          </div>
          <h2 className="mt-2 font-display text-2xl font-semibold">{data.negocio || "Tu negocio"}</h2>
          {data.resumen && <p className="mt-1 max-w-3xl text-sm text-muted">{data.resumen}</p>}
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[860px]">
            <div className="grid gap-2" style={{ gridTemplateColumns: "190px repeat(4, 1fr)" }}>
              <div />
              {data.fases.map((f, i) => (
                <div key={i} className="rounded-xl border border-line bg-surface/60 px-3 py-2.5">
                  <p className="font-display text-sm font-semibold text-fg">{f.nombre}</p>
                  <p className="mt-0.5 text-xs leading-snug text-muted">{f.objetivo}</p>
                </div>
              ))}
            </div>

            {data.areas.map((a, ai) => {
              const c = COLORS[ai % COLORS.length];
              return (
                <div key={a.area} className="mt-2 grid gap-2" style={{ gridTemplateColumns: "190px repeat(4, 1fr)" }}>
                  <div className="rounded-xl border px-3 py-2.5" style={{ borderColor: c + "55", background: c + "14" }}>
                    <p className="font-display text-sm font-semibold text-fg">{a.area}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-muted">{a.service}</p>
                  </div>
                  {a.acciones.map((acc, fi) => (
                    <div
                      key={fi}
                      className="rounded-xl border border-line bg-surface/40 px-3 py-2.5 text-xs leading-relaxed text-fg"
                      style={{ borderLeft: `3px solid ${c}` }}
                    >
                      {acc}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-6 text-xs text-faint">
          RUN72 · Mapa de IA — un plan de adopción por fases. Cada fila es un servicio que podemos entregar en 72 horas.
        </p>

        {cta && (
          <div className="mt-8 flex flex-col items-start gap-3 rounded-2xl border border-brand-violet/30 bg-surface/50 p-6 print:hidden sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-lg font-semibold">¿Lo ejecutamos juntos?</p>
              <p className="text-sm text-muted">Coordinemos una videollamada y arrancamos por tu primera fase.</p>
            </div>
            <a
              href="/#cotizar"
              className="shrink-0 rounded-full bg-[linear-gradient(100deg,#38bdf8,#6366f1_48%,#a855f7)] px-6 py-3 text-sm font-medium text-white transition hover:brightness-110"
            >
              Hablar con RUN72
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
