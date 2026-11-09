"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "../Logo";
import { CheckIcon, BoltIcon, MailIcon } from "../icons";
import { cn } from "@/lib/cn";
import { SITE } from "@/lib/content";
import type { ProjectPreview as Preview } from "@/lib/types";

const ease = [0.16, 1, 0.3, 1] as const;

type State = "loading" | "ready" | "error";

/** Propuesta guardada por el admin (lib: /api/admin/proposal). */
type Proposal = {
  summary?: string;
  detectedNeeds?: string[];
  draft?: string;
  missing?: string[];
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
        // La propuesta se ve aunque no haya pago. Con que haya narrativa O
        // preview visual, mostramos la página; solo es error si no hay nada.
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

  const intro = proposal?.summary || preview?.interpretation || "";

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="container-x flex items-center justify-between py-4">
          <Link href="/" aria-label="RUN — inicio">
            <Logo />
          </Link>
          <Link href="/" className="text-sm text-muted transition-colors hover:text-fg">
            Volver al sitio
          </Link>
        </div>
      </header>

      <main className="container-x py-10 md:py-14">
        {state === "loading" && (
          <Centered
            title="Preparando tu propuesta"
            text="Estamos ordenando todo lo que hablamos para mostrártelo acá. Puede tardar un minuto."
            spinner
          />
        )}

        {state === "error" && (
          <div className="mx-auto max-w-3xl">
            <Centered
              title="Estamos preparando tu propuesta"
              text="En un momento vas a ver acá todo lo que conversamos y la primera visión de tu proyecto. Si no aparece en un rato, recargá la página o escribinos."
            />
            <Contact />
          </div>
        )}

        {state === "ready" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="mx-auto max-w-3xl"
          >
            <div className="flex flex-col items-center text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-cyan to-brand-violet text-ink glow-violet">
                <CheckIcon className="h-7 w-7" strokeWidth={2.5} />
              </span>
              <h1 className="mt-6 text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                {clientName ? `${clientName}, esta es tu propuesta` : "Tu propuesta de RUN"}
              </h1>
              {intro && <p className="mt-3 max-w-xl text-pretty text-muted">{intro}</p>}
            </div>

            {/* Narrativa de la propuesta: qué entendimos, qué proponemos, próximos pasos */}
            {proposal?.draft && (
              <section className="mt-8 rounded-3xl border border-line bg-surface/40 p-6 sm:p-8">
                <p className="mb-4 flex items-center gap-2 text-sm font-medium text-brand-cyan">
                  <BoltIcon className="h-4 w-4" /> La propuesta
                </p>
                <div className="prose-proposal whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-fg/90">
                  {proposal.draft}
                </div>
              </section>
            )}

            {/* Lo que detectamos */}
            {proposal?.detectedNeeds && proposal.detectedNeeds.length > 0 && (
              <div className="mt-6 rounded-3xl border border-line bg-surface/40 p-5">
                <p className="mb-3 text-sm font-medium">Lo que entendimos que necesitás</p>
                <ul className="flex flex-col gap-2">
                  {proposal.detectedNeeds.map((n) => (
                    <li key={n} className="flex items-start gap-2 text-sm text-muted">
                      <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-blue" /> {n}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preview visual */}
            {preview && (
              <>
                {(preview.detectedFunctionalities.length > 0 ||
                  preview.includedDeliverables.length > 0) && (
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {preview.detectedFunctionalities.length > 0 && (
                      <div className="rounded-3xl border border-line bg-surface/40 p-5">
                        <p className="mb-3 flex items-center gap-2 text-sm font-medium">
                          <BoltIcon className="h-4 w-4 text-brand-cyan" /> Funcionalidades
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {preview.detectedFunctionalities.map((f) => (
                            <span
                              key={f}
                              className="rounded-full border border-line bg-ink/40 px-3 py-1 text-xs text-muted"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {preview.includedDeliverables.length > 0 && (
                      <div className="rounded-3xl border border-line bg-surface/40 p-5">
                        <p className="mb-3 text-sm font-medium">Entregables incluidos</p>
                        <ul className="flex flex-col gap-2">
                          {preview.includedDeliverables.map((d) => (
                            <li key={d} className="flex items-center gap-2 text-sm text-muted">
                              <CheckIcon className="h-3.5 w-3.5 shrink-0 text-brand-blue" /> {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {preview.mockups.length > 0 && (
                  <div className="mt-10">
                    <h2 className="text-center font-display text-2xl font-semibold tracking-tight">
                      Cómo se vería
                    </h2>
                    <p className="mx-auto mt-2 max-w-lg text-center text-sm text-muted">
                      Una primera visión navegable de la etapa que proponemos arrancar.
                    </p>
                    <div className="mt-8 space-y-8">
                      {preview.mockups.map((m, i) => (
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
                            <iframe
                              title={m.title}
                              sandbox=""
                              srcDoc={m.html}
                              className="h-[560px] w-full"
                              loading="lazy"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disclaimer (solo si hay mockups) */}
                {preview.mockups.length > 0 && (
                  <p className="mt-8 rounded-2xl border border-line bg-surface/30 p-4 text-xs leading-relaxed text-faint">
                    Las imágenes mostradas son representaciones conceptuales generadas mediante
                    inteligencia artificial para visualizar el resultado esperado. El producto final
                    podrá sufrir ajustes funcionales, visuales o técnicos durante el proceso de
                    desarrollo.
                  </p>
                )}
              </>
            )}

            {/* Próximos pasos / contacto */}
            <NextSteps />

            {/* Feedback */}
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
                  placeholder="¿Qué ajustarías de esta visión?"
                  className="rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm text-fg outline-none transition-colors placeholder:text-faint focus:border-brand-blue/60 focus:bg-surface-2"
                />
              </label>
              {saved && <p className="mt-2 text-sm text-emerald-400">Guardado ✓</p>}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

/** Próximos pasos: invita a seguir la conversación. Sin presión de pago. */
function NextSteps() {
  return (
    <div className="mt-8 rounded-3xl border border-brand-cyan/25 bg-brand-cyan/[0.06] p-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-cyan to-brand-violet text-ink">
          <BoltIcon className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <div>
          <p className="font-display text-lg font-semibold tracking-tight">Próximos pasos</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Revisá la propuesta con calma. Cuando quieras, coordinamos para{" "}
            <span className="text-fg">ajustar lo que haga falta y arrancar con la primera etapa</span>.
            Cualquier duda, estamos a un mensaje.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Escribinos a{" "}
            <a
              href={`mailto:${SITE.email}`}
              className="inline-flex items-center gap-1.5 font-medium text-brand-cyan hover:underline"
            >
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

function Centered({
  title,
  text,
  spinner,
}: {
  title: string;
  text: string;
  spinner?: boolean;
}) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
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
