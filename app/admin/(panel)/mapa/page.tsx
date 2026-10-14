"use client";

import { useState } from "react";

type Area = { area: string; short: string; service: string; acciones: string[] };
type Fase = { nombre: string; objetivo: string };
type MapData = { negocio: string; resumen: string; fases: Fase[]; areas: Area[] };

const COLORS = ["#38bdf8", "#6366f1", "#a855f7", "#22d3ee", "#8b5cf6", "#ec4899"];

export default function MapaPage() {
  const [transcript, setTranscript] = useState("");
  const [scan, setScan] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<MapData | null>(null);

  async function generate() {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch("/api/admin/mapa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, notes, scan }),
      });
      const d = await res.json();
      if (!res.ok) setError(d.error || "No se pudo generar.");
      else setData(d as MapData);
    } catch {
      setError("No se pudo generar. Probá de nuevo.");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-6xl">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Mapa de IA</h1>
      <p className="mt-1.5 text-sm text-muted">
        Generá el roadmap de adopción de IA del cliente (fases × áreas) para compartir o imprimir. Partí del Runit Scan y/o la transcripción de la call.
      </p>

      <div className="mt-6 flex flex-col gap-3 print:hidden">
        <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={8}
          placeholder="Transcripción de la call (opcional si pegás el Runit Scan)…"
          className="w-full rounded-2xl border border-line bg-surface/40 px-4 py-3 text-sm outline-none focus:border-brand-violet" />
        <textarea value={scan} onChange={(e) => setScan(e.target.value)} rows={4}
          placeholder="Resultado del Runit Scan del cliente (opcional): estadio + nivel por área…"
          className="w-full rounded-2xl border border-line bg-surface/40 px-4 py-3 text-sm outline-none focus:border-brand-violet" />
        <input value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas extra (opcional): rubro, prioridades, restricciones…"
          className="w-full rounded-xl border border-line bg-surface/40 px-4 py-3 text-sm outline-none focus:border-brand-violet" />
        <div className="flex items-center gap-3">
          <button onClick={generate} disabled={loading || (transcript.trim().length < 30 && scan.trim().length < 10)}
            className="rounded-full bg-[linear-gradient(100deg,#38bdf8,#6366f1_48%,#a855f7)] px-6 py-3 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-50">
            {loading ? "Generando…" : "Generar mapa"}
          </button>
          {data && (
            <button onClick={() => window.print()} className="rounded-full border border-line px-5 py-3 text-sm text-muted transition hover:border-brand-violet hover:text-fg">
              Imprimir / PDF
            </button>
          )}
          {error && <span className="text-sm text-rose-400">{error}</span>}
        </div>
      </div>

      {data && (
        <div id="mapa-print" className="mt-10">
          {/* Encabezado */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-violet">
              <span className="inline-block h-4 w-4 rounded bg-[conic-gradient(from_210deg,#38bdf8,#6366f1,#a855f7)]" />
              Mapa de IA · RUN72
            </div>
            <h2 className="mt-2 font-display text-2xl font-semibold">{data.negocio || "Tu negocio"}</h2>
            <p className="mt-1 max-w-3xl text-sm text-muted">{data.resumen}</p>
          </div>

          {/* Matriz áreas × fases */}
          <div className="overflow-x-auto">
            <div className="min-w-[860px]">
              {/* Header de fases */}
              <div className="grid gap-2" style={{ gridTemplateColumns: "190px repeat(4, 1fr)" }}>
                <div />
                {data.fases.map((f, i) => (
                  <div key={i} className="rounded-xl border border-line bg-surface/60 px-3 py-2.5">
                    <p className="font-display text-sm font-semibold text-fg">{f.nombre}</p>
                    <p className="mt-0.5 text-xs leading-snug text-muted">{f.objetivo}</p>
                  </div>
                ))}
              </div>

              {/* Filas por área */}
              {data.areas.map((a, ai) => {
                const c = COLORS[ai % COLORS.length];
                return (
                  <div key={a.area} className="mt-2 grid gap-2" style={{ gridTemplateColumns: "190px repeat(4, 1fr)" }}>
                    <div className="rounded-xl border px-3 py-2.5" style={{ borderColor: c + "55", background: c + "14" }}>
                      <p className="font-display text-sm font-semibold text-fg">{a.area}</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-muted">{a.service}</p>
                    </div>
                    {a.acciones.map((acc, fi) => (
                      <div key={fi} className="rounded-xl border border-line bg-surface/40 px-3 py-2.5 text-xs leading-relaxed text-fg"
                        style={{ borderLeft: `3px solid ${c}` }}>
                        {acc}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          <p className="mt-6 text-xs text-faint">
            RUN72 · Mapa de IA — un plan de adopción por fases. Lo ejecutamos con vos; cada fila es un servicio que podemos entregar en 72 horas.
          </p>
        </div>
      )}
    </div>
  );
}
