"use client";

import { useState } from "react";

type LineItem = { name: string; price_ars: number };
type Pricing = {
  subtotal: number;
  iva: number;
  total: number;
  deposit: number;
  balance: number;
  lineItems: LineItem[];
  depositPercent: number;
};
type Result = {
  summary: string;
  detectedNeeds: string[];
  missing: string[];
  draft: string;
  proposal: { projectTypes: string[]; addons: string[]; microservices: string[] };
  pricing: Pricing;
};

const ars = (n: number) => "$" + new Intl.NumberFormat("es-AR").format(n);

// Guía de descubrimiento para la primera meet. Se carga en el campo y se escriben
// las respuestas bajo cada "→"; después "Generar propuesta" la usa como insumo.
const GUIA_DESCUBRIMIENTO = `GUÍA DE DESCUBRIMIENTO — PRIMERA MEET
Escribí la respuesta debajo de cada "→". Después tocá "Generar propuesta".

— 1. CONTEXTO DEL NEGOCIO —
• ¿A qué se dedican y hace cuánto operan?
→
• Tamaño (empleados, clientes, facturación/etapa):
→
• ¿Quién decide la inversión y quién va a usar la solución?
→

— 2. EL PROBLEMA (por qué ahora) —
• ¿Qué problema puntual quieren resolver?
→
• ¿Por qué ahora? ¿Qué pasa si no lo resuelven?
→
• ¿Ya intentaron resolverlo? ¿Con qué y por qué no alcanzó?
→

— 3. PROCESO ACTUAL (lo más importante) —
• ¿Cómo es el proceso hoy, paso a paso (quién hace qué)?
→
• ¿Qué herramientas usan hoy (planillas, WhatsApp, CRM, ERP…)?
→
• ¿Dónde se traba / demora / falla?
→
• Volumen (casos/día, pedidos, operaciones…):
→
• ¿Cuánto tiempo/plata consume hoy? (para el ROI)
→
• ¿Qué es repetitivo/manual vs. qué necesita criterio humano?
→

— 4. SOLUCIÓN IMAGINADA (alcance / MVP) —
• ¿Cómo se imaginan la solución ideal?
→
• Imprescindible para la v1 vs. deseable (después):
→
• ¿Software a medida, automatización, IA o mezcla? ¿Web / app / interno?
→
• ¿Algo que explícitamente NO quieren?
→

— 5. DATOS Y SISTEMAS —
• ¿Qué datos manejan y dónde viven hoy? ¿En qué estado/calidad?
→
• ¿Con qué sistemas debe integrarse? (pagos, facturación, WhatsApp, APIs…)
→
• ¿Datos sensibles / regulación? (salud, datos personales, legal)
→
• ¿Tienen equipo técnico interno?
→

— 6. OBJETIVOS Y ÉXITO —
• Si sale perfecto, ¿qué cambia en 3-6 meses?
→
• Resultado concreto esperado (horas ahorradas, % más de cierre, menos errores…):
→
• ¿Cómo lo van a medir?
→

— 7. GENTE Y ADOPCIÓN —
• ¿Quién lo va a usar día a día? ¿Hay resistencia al cambio?
→
• Referente/owner del proyecto de su lado:
→

— 8. TIEMPOS, PRESUPUESTO Y DECISIÓN —
• ¿Para cuándo lo necesitan? ¿Hay deadline o evento gatillo?
→
• Presupuesto que tienen en mente (rango):
→
• ¿Cómo deciden? ¿Quién firma? ¿Qué necesitan para avanzar?
→
• ¿MVP rápido e iterar o todo de una? ¿Proyecto cerrado / por fases / mantenimiento?
→

— 9. RIESGOS Y EXPECTATIVAS —
• ¿Qué les preocupa / qué podría hacer fracasar esto?
→
• Malas experiencias previas / qué valoran de un partner:
→

— PRÓXIMO PASO ACORDADO —
→
`;

