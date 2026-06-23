"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "../Logo";
import { CheckIcon, BoltIcon } from "../icons";
import { cn } from "@/lib/cn";
import type { ProjectPreview as Preview } from "@/lib/types";

const ease = [0.16, 1, 0.3, 1] as const;

type State = "loading" | "not_paid" | "ready" | "error";

export function ProjectPreview({ leadId }: { leadId: string }) {
  const [state, setState] = useState<State>("loading");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [comments, setComments] = useState("");
  const [saved, setSaved] = useState(false);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        if (data.paid === false) {
          setState("not_paid");
          pollRef.current = setTimeout(load, 8000); // reintenta hasta que se acredite
          return;
        }
        if (data.preview) {
          setPreview(data.preview as Preview);
          setState("ready");
        } else {
          setState("error");
        }
      } catch {
        if (alive) setState("error");
      }
    }

    load();
    return () => {
      alive = false;
      if (pollRef.current) clearTimeout(pollRef.current);
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

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="container-x flex items-center justify-between py-4">
          <Link href="/" aria-label="RUN72 — inicio">
            <Logo />
          </Link>
          <Link href="/" className="text-sm text-muted transition-colors hover:text-fg">
            Volver al sitio
          </Link>
        </div>
      </header>

      <main className="container-x py-10 md:py-14">
        {state === "not_paid" && (
          <Centered
            title="Estamos confirmando tu pago"
            text="En cuanto se acredite, vas a ver acá la vista previa de tu proyecto. Esta pantalla se actualiza sola."
            spinner
          />
        )}

        {state === "loading" && (
          <Centered
            title="Generando la vista previa de tu proyecto"
            text="Estamos analizando todo lo que nos pasaste para imaginar cómo va a verse. Puede tardar un minuto."
            spinner
          />
        )}

        {state === "error" && (
          <Centered
            title="No pudimos generar la vista previa"
            text="Probá recargar la página en un momento. Tu proyecto ya está en marcha igual."
          />
        )}

        {state === "ready" && preview && (
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
                Vista previa de tu proyecto
              </h1>
              <p className="mt-3 max-w-xl text-pretty text-muted">{preview.interpretation}</p>
            </div>

            {/* Detectado / incluido */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {preview.detectedFunctionalities.length > 0 && (
                <div className="rounded-3xl border border-line bg-surface/40 p-5">
                  <p className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <BoltIcon className="h-4 w-4 text-brand-cyan" /> Funcionalidades detectadas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {preview.detectedFunctionalities.map((f) => (
                      <span key={f} className="rounded-full border border-line bg-ink/40 px-3 py-1 text-xs text-muted">
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

            {/* Mockups */}
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

            {/* Disclaimer */}
            <p className="mt-8 rounded-2xl border border-line bg-surface/30 p-4 text-xs leading-relaxed text-faint">
              Las imágenes mostradas son representaciones conceptuales generadas mediante
              inteligencia artificial para visualizar el resultado esperado. El producto final
              podrá sufrir ajustes funcionales, visuales o técnicos durante el proceso de
              desarrollo.
            </p>

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
