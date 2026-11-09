"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatARS } from "@/lib/pricing";
import { DISCOVERY_QUESTIONS, DISCOVERY_SECTIONS } from "@/lib/discovery";
import {
  ANTICIPO_LABEL,
  anticipoState,
  saldoState,
} from "@/lib/sla";
import { SlaBar } from "./SlaBar";
import { DELIVERY_FIELDS, resolveDeliveryDoc, type DeliveryDoc } from "@/lib/delivery";
import type { Lead, ProjectPreview } from "@/lib/types";

type Version = {
  id: string;
  prompt: string | null;
  response: string | null;
  preview: ProjectPreview | null;
  files_context: Array<{ name: string; url: string }> | null;
  form_snapshot: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
};
type AuditEvent = { event_type: string; metadata: Record<string, unknown>; created_at: string };

const EVENT_LABEL: Record<string, string> = {
  lead_created: "Lead creado",
  checkout_started: "Checkout iniciado",
  payment_initiated: "Pago iniciado",
  payment_completed: "Anticipo pagado",
  comprobante_uploaded: "Comprobante cargado",
  comprobante_approved: "Comprobante aprobado",
  comprobante_rejected: "Comprobante rechazado",
  scope_rejected: "Rechazado por alcance",
  preview_generated: "Preview generado",
  preview_regenerated: "Preview regenerado",
  production_started: "Proyecto iniciado",
  status_changed: "Cambio de estado",
  proposal_generated: "Propuesta generada (chat)",
  lead_created_from_chat: "Lead creado desde chat",
};

type TabId = "propuesta" | "preview" | "descubrimiento" | "pago" | "entrega" | "actividad";

