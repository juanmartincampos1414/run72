"use client";

import { useState } from "react";
import { MapaView, type MapData } from "@/components/mapa/MapaView";

type Result = MapData & { id: string | null };

export default function MapaPage() {
  const [transcript, setTranscript] = useState("");
  const [scan, setScan] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

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
      else setData(d as Result);
    } catch {
      setError("No se pudo generar. Probá de nuevo.");
    }
    setLoading(false);
  }

  const shareUrl = data?.id ? `https://run72.app/mapa/${data.id}` : "";

  async function copyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
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
          {error && <span className="text-sm text-rose-400">{error}</span>}
        </div>
      </div>

      {data && (
        <div className="mt-8">
          {shareUrl ? (
            <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-brand-violet/30 bg-surface/50 p-4 print:hidden sm:flex-row sm:items-center">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-violet">Link para el cliente</p>
                <p className="mt-1 break-all font-mono text-sm text-fg">{shareUrl}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={copyLink} className="rounded-full bg-fg px-4 py-2 text-sm font-medium text-ink transition hover:opacity-90">
                  {copied ? "¡Copiado!" : "Copiar link"}
                </button>
                <a href={`/mapa/${data.id}`} target="_blank" rel="noopener" className="rounded-full border border-line px-4 py-2 text-sm text-muted transition hover:border-brand-violet hover:text-fg">
                  Abrir
                </a>
              </div>
            </div>
          ) : (
            <p className="mb-6 text-xs text-faint print:hidden">No se pudo guardar el link para compartir (revisá la conexión con Supabase), pero el mapa se generó igual.</p>
          )}

          <MapaView data={data} print />
        </div>
      )}
    </div>
  );
}