export default function PropuestaPage() {
  const [transcript, setTranscript] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/admin/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo generar.");
      } else {
        setResult(data as Result);
      }
    } catch {
      setError("No se pudo generar. Probá de nuevo.");
    }
    setLoading(false);
  }

  async function copyDraft() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Propuesta IA</h1>
      <p className="mt-1.5 text-sm text-muted">
        Pegá la transcripción de la videollamada y generá un borrador de propuesta + presupuesto estimado. Después revisalo y mandalo.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => {
            if (!transcript.trim() || confirm("¿Reemplazar el contenido actual con la guía de preguntas?")) {
              setTranscript(GUIA_DESCUBRIMIENTO);
            }
          }}
          className="self-start rounded-full border border-line px-3.5 py-1.5 text-xs text-muted transition hover:border-brand-violet hover:text-fg"
        >
          + Cargar guía de preguntas (primera meet)
        </button>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={12}
          placeholder="Pegá acá la transcripción de la call (con nombres de quién habla, si tenés)…"
          className="w-full rounded-2xl border border-line bg-surface/40 px-4 py-3 text-sm outline-none focus:border-brand-violet"
        />
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas extra (opcional): presupuesto que mencionó, plazos, referencias…"
          className="w-full rounded-xl border border-line bg-surface/40 px-4 py-3 text-sm outline-none focus:border-brand-violet"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={generate}
            disabled={loading || transcript.trim().length < 30}
            className="rounded-full bg-[linear-gradient(100deg,#ff8a4c,#ff6a2a_50%,#dc5000)] px-6 py-3 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "Generando…" : "Generar propuesta"}
          </button>
          {error && <span className="text-sm text-rose-400">{error}</span>}
        </div>
      </div>

      {result && (
        <div className="mt-10 flex flex-col gap-8">
          {/* Necesidad */}
          <section>
            <h2 className="font-display text-lg font-semibold">Necesidad interpretada</h2>
            <p className="mt-2 text-sm leading-relaxed text-fg">{result.summary}</p>
            {result.detectedNeeds.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {result.detectedNeeds.map((n, i) => (
                  <li key={i} className="rounded-full border border-line bg-surface/40 px-3 py-1 text-xs text-muted">{n}</li>
                ))}
              </ul>
            )}
          </section>

          {/* Presupuesto */}
          <section>
            <h2 className="font-display text-lg font-semibold">Presupuesto estimado</h2>
            {result.pricing.lineItems.length === 0 ? (
              <p className="mt-2 text-sm text-faint">No se seleccionaron servicios del catálogo. Revisá la transcripción o cargá los datos faltantes.</p>
            ) : (
              <div className="mt-3 overflow-hidden rounded-2xl border border-line">
                <table className="w-full text-sm">
                  <tbody>
                    {result.pricing.lineItems.map((li, i) => (
                      <tr key={i} className="border-b border-line/60">
                        <td className="px-4 py-2.5 text-fg">{li.name}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-muted">{ars(li.price_ars)}</td>
                      </tr>
                    ))}
                    <tr className="border-b border-line/60"><td className="px-4 py-2 text-muted">Subtotal</td><td className="px-4 py-2 text-right font-mono text-muted">{ars(result.pricing.subtotal)}</td></tr>
                    <tr className="border-b border-line/60"><td className="px-4 py-2 text-muted">IVA</td><td className="px-4 py-2 text-right font-mono text-muted">{ars(result.pricing.iva)}</td></tr>
                    <tr className="border-b border-line/60"><td className="px-4 py-2.5 font-semibold text-fg">Total</td><td className="px-4 py-2.5 text-right font-mono font-semibold text-fg">{ars(result.pricing.total)}</td></tr>
                    <tr><td className="px-4 py-2 text-brand-violet">Anticipo ({result.pricing.depositPercent}%)</td><td className="px-4 py-2 text-right font-mono text-brand-violet">{ars(result.pricing.deposit)}</td></tr>
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-2 text-xs text-faint">Estimado con precios del catálogo. Ajustá en el cotizador/admin si hace falta.</p>
          </section>

          {/* Borrador */}
          <section>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Borrador de propuesta</h2>
              <button onClick={copyDraft} className="rounded-full border border-line px-3.5 py-1.5 text-xs text-muted transition hover:border-brand-violet hover:text-fg">
                {copied ? "¡Copiado!" : "Copiar"}
              </button>
            </div>
            <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-line bg-surface/40 p-4 font-sans text-sm leading-relaxed text-fg">{result.draft}</pre>
          </section>

          {/* Faltantes */}
          {result.missing.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-semibold">Datos que faltan para cerrar</h2>
              <ul className="mt-2 list-disc pl-5 text-sm text-muted">
                {result.missing.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
