"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "../Logo";
import { CheckIcon, BoltIcon, MailIcon } from "../icons";
import { cn } from "@/lib/cn";
import { SITE } from "@/lib/content";
import { formatARS, IVA_RATE } from "@/lib/pricing";
import type { ProjectPreview as Preview } from "@/lib/types";

const ease = [0.16, 1, 0.3, 1] as const;

type State = "loading" | "ready" | "error";

type Opportunity = { title: string; build: string; revenue: string; read: string };
type Scenario = {
  key: string;
  name: string;
  tagline: string;
  includes: string[];
  total: number; // con IVA
  deposit: number;
  recommended?: boolean;
};
type Option = { slug: string; name: string; detail: string; price_ars: number }; // sin IVA
type Proposal = {
  positioning?: string;
  summary?: string;
  opportunities?: Opportunity[];
  recommendation?: string;
  phase1?: { title: string; why: string; scope: string[] };
  nextPhases?: { title: string; detail: string }[];
  scenarios?: Scenario[];
  options?: Option[];
  depositPercent?: number;
  // compat formato viejo
  draft?: string;
};

export function ProjectPreview({ leadId }: { leadId: string }) {
  const [state, setState] = useState<State>("loading");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [clientName, setClientName] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [comments, setComments] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch("/api/preview/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadId }),
        });
        const data = await res.json();
        if (!alive) return;
        if (data.proposal) setProposal(data.proposal as Proposal);
        if (data.name) setClientName(data.name as string);
        if (data.preview) setPreview(data.preview as Preview);
        if (data.proposal || data.preview) setState("ready");
        else setState("error");
      } catch {
        if (alive) setState("error");
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [leadId]);

  async function saveFeedback(r: number, c: string) {
    setRating(r);
    setSaved(false);
    await fetch("/api/preview/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, rating: r, comments: c }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const structured = Array.isArray(proposal?.scenarios) && proposal!.scenarios!.length > 0;
  const hasMockups = !!preview && preview.mockups.length > 0;

  const nav = [
    proposal?.opportunities?.length ? { id: "oportunidad", label: "Oportunidad" } : null,
    proposal?.phase1 ? { id: "propuesta", label: "Propuesta" } : null,
    structured ? { id: "inversion", label: "Inversión" } : null,
    hasMockups ? { id: "preview", label: "Cómo se vería" } : null,
  ].filter(Boolean) as { id: string; label: string }[];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-ink/80 backdrop-blur">
        <div className="container-x flex items-center justify-between py-3.5">
          <Link href="/" aria-label="RUN — inicio">
            <Logo />
          </Link>
          {nav.length > 0 && (
            <nav className="hidden items-center gap-5 text-sm text-muted md:flex">
              {nav.map((n) => (
                <a key={n.id} href={`#${n.id}`} className="transition-colors hover:text-fg">
                  {n.label}
                </a>
              ))}
            </nav>
          )}
          <Link href="/" className="text-sm text-muted transition-colors hover:text-fg">
            Volver
          </Link>
        </div>
      </header>

      <main>
        {state === "loading" && (
          <div className="container-x">
            <Centered title="Preparando tu propuesta" text="Estamos ordenando todo lo que hablamos. Un momento." spinner />
          </div>
        )}

        {state === "error" && (
          <div className="container-x mx-auto max-w-2xl">
            <Centered
              title="Estamos preparando tu propuesta"
              text="En un momento vas a ver todo lo que conversamos y la primera visión de tu proyecto. Si no aparece, recargá o escribinos."
            />
            <Contact />
          </div>
        )}

        {state === "ready" && proposal && (
          <>
            {/* HERO */}
            <section className="border-b border-line bg-gradient-to-b from-surface/40 to-transparent">
              <div className="container-x py-16 md:py-24">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease }}
                  className="max-w-3xl"
                >
                  <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-brand-cyan">
                    Propuesta {clientName ? `· ${clientName}` : ""}
                  </p>
                  <h1 className="text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
                    {proposal.positioning || "Tu propuesta de RUN"}
                  </h1>
                  {proposal.summary && (
                    <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted">{proposal.summary}</p>
                  )}
                </motion.div>
              </div>
            </section>

            {/* 01 · OPORTUNIDAD */}
            {proposal.opportunities && proposal.opportunities.length > 0 && (
              <Section id="oportunidad" index="01" title="La oportunidad" kicker="Cómo leemos tu negocio">
                <OpportunityTable rows={proposal.opportunities} />
                {proposal.recommendation && (
                  <div className="mt-8 rounded-3xl border border-brand-cyan/25 bg-brand-cyan/[0.06] p-6 sm:p-8">
                    <p className="mb-2 flex items-center gap-2 text-sm font-medium text-brand-cyan">
                      <BoltIcon className="h-4 w-4" /> Nuestra recomendación
                    </p>
                    <p className="text-pretty text-[15px] leading-relaxed text-fg/90">{proposal.recommendation}</p>
                  </div>
                )}
              </Section>
            )}

            {/* 02 · PROPUESTA */}
            {proposal.phase1 && (
              <Section id="propuesta" index="02" title="Qué proponemos" kicker="Por dónde arrancamos">
                <div className="rounded-3xl border border-line bg-surface/40 p-6 sm:p-8">
                  <h3 className="font-display text-2xl font-semibold tracking-tight">{proposal.phase1.title}</h3>
                  {proposal.phase1.why && <p className="mt-2 text-muted">{proposal.phase1.why}</p>}
                  {proposal.phase1.scope?.length > 0 && (
                    <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                      {proposal.phase1.scope.map((s) => (
                        <li key={s} className="flex items-start gap-2 text-sm text-fg/90">
                          <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" /> {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {proposal.nextPhases && proposal.nextPhases.length > 0 && (
                  <div className="mt-6">
                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-faint">Próximas fases</p>
                    <div className="grid gap-4 sm:grid-cols-3">
                      {proposal.nextPhases.map((p, i) => (
                        <div key={i} className="rounded-2xl border border-line bg-surface/30 p-5">
                          <p className="font-medium">{p.title}</p>
                          <p className="mt-1 text-sm text-muted">{p.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Section>
            )}

            {/* Compat formato viejo: draft */}
            {!structured && proposal.draft && (
              <Section id="propuesta" index="·" title="La propuesta">
                <div className="whitespace-pre-wrap rounded-3xl border border-line bg-surface/40 p-6 text-[15px] leading-relaxed text-fg/90 sm:p-8">
                  {proposal.draft}
                </div>
              </Section>
            )}

            {/* 03 · INVERSIÓN (interactivo) */}
            {structured && (
              <Section id="inversion" index="03" title="La inversión" kicker="Armá tu plan y mirá el número en vivo">
                <InvestmentBuilder
                  scenarios={proposal.scenarios!}
                  options={proposal.options ?? []}
                  depositPercent={proposal.depositPercent ?? 30}
                />
              </Section>
            )}

            {/* 04 · CÓMO SE VERÍA */}
            {hasMockups && (
              <Section id="preview" index="04" title="Cómo se vería" kicker="Una primera visión navegable">
                {preview!.interpretation && (
                  <p className="mb-6 max-w-2xl text-muted">{preview!.interpretation}</p>
                )}
                <div className="space-y-8">
                  {preview!.mockups.map((m, i) => (
                    <motion.div
                      key={`${m.title}-${i}`}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.5, ease }}
                    >
                      <h3 className="font-display text-lg font-semibold tracking-tight">{m.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{m.description}</p>
                      <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-white glow-violet">
                        <iframe title={m.title} sandbox="" srcDoc={m.html} className="h-[620px] w-full" loading="lazy" />
                      </div>
                    </motion.div>
                  ))}
                </div>
                <p className="mt-8 rounded-2xl border border-line bg-surface/30 p-4 text-xs leading-relaxed text-faint">
                  Las imágenes son representaciones conceptuales generadas con IA para visualizar el resultado esperado.
                  El producto final puede tener ajustes visuales, funcionales o técnicos durante el desarrollo.
                </p>
              </Section>
            )}

            {/* PRÓXIMOS PASOS + FEEDBACK */}
            <section className="border-t border-line">
              <div className="container-x py-14">
                <div className="mx-auto max-w-2xl">
                  <NextSteps />
                  <div className="mt-6 rounded-3xl border border-line bg-surface/30 p-6">
                    <p className="text-sm font-medium">¿Qué tan cerca está de lo que imaginabas?</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {Array.from({ length: 10 }).map((_, i) => {
                        const n = i + 1;
                        return (
                          <button
                            key={n}
                            type="button"
                            onClick={() => saveFeedback(n, comments)}
                            className={cn(
                              "h-10 w-10 rounded-xl border text-sm font-medium tabular-nums transition-all",
                              rating === n
                                ? "border-transparent bg-gradient-to-br from-brand-cyan to-brand-violet text-ink"
                                : "border-line bg-ink/40 text-muted hover:border-line-strong hover:text-fg",
                            )}
                          >
                            {n}
                          </button>
                        );
                      })}
                    </div>
                    <label className="mt-5 flex flex-col gap-1.5">
                      <span className="text-sm text-muted">Comentarios o ajustes (opcional)</span>
                      <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        onBlur={() => rating && saveFeedback(rating, comments)}
                        rows={3}
                        placeholder="¿Qué ajustarías?"
                        className="rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm text-fg outline-none transition-colors placeholder:text-faint focus:border-brand-blue/60 focus:bg-surface-2"
                      />
                    </label>
                    {saved && <p className="mt-2 text-sm text-emerald-400">Guardado ✓</p>}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

/** Tabla de oportunidades (desktop) / cards (mobile). */
function OpportunityTable({ rows }: { rows: Opportunity[] }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-3xl border border-line md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-surface/40 text-left text-xs uppercase tracking-wide text-faint">
              <th className="px-5 py-3 font-medium">Oportunidad</th>
              <th className="px-5 py-3 font-medium">Qué construiríamos</th>
              <th className="px-5 py-3 font-medium">Cómo genera ingresos</th>
              <th className="px-5 py-3 font-medium">Nuestra lectura</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-line/60 last:border-0 align-top">
                <td className="px-5 py-4 font-medium text-fg">{r.title}</td>
                <td className="px-5 py-4 text-muted">{r.build}</td>
                <td className="px-5 py-4 text-muted">{r.revenue}</td>
                <td className="px-5 py-4 text-fg/80">{r.read}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">
        {rows.map((r, i) => (
          <div key={i} className="rounded-2xl border border-line bg-surface/40 p-5">
            <p className="font-medium text-fg">{r.title}</p>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Qué construiríamos" value={r.build} />
              <Row label="Cómo genera ingresos" value={r.revenue} />
              <Row label="Nuestra lectura" value={r.read} />
            </dl>
          </div>
        ))}
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-faint">{label}</dt>
      <dd className="text-muted">{value}</dd>
    </div>
  );
}

/** Constructor de inversión interactivo: escenario + módulos opcionales → recalcula. */
function InvestmentBuilder({
  scenarios,
  options,
  depositPercent,
}: {
  scenarios: Scenario[];
  options: Option[];
  depositPercent: number;
}) {
  const recommended = scenarios.find((s) => s.recommended) ?? scenarios[0];
  const [key, setKey] = useState(recommended?.key ?? scenarios[0]?.key);
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const scenario = scenarios.find((s) => s.key === key) ?? scenarios[0];

  const { total, deposit } = useMemo(() => {
    const optSubtotal = options.filter((o) => picked.has(o.slug)).reduce((a, o) => a + o.price_ars, 0);
    const optTotal = Math.round(optSubtotal * (1 + IVA_RATE));
    const t = (scenario?.total ?? 0) + optTotal;
    return { total: t, deposit: Math.round((t * depositPercent) / 100) };
  }, [scenario, options, picked, depositPercent]);

  function toggle(slug: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div>
        {/* Escenarios */}
        <div className="grid gap-4 sm:grid-cols-3">
          {scenarios.map((s) => {
            const active = s.key === key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setKey(s.key)}
                className={cn(
                  "rounded-3xl border p-5 text-left transition-all",
                  active ? "border-brand-cyan bg-brand-cyan/[0.06] ring-1 ring-brand-cyan/40" : "border-line bg-surface/40 hover:border-line-strong",
                )}
              >
                {s.recommended && (
                  <span className="mb-2 inline-block rounded-full bg-gradient-to-r from-brand-cyan to-brand-violet px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink">
                    Recomendado
                  </span>
                )}
                <p className="font-display text-lg font-semibold tracking-tight">{s.name}</p>
                <p className="mt-1 text-xs text-muted">{s.tagline}</p>
                <p className="mt-3 font-display text-xl font-semibold tabular-nums">{formatARS(s.total)}</p>
              </button>
            );
          })}
        </div>

        {/* Incluye */}
        {scenario?.includes?.length > 0 && (
          <div className="mt-5 rounded-2xl border border-line bg-surface/30 p-5">
            <p className="mb-3 text-sm font-medium">Incluye</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {scenario.includes.map((it) => (
                <li key={it} className="flex items-start gap-2 text-sm text-muted">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-cyan" /> {it}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Módulos opcionales */}
        {options.length > 0 && (
          <div className="mt-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-faint">Sumá lo que quieras</p>
            <div className="space-y-2">
              {options.map((o) => {
                const on = picked.has(o.slug);
                return (
                  <button
                    key={o.slug}
                    type="button"
                    onClick={() => toggle(o.slug)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all",
                      on ? "border-brand-cyan bg-brand-cyan/[0.06]" : "border-line bg-surface/40 hover:border-line-strong",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                        on ? "border-transparent bg-gradient-to-br from-brand-cyan to-brand-violet text-ink" : "border-line-strong",
                      )}
                    >
                      {on && <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-fg">{o.name}</span>
                      <span className="block text-xs text-muted">{o.detail}</span>
                    </span>
                    <span className="shrink-0 text-sm font-medium tabular-nums text-muted">
                      + {formatARS(Math.round(o.price_ars * (1 + IVA_RATE)))}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Resumen pegajoso */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-line bg-surface/50 p-6">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">Inversión total</p>
          <p className="mt-1 font-display text-4xl font-semibold tabular-nums">{formatARS(total)}</p>
          <p className="mt-1 text-sm text-muted">IVA incluido</p>
          <div className="my-5 h-px bg-line" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Para arrancar ({depositPercent}%)</span>
            <span className="font-medium tabular-nums text-fg">{formatARS(deposit)}</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-sm">
            <span className="text-muted">Saldo a la entrega</span>
            <span className="font-medium tabular-nums text-fg">{formatARS(total - deposit)}</span>
          </div>
          <a
            href={`mailto:${SITE.email}?subject=Quiero avanzar con mi proyecto`}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-cyan to-brand-violet px-5 py-3 text-sm font-semibold text-ink transition hover:brightness-110"
          >
            Quiero avanzar
          </a>
          <p className="mt-3 text-center text-xs text-faint">Ajustá el plan arriba — este número se actualiza solo.</p>
        </div>
      </div>
    </div>
  );
}

function NextSteps() {
  return (
    <div className="rounded-3xl border border-brand-cyan/25 bg-brand-cyan/[0.06] p-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-cyan to-brand-violet text-ink">
          <BoltIcon className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <div>
          <p className="font-display text-lg font-semibold tracking-tight">Próximos pasos</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Revisá la propuesta con calma. Cuando quieras, coordinamos para{" "}
            <span className="text-fg">ajustar el alcance y arrancar con la primera etapa</span>.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Escribinos a{" "}
            <a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-1.5 font-medium text-brand-cyan hover:underline">
              <MailIcon className="h-4 w-4" />
              {SITE.email}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function Contact() {
  return (
    <div className="mx-auto mt-6 max-w-md text-center text-sm text-muted">
      ¿Dudas?{" "}
      <a href={`mailto:${SITE.email}`} className="font-medium text-brand-cyan hover:underline">
        {SITE.email}
      </a>
    </div>
  );
}

function Section({
  id,
  index,
  title,
  kicker,
  children,
}: {
  id: string;
  index: string;
  title: string;
  kicker?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-b border-line">
      <div className="container-x py-14 md:py-20">
        <div className="mb-8 flex items-baseline gap-4">
          <span className="font-display text-sm font-semibold tabular-nums text-brand-cyan">{index}</span>
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
            {kicker && <p className="mt-1 text-sm text-muted">{kicker}</p>}
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

function Centered({ title, text, spinner }: { title: string; text: string; spinner?: boolean }) {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      {spinner && (
        <div className="mx-auto mb-5 h-1 w-44 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full w-1/3 rounded-full bg-gradient-to-r from-brand-cyan to-brand-violet"
            animate={{ x: ["-100%", "300%"] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}
      <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 text-pretty text-sm text-muted">{text}</p>
    </div>
  );
}
