"use client";

import { AnimatePresence, motion } from "framer-motion";
import { formatARS } from "@/lib/pricing";
import type { Microservice } from "@/lib/types";
import { cn } from "@/lib/cn";

const ease = [0.16, 1, 0.3, 1] as const;

type Props = {
  open: boolean;
  serviceName: string;
  micros: Microservice[];
  selected: Set<string>; // claves "service_slug:slug"
  onToggle: (key: string) => void;
  onClose: () => void;
};

export function MicroserviceDrawer({
  open,
  serviceName,
  micros,
  selected,
  onToggle,
  onClose,
}: Props) {
  const groups = micros.reduce<Record<string, Microservice[]>>((acc, m) => {
    (acc[m.group_name] ??= []).push(m);
    return acc;
  }, {});

  const selectedTotal = micros
    .filter((m) => selected.has(`${m.service_slug}:${m.slug}`))
    .reduce((s, m) => s + m.price_ars, 0);
  const selectedCount = micros.filter((m) =>
    selected.has(`${m.service_slug}:${m.slug}`),
  ).length;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-line bg-ink"
            role="dialog"
            aria-label={`Configurar ${serviceName}`}
          >
            <header className="flex items-center justify-between border-b border-line p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-faint">Configurar</p>
                <h2 className="font-display text-lg font-semibold tracking-tight">{serviceName}</h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="flex h-9 w-9 items-center justify-center rounded-full glass text-muted hover:text-fg"
              >
                ✕
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-5">
              {micros.length === 0 ? (
                <p className="py-10 text-center text-sm text-faint">
                  Este servicio todavía no tiene microservicios configurables.
                </p>
              ) : (
                Object.entries(groups).map(([group, items]) => (
                  <div key={group} className="mb-6">
                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-faint">
                      {group}
                    </p>
                    <div className="flex flex-col gap-2.5">
                      {items.map((m) => {
                        const key = `${m.service_slug}:${m.slug}`;
                        const on = selected.has(key);
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => onToggle(key)}
                            className={cn(
                              "flex items-start gap-3 rounded-2xl border p-4 text-left transition-all",
                              on
                                ? "border-transparent bg-gradient-to-br from-brand-blue/[0.12] to-brand-violet/[0.08] ring-1 ring-brand-blue/50"
                                : "border-line bg-surface/40 hover:border-line-strong",
                            )}
                          >
                            {/* Toggle */}
                            <span
                              className={cn(
                                "mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors",
                                on ? "bg-gradient-to-r from-brand-cyan to-brand-violet" : "bg-white/[0.1]",
                              )}
                            >
                              <span
                                className={cn(
                                  "h-4 w-4 rounded-full bg-white transition-transform",
                                  on && "translate-x-4",
                                )}
                              />
                            </span>
                            <span className="flex-1">
                              <span className="flex items-baseline justify-between gap-2">
                                <span className="text-sm font-medium">{m.name}</span>
                                <span className="shrink-0 text-xs font-semibold tabular-nums text-muted">
                                  +{formatARS(m.price_ars)}
                                </span>
                              </span>
                              {m.description && (
                                <span className="mt-1 block text-xs leading-relaxed text-muted">
                                  {m.description}
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            <footer className="border-t border-line p-5">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-muted">{selectedCount} seleccionados</span>
                <span className="font-display font-semibold tabular-nums text-gradient">
                  +{formatARS(selectedTotal)}
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-full rounded-full bg-white py-3 text-sm font-medium text-ink transition-transform hover:scale-[1.01]"
              >
                Listo
              </button>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