export function LeadDetail({ leadId }: { leadId: string }) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [obs, setObs] = useState("");
  const [busy, setBusy] = useState(false);
  const [genErr, setGenErr] = useState("");
  const [openVersion, setOpenVersion] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("propuesta");

  async function load() {
    const r = await fetch(`/api/admin/leads/${leadId}`);
    if (r.ok) {
      const d = await r.json();
      setLead(d.lead);
      setVersions(d.versions ?? []);
      setEvents(d.events ?? []);
    }
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, [leadId]);

  async function action(action: string) {
    setBusy(true);
    await fetch(`/api/admin/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, observaciones: obs }),
    });
    setObs("");
    await load();
    setBusy(false);
  }

  async function regenerate() {
    if (!confirm("¿Regenerar el preview? Se guarda como una versión nueva (no borra las anteriores).")) return;
    setBusy(true);
    setGenErr("");
    try {
      const r = await fetch(`/api/admin/leads/${leadId}/regenerate`, { method: "POST" });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || d.error) {
        setGenErr(d.error || `No se pudo generar (${r.status}).`);
      }
    } catch (e) {
      setGenErr(e instanceof Error ? e.message : "No se pudo generar.");
    }
    await load();
    setBusy(false);
  }

  if (loading) return <p className="text-sm text-faint">Cargando…</p>;
  if (!lead) return <p className="text-sm text-red-300">Lead no encontrado.</p>;

  const latest = versions[0]?.preview ?? null;

  const discAnswered = lead.discovery
    ? DISCOVERY_QUESTIONS.filter((q) => (lead.discovery?.[q.id] ?? "").trim()).length
    : 0;
  const hasProposal = Boolean(lead.proposal && Object.keys(lead.proposal).length);
  const hasComprobante = lead.comprobante_status === "recibido";

  const tabs: { id: TabId; label: string; badge?: React.ReactNode }[] = [
    { id: "propuesta", label: "Propuesta", badge: hasProposal ? <Dot /> : undefined },
    { id: "preview", label: "Preview", badge: versions.length > 0 ? <Dot /> : undefined },
    {
      id: "descubrimiento",
      label: "Descubrimiento",
      badge: discAnswered > 0 ? <TabCount n={discAnswered} /> : undefined,
    },
    { id: "pago", label: "Pago", badge: hasComprobante ? <Dot warn /> : undefined },
    { id: "entrega", label: "Entrega" },
    { id: "actividad", label: "Actividad" },
  ];

  return (
    <div className="max-w-4xl">
      <Link href="/admin" className="text-sm text-muted hover:text-fg">
        ← Volver a Leads
      </Link>

      {/* Header (siempre visible) */}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{lead.name}</h1>
          <p className="text-sm text-muted">
            {lead.email}
            {lead.whatsapp ? ` · ${lead.whatsapp}` : ""}
            {lead.company ? ` · ${lead.company}` : ""}
          </p>
          <p className="mt-1 text-sm text-fg">{lead.project_label ?? "—"}</p>
          <span
            className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
              lead.source_type === "chat"
                ? "bg-brand-violet/15 text-brand-violet"
                : "bg-white/[0.06] text-muted"
            }`}
          >
            {lead.source_type === "chat" ? "💬 Chat" : "⚡ Formulario"}
          </span>
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-semibold tabular-nums">{formatARS(lead.total_ars)}</p>
          <p className="text-xs text-muted">Adelanto {formatARS(lead.deposit_ars)}</p>
        </div>
      </div>

      {/* SLA */}
      {lead.production_started_at && lead.status === "en_produccion" && (
        <div className="mt-4 rounded-2xl border border-line bg-surface/40 p-4">
          <p className="mb-2 text-xs text-faint">SLA</p>
          <SlaBar startedAt={lead.production_started_at} deadlineAt={lead.estimated_delivery_at} />
        </div>
      )}

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Secciones del lead"
        className="mt-6 flex flex-wrap gap-1 border-b border-line"
      >
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`-mb-px flex items-center gap-2 rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "border-[#ff6a2a] text-fg"
                  : "border-transparent text-muted hover:text-fg"
              }`}
            >
              {t.label}
              {t.badge}
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        {/* PROPUESTA */}
        {tab === "propuesta" && (
          <div className="space-y-6">
            {lead.conversation_summary && (
              <Panel title="Resumen de la conversación">
                <p className="text-sm leading-relaxed text-muted">{lead.conversation_summary}</p>
              </Panel>
            )}
            <Panel
              title="Transcripción + propuesta"
              hint="Subí el Word con la transcripción COMPLETA de la meet (no el resumen) y generá la propuesta. RUN interpreta solo las etapas; no hace falta cargar enfoque."
            >
              <TranscriptProposal
                leadId={leadId}
                initialTranscript={lead.transcript}
                initialProposal={lead.proposal}
                discovery={lead.discovery}
              />
            </Panel>
          </div>
        )}

        {/* PREVIEW */}
        {tab === "preview" && (
          <Panel
            title="Preview visual (lo que ve el cliente)"
            hint="Mockups que ve el cliente en su link. Se arman solos con la transcripción + la propuesta de arriba — no necesitás cargar nada más."
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">
                {versions.length > 0
                  ? `${versions.length} versión(es) · última: ${fmt(versions[0].created_at)} por ${versions[0].created_by ?? "—"}`
                  : "Todavía no se generó."}
              </p>
              <button
                onClick={regenerate}
                disabled={busy}
                className="rounded-full bg-[linear-gradient(100deg,#ff8a4c,#ff6a2a_50%,#dc5000)] px-4 py-1.5 text-xs font-medium text-white disabled:opacity-50"
              >
                {busy ? "Generando…" : versions.length > 0 ? "Regenerar preview" : "Generar preview"}
              </button>
            </div>
            {genErr && (
              <p className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {genErr}
              </p>
            )}
            <ClientLink leadId={leadId} />

            {latest && (
              <>
                <p className="mt-4 text-sm leading-relaxed text-muted">{latest.interpretation}</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {latest.mockups.map((m, i) => (
                    <div key={i} className="overflow-hidden rounded-xl border border-line bg-white">
                      <iframe title={m.title} sandbox="" srcDoc={m.html} className="h-72 w-full" loading="lazy" />
                    </div>
                  ))}
                </div>
              </>
            )}

            {versions.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-faint">Historial</p>
                <div className="space-y-2">
                  {versions.map((v) => (
                    <div key={v.id} className="rounded-xl border border-line bg-ink/40">
                      <button
                        onClick={() => setOpenVersion(openVersion === v.id ? null : v.id)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-xs"
                      >
                        <span>
                          {fmt(v.created_at)} · {v.created_by ?? "—"} · {v.preview?.mockups.length ?? 0} mockups
                        </span>
                        <span className="text-muted">{openVersion === v.id ? "−" : "+"}</span>
                      </button>
                      {openVersion === v.id && (
                        <div className="border-t border-line px-4 py-3 text-xs text-muted">
                          <p className="mb-2">{v.response}</p>
                          <details>
                            <summary className="cursor-pointer text-faint">Ver prompt utilizado</summary>
                            <pre className="mt-2 whitespace-pre-wrap break-words text-[11px] text-faint">{v.prompt}</pre>
                          </details>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Panel>
        )}

        {/* DESCUBRIMIENTO */}
        {tab === "descubrimiento" && (
          <Panel
            title="Descubrimiento (primera meet)"
            hint="Guía de preguntas para la primera reunión. Tocá cada bloque para abrirlo. Se guarda solo."
          >
            <DiscoveryGuide leadId={leadId} initial={lead.discovery} />
          </Panel>
        )}

        {/* PAGO */}
        {tab === "pago" && (
          <Panel title="Pago">
            <div className="flex flex-wrap gap-2">
              <Badge {...ANTICIPO_LABEL[anticipoState(lead)]} />
              <Badge {...saldoState(lead)} />
            </div>
            {lead.payment_status === "approved" && (
              <p className="mt-3 text-xs text-emerald-400">
                ✅ Pago MercadoPago confirmado{lead.payment_id ? ` · #${lead.payment_id}` : ""}
                {lead.production_started_at ? ` · ${fmt(lead.production_started_at)}` : ""} · {formatARS(lead.deposit_ars)}
              </p>
            )}

            {lead.comprobante_url ? (
              <div className="mt-4 rounded-2xl border border-line bg-ink/40 p-4">
                <p className="mb-2 text-sm font-medium">📎 Comprobante de transferencia</p>
                <p className="text-xs text-faint">
                  {lead.comprobante_name} · {lead.comprobante_uploaded_at ? fmt(lead.comprobante_uploaded_at) : ""}
                  {lead.comprobante_status ? ` · estado: ${lead.comprobante_status}` : ""}
                </p>
                {/\.(png|jpe?g|webp|gif)$/i.test(lead.comprobante_name ?? "") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={lead.comprobante_url} alt="Comprobante" className="mt-3 max-h-80 rounded-xl border border-line" />
                ) : (
                  <a href={lead.comprobante_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-brand-cyan hover:underline">
                    Abrir comprobante (PDF) →
                  </a>
                )}

                {lead.comprobante_status === "recibido" && (
                  <div className="mt-4">
                    <textarea
                      value={obs}
                      onChange={(e) => setObs(e.target.value)}
                      rows={2}
                      placeholder="Observaciones (opcional)"
                      className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand-blue/60"
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => action("approve_payment")}
                        disabled={busy}
                        className="rounded-full bg-emerald-500/15 px-4 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50"
                      >
                        Aprobar pago
                      </button>
                      <button
                        onClick={() => action("reject_payment")}
                        disabled={busy}
                        className="rounded-full bg-red-500/15 px-4 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/25 disabled:opacity-50"
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                )}
                {lead.comprobante_observaciones && (
                  <p className="mt-3 text-xs text-faint">Obs: {lead.comprobante_observaciones}</p>
                )}
              </div>
            ) : (
              <p className="mt-3 text-xs text-faint">Sin comprobante adjunto.</p>
            )}
          </Panel>
        )}

        {/* ENTREGA */}
        {tab === "entrega" && (
          <Panel title="Documento Final de Entrega">
            <DeliveryDocEditor lead={lead} leadId={leadId} />
          </Panel>
        )}

        {/* ACTIVIDAD */}
        {tab === "actividad" && (
          <div className="space-y-6">
            {lead.intake && Object.keys(lead.intake).length > 0 && (
              <Panel title="Información del cliente">
                <IntakeView intake={lead.intake} level={lead.preparation_level} />
              </Panel>
            )}
            <Panel title="Auditoría">
              {events.length === 0 ? (
                <p className="text-xs text-faint">Sin eventos registrados.</p>
              ) : (
                <ol className="relative space-y-3 border-l border-line pl-5">
                  {events.map((e, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[23px] top-1 h-2 w-2 rounded-full bg-gradient-to-r from-brand-cyan to-brand-violet" />
                      <p className="text-sm">{EVENT_LABEL[e.event_type] ?? e.event_type}</p>
                      <p className="text-[11px] text-faint">
                        {fmt(e.created_at)}
                        {e.metadata?.actor ? ` · ${String(e.metadata.actor)}` : ""}
                        {e.metadata?.observaciones ? ` · ${String(e.metadata.observaciones)}` : ""}
                        {e.metadata?.status ? ` · ${String(e.metadata.status)}` : ""}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </Panel>
          </div>
        )}
      </div>
    </div>
  );
}

/** Punto indicador en un tab (hay contenido). */
function Dot({ warn }: { warn?: boolean }) {
  return (
    <span className={`h-1.5 w-1.5 rounded-full ${warn ? "bg-amber-400" : "bg-[#ff6a2a]"}`} />
  );
}

function TabCount({ n }: { n: number }) {
  return (
    <span className="rounded-full bg-white/[0.08] px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted">
      {n}
    </span>
  );
}

/** Contenedor de panel dentro de un tab (reemplaza Section en el cuerpo). */
function Panel({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-line bg-surface/40 p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
      {hint && <p className="mb-4 mt-1 text-xs text-faint">{hint}</p>}
      {!hint && <div className="mb-4" />}
      {children}
    </div>
  );
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

function DeliveryDocEditor({ lead, leadId }: { lead: Lead; leadId: string }) {
  const [doc, setDoc] = useState<DeliveryDoc>(() => resolveDeliveryDoc(lead));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    await fetch(`/api/admin/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delivery_doc: doc }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <p className="mb-4 text-xs text-faint">
        Pre-llenado con la info del lead. Completá credenciales, configuraciones y recomendaciones al entregar.
        Es el documento maestro que recibe el cliente.
      </p>
      <div className="grid gap-3">
        {DELIVERY_FIELDS.map((f) => (
          <label key={f.key} className="flex flex-col gap-1.5">
            <span className="text-xs text-muted">{f.label}</span>
            <textarea
              value={doc[f.key]}
              onChange={(e) => setDoc({ ...doc, [f.key]: e.target.value })}
              rows={f.key === "resumen" || f.key === "recomendaciones" || f.key === "configuraciones" ? 3 : 2}
              className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-brand-blue/60"
            />
          </label>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-full bg-white px-5 py-2 text-sm font-medium text-ink disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Guardar documento"}
        </button>
        {saved && <span className="text-sm text-emerald-400">Guardado ✓</span>}
      </div>
    </div>
  );
}

function DiscoveryGuide({ leadId, initial }: { leadId: string; initial: Record<string, string> | null }) {
  const [answers, setAnswers] = useState<Record<string, string>>(initial ?? {});
  const [saved, setSaved] = useState(false);

  async function save(data: Record<string, string>) {
    try {
      await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discovery: data }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch {
      /* ignore */
    }
  }

  const answered = DISCOVERY_QUESTIONS.filter((q) => (answers[q.id] ?? "").trim()).length;
  const total = DISCOVERY_QUESTIONS.length;
  const pending = total - answered;

  // Primera sección sin completar abierta por defecto; si está todo, la primera.
  const firstIncomplete = DISCOVERY_SECTIONS.find((sec) =>
    DISCOVERY_QUESTIONS.some((q) => q.section === sec && !(answers[q.id] ?? "").trim()),
  );
  const [open, setOpen] = useState<string | null>(firstIncomplete ?? DISCOVERY_SECTIONS[0] ?? null);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-muted">
          Respondidas {answered}/{total}
        </span>
        {pending > 0 ? (
          <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-amber-300">Sin responder: {pending}</span>
        ) : (
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-emerald-300">Completo ✓</span>
        )}
        {saved && <span className="text-emerald-400">Guardado ✓</span>}
      </div>

      {/* Acordeón: una fila apilada por sección, colapsada por defecto */}
      <div className="space-y-2">
        {DISCOVERY_SECTIONS.map((sec) => {
          const qs = DISCOVERY_QUESTIONS.filter((q) => q.section === sec);
          const secDone = qs.filter((q) => (answers[q.id] ?? "").trim()).length;
          const complete = secDone === qs.length;
          const isOpen = open === sec;
          return (
            <div key={sec} className="overflow-hidden rounded-xl border border-line bg-ink/30">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : sec)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.02]"
              >
                <span className="text-sm font-medium text-fg">{sec}</span>
                <span className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums ${
                      complete ? "bg-emerald-500/15 text-emerald-300" : "bg-white/[0.06] text-muted"
                    }`}
                  >
                    {secDone}/{qs.length}
                  </span>
                  <span className="text-muted">{isOpen ? "−" : "+"}</span>
                </span>
              </button>
              {isOpen && (
                <div className="space-y-2.5 border-t border-line px-4 py-3">
                  {qs.map((q) => {
                    const done = (answers[q.id] ?? "").trim().length > 0;
                    return (
                      <div key={q.id}>
                        <div className="flex items-start gap-2 text-sm text-fg">
                          <span className={done ? "text-emerald-400" : "text-amber-400"}>{done ? "✓" : "•"}</span>
                          <span>{q.q}</span>
                        </div>
                        <textarea
                          value={answers[q.id] ?? ""}
                          onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                          onBlur={() => setAnswers((a) => { void save(a); return a; })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              (e.target as HTMLTextAreaElement).blur();
                            }
                          }}
                          rows={1}
                          placeholder="Escribí la respuesta…  (Enter guarda · Shift+Enter = nueva línea)"
                          className="mt-2 w-full resize-y rounded-lg border border-line bg-surface/60 px-3 py-2 text-sm outline-none focus:border-brand-violet"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type GenScenario = {
  key: string;
  name: string;
  tagline: string;
  includes: string[];
  total: number;
  deposit: number;
  recommended?: boolean;
};
type GenProposal = {
  positioning?: string;
  summary?: string;
  opportunities?: { title: string; build: string; revenue: string; read: string }[];
  recommendation?: string;
  phase1?: { title: string; why: string; scope: string[] };
  nextPhases?: { title: string; detail: string }[];
  scenarios?: GenScenario[];
  options?: { slug: string; name: string; detail: string; price_ars: number }[];
  missing?: string[];
  // compat viejo
  draft?: string;
};

function TranscriptProposal({
  leadId,
  initialTranscript,
  initialProposal,
  discovery,
}: {
  leadId: string;
  initialTranscript: string | null;
  initialProposal: Record<string, unknown> | null;
  discovery: Record<string, string> | null;
}) {
  const [transcript, setTranscript] = useState(initialTranscript ?? "");
  const [proposal, setProposal] = useState<GenProposal | null>((initialProposal as GenProposal) ?? null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [savedT, setSavedT] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedName, setUploadedName] = useState("");

  async function handleFile(file: File) {
    setErr("");
    setUploadedName("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/admin/transcript/extract", { method: "POST", body: fd });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.text) {
        setErr(data.error || "No pude leer el archivo.");
      } else {
        setTranscript(data.text as string);
        setUploadedName(`${data.name} · ${(data.chars as number).toLocaleString("es-AR")} caracteres`);
        void saveTranscript(data.text as string);
      }
    } catch {
      setErr("No pude leer el archivo.");
    }
    setUploading(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  function compiledDiscovery() {
    const ans = discovery ?? {};
    return DISCOVERY_QUESTIONS.filter((q) => (ans[q.id] ?? "").trim())
      .map((q) => `- ${q.q}\n  ${ans[q.id]}`)
      .join("\n");
  }

  async function saveTranscript(text: string) {
    try {
      await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text }),
      });
      setSavedT(true);
      setTimeout(() => setSavedT(false), 1500);
    } catch {
      /* ignore */
    }
  }

  async function generate() {
    setErr("");
    const disc = compiledDiscovery();
    const effective = transcript.trim() || disc;
    if (effective.length < 30) {
      setErr("Pegá la transcripción o completá respuestas de descubrimiento.");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/admin/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: effective, notes: disc }),
      });
      const data = await r.json();
      if (!r.ok) {
        setErr(data.error || "No se pudo generar.");
      } else {
        setProposal(data as GenProposal);
        fetch(`/api/admin/leads/${leadId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ proposal: data }),
        }).catch(() => {});
      }
    } catch {
      setErr("No se pudo generar.");
    }
    setLoading(false);
  }

  async function copyDraft() {
    if (!proposal) return;
    const txt = proposal.draft
      ? proposal.draft
      : [
          proposal.positioning,
          proposal.summary,
          "",
          "OPORTUNIDADES:",
          ...(proposal.opportunities ?? []).map((o) => `• ${o.title} — ${o.build} (${o.read})`),
          "",
          `RECOMENDACIÓN: ${proposal.recommendation ?? ""}`,
          "",
          proposal.phase1 ? `${proposal.phase1.title}: ${proposal.phase1.why}` : "",
          ...(proposal.phase1?.scope ?? []).map((s) => `  - ${s}`),
          "",
          "ESCENARIOS:",
          ...(proposal.scenarios ?? []).map((s) => `• ${s.name} — ${formatARS(s.total)} — ${s.tagline}`),
        ]
          .filter((l) => l !== undefined)
          .join("\n");
    try {
      await navigator.clipboard.writeText(txt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div>
      <label className="text-xs text-faint">Transcripción de la reunión</label>

      {/* Drop zone: arrastrá el .docx con la transcripción COMPLETA (no el resumen). */}
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`mt-2 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors ${
          dragOver ? "border-[#ff6a2a] bg-[#ff6a2a]/10" : "border-line bg-ink/20 hover:border-[#ff8a4c]/60"
        }`}
      >
        <input
          type="file"
          accept=".docx,.txt,.md,.vtt,.srt"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
            e.target.value = "";
          }}
        />
        <span className="text-sm font-medium text-fg">
          {uploading ? "Leyendo el archivo…" : "Arrastrá el Word acá o hacé clic para subirlo"}
        </span>
        <span className="text-[11px] text-faint">
          Transcripción completa en .docx (o .txt / .vtt). Reemplaza el texto de abajo.
        </span>
        {uploadedName && !uploading && (
          <span className="mt-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] text-emerald-300">
            ✓ {uploadedName}
          </span>
        )}
      </label>

      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        onBlur={() => saveTranscript(transcript)}
        rows={6}
        placeholder="…o pegá acá la transcripción de la call (se guarda sola al salir del campo)."
        className="mt-3 w-full resize-y rounded-xl border border-line bg-ink/40 px-3 py-2 text-sm outline-none focus:border-brand-violet"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          onClick={generate}
          disabled={loading}
          className="rounded-full bg-[linear-gradient(100deg,#ff8a4c,#ff6a2a_50%,#dc5000)] px-5 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-50"
        >
          {loading ? "Generando…" : "Generar propuesta"}
        </button>
        {savedT && <span className="text-xs text-emerald-400">Transcripción guardada ✓</span>}
        {err && <span className="text-sm text-red-300">{err}</span>}
      </div>
      <p className="mt-1 text-xs text-faint">
        Usa la transcripción + el descubrimiento. RUN deduce las etapas (ej: arrancar por un ecommerce) sola.
        Después, en la pestaña <span className="text-muted">Preview</span>, generás los mockups con un clic.
      </p>

      {proposal && (
        <div className="mt-5 space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-fg">Propuesta generada</p>
            <div className="flex items-center gap-2">
              <button
                onClick={copyDraft}
                className="rounded-full border border-line px-3 py-1 text-xs text-muted transition hover:border-brand-violet hover:text-fg"
              >
                {copied ? "¡Copiado!" : "Copiar"}
              </button>
              <ClientLinkInline leadId={leadId} />
            </div>
          </div>

          {proposal.positioning && (
            <p className="font-display text-lg font-semibold tracking-tight">{proposal.positioning}</p>
          )}
          {proposal.summary && <p className="text-sm leading-relaxed text-muted">{proposal.summary}</p>}

          {/* Compat viejo */}
          {proposal.draft && (
            <pre className="whitespace-pre-wrap rounded-xl border border-line bg-surface/40 p-3 font-sans text-sm leading-relaxed text-fg">
              {proposal.draft}
            </pre>
          )}

          {proposal.opportunities && proposal.opportunities.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-faint">Oportunidades</p>
              <div className="overflow-hidden rounded-xl border border-line">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-line bg-ink/40 text-left text-faint">
                      <th className="px-3 py-2 font-medium">Oportunidad</th>
                      <th className="px-3 py-2 font-medium">Qué construir</th>
                      <th className="px-3 py-2 font-medium">Ingresos</th>
                      <th className="px-3 py-2 font-medium">Lectura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposal.opportunities.map((o, i) => (
                      <tr key={i} className="border-b border-line/50 align-top last:border-0">
                        <td className="px-3 py-2 font-medium text-fg">{o.title}</td>
                        <td className="px-3 py-2 text-muted">{o.build}</td>
                        <td className="px-3 py-2 text-muted">{o.revenue}</td>
                        <td className="px-3 py-2 text-fg/80">{o.read}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {proposal.recommendation && (
            <div className="rounded-xl border border-brand-violet/30 bg-brand-violet/[0.06] p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-brand-violet">Recomendación</p>
              <p className="text-sm leading-relaxed text-fg/90">{proposal.recommendation}</p>
            </div>
          )}

          {proposal.scenarios && proposal.scenarios.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-faint">Escenarios</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {proposal.scenarios.map((s) => (
                  <div
                    key={s.key}
                    className={`rounded-xl border p-3 ${s.recommended ? "border-brand-violet/50 bg-brand-violet/[0.06]" : "border-line bg-ink/30"}`}
                  >
                    {s.recommended && <span className="text-[10px] font-semibold uppercase text-brand-violet">Recomendado</span>}
                    <p className="text-sm font-medium text-fg">{s.name}</p>
                    <p className="font-mono text-sm font-semibold text-fg">{formatARS(s.total)}</p>
                    <p className="mt-1 text-[11px] text-muted">{s.tagline}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {proposal.options && proposal.options.length > 0 && (
            <p className="text-xs text-faint">
              Módulos opcionales que el cliente puede sumar: {proposal.options.map((o) => o.name).join(", ")}.
            </p>
          )}

          {proposal.missing && proposal.missing.length > 0 && (
            <div>
              <p className="text-sm font-medium">Datos que faltan para cerrar</p>
              <ul className="mt-1 list-disc pl-5 text-sm text-muted">
                {proposal.missing.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Link compacto al proyecto del cliente (reusa dentro de la propuesta). */
function ClientLinkInline({ leadId }: { leadId: string }) {
  return (
    <a
      href={`/proyecto/${leadId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-full bg-[linear-gradient(100deg,#ff8a4c,#ff6a2a_50%,#dc5000)] px-3 py-1 text-xs font-medium text-white"
    >
      Ver como cliente →
    </a>
  );
}

function ClientLink({ leadId }: { leadId: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/proyecto/${leadId}` : `/proyecto/${leadId}`;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-ink/40 px-3 py-2">
      <span className="text-xs text-faint">Link para el cliente:</span>
      <a
        href={`/proyecto/${leadId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="truncate text-xs text-brand-cyan hover:underline"
      >
        {url}
      </a>
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            /* ignore */
          }
        }}
        className="ml-auto rounded-full border border-line px-3 py-1 text-xs text-muted transition hover:border-brand-violet hover:text-fg"
      >
        {copied ? "¡Copiado!" : "Copiar link"}
      </button>
    </div>
  );
}

function Badge({ label, cls }: { label: string; cls: string }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>{label}</span>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function IntakeView({ intake, level }: { intake: any; level: string | null }) {
  const infra = intake.infra ?? {};
  const social = intake.social ?? {};
  const activeSocial = Object.entries(social).filter(([, v]: any) => v?.active);
  const refs = (intake.references ?? []).filter((r: any) => r?.url);
  const row = (label: string, value: React.ReactNode) =>
    value ? (
      <div className="flex gap-2 text-sm">
        <span className="w-44 shrink-0 text-faint">{label}</span>
        <span className="text-fg">{value}</span>
      </div>
    ) : null;

  const tri = (v: string) => (v === "si" ? "Sí" : v === "no" ? "No" : v === "unsure" ? "No sabe" : "—");

  return (
    <div className="space-y-4">
      {level && (
        <p className="text-xs text-muted">
          Nivel de preparación: <span className="font-medium text-fg">{level}</span>
        </p>
      )}

      <div className="space-y-1">
        {row("Dominio", infra.domain ? `${tri(infra.domain)}${infra.domainName ? ` · ${infra.domainName}` : ""}${infra.domainProvider ? ` · ${infra.domainProvider}` : ""}${infra.domainAccess ? " · con acceso" : ""}` : null)}
        {row("Hosting", infra.hosting ? `${tri(infra.hosting)}${infra.hostingProvider ? ` · ${infra.hostingProvider}` : ""}${infra.hostingType ? ` · ${infra.hostingType}` : ""}${infra.hostingAccess ? " · con acceso" : ""}` : null)}
        {row("Correo corporativo", infra.email ? `${tri(infra.email)}${infra.emailProvider ? ` · ${infra.emailProvider}` : ""}${infra.emailAccounts ? ` · ${infra.emailAccounts} cuentas` : ""}` : null)}
      </div>

      {activeSocial.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] text-faint">Redes</p>
          <div className="space-y-1">
            {activeSocial.map(([name, v]: any) => (
              <div key={name} className="text-sm text-fg">
                {name}: {v.url || v.user || "—"} {v.access ? "· con acceso" : ""}
              </div>
            ))}
          </div>
        </div>
      )}

      {chips("Material disponible", intake.material)}
      {chips("Funcionalidades", [...(intake.functionalities ?? []), ...(intake.customFunctionalities ?? [])])}
      {chips("Accesos disponibles", intake.access)}

      {refs.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] text-faint">Referencias que le gustan</p>
          <div className="space-y-1">
            {refs.map((r: any, i: number) => (
              <div key={i} className="text-sm">
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-brand-cyan hover:underline">{r.url}</a>
                {r.likes?.length ? <span className="text-faint"> — {r.likes.join(", ")}</span> : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {row("A evitar", intake.avoid)}
      {row("Sitios que no le gustan", intake.dislikeUrls)}
      {row("Comentarios", intake.comments)}
    </div>
  );
}

function chips(label: string, items?: string[]) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] text-faint">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it) => (
          <span key={it} className="rounded-full border border-line bg-ink/40 px-2.5 py-1 text-xs text-muted">{it}</span>
        ))}
      </div>
    </div>
  );
}
