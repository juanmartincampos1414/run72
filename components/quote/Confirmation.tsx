"use client";

import { motion } from "framer-motion";
import { formatARS } from "@/lib/pricing";
import type { QuoteResult } from "@/lib/types";
import { CheckIcon, BoltIcon } from "../icons";
import { Button } from "../ui/Button";

const ease = [0.16, 1, 0.3, 1] as const;

export function Confirmation({
  result,
  name,
  onRestart,
}: {
  result: QuoteResult;
  name: string;
  onRestart: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
      className="mx-auto max-w-2xl"
    >
      <div className="flex flex-col items-center text-center">
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease }}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-cyan to-brand-violet text-ink glow-violet"
        >
          <CheckIcon className="h-7 w-7" strokeWidth={2.5} />
        </motion.span>
        <h1 className="mt-6 text-balance font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          Tu proyecto está listo para{" "}
          <span className="text-gradient">RUN72.</span>
        </h1>
        <p className="mt-3 max-w-md text-pretty text-muted">
          {name ? `${name.split(" ")[0]}, ` : ""}configuramos tu proyecto y guardamos
          tu presupuesto. Este es el resumen.
        </p>
      </div>

      {/* Resumen */}
      <div className="glass mt-8 rounded-3xl p-6 sm:p-7">
        {result.projectLabel && (
          <div className="mb-4 flex items-center gap-2">
            <BoltIcon className="h-4 w-4 text-brand-cyan" />
            <span className="text-sm font-medium tracking-tight">
              {result.projectLabel}
            </span>
          </div>
        )}

        <ul className="space-y-2.5 border-b border-line pb-5">
          {result.lineItems.map((item) => (
            <li
              key={item.name}
              className="flex items-baseline justify-between gap-3 text-sm"
            >
              <span className="text-muted">{item.name}</span>
              <span className="tabular-nums text-fg">
                {item.price_ars > 0 ? formatARS(item.price_ars) : "a definir"}
              </span>
            </li>
          ))}
        </ul>

        <div className="space-y-3 pt-5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-medium">Total del proyecto</span>
            <span className="font-display text-xl font-semibold tabular-nums">
              {formatARS(result.total)}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-brand-blue/30 bg-gradient-to-br from-brand-blue/[0.12] to-brand-violet/[0.06] p-4">
              <p className="text-xs text-muted">
                Adelanto ({result.depositPercent}%) para iniciar
              </p>
              <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-gradient">
                {formatARS(result.deposit)}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-surface/40 p-4">
              <p className="text-xs text-muted">
                Saldo ({100 - result.depositPercent}%) al finalizar
              </p>
              <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-fg">
                {formatARS(result.balance)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Próximo paso: pago (Fase 2) */}
      <div className="mt-5 rounded-3xl border border-line bg-surface/30 p-6 text-center">
        <p className="text-sm text-muted">
          El próximo paso es abonar el adelanto de{" "}
          <span className="font-medium text-fg">{formatARS(result.deposit)}</span>{" "}
          para entrar a producción. Vamos a habilitar el pago con MercadoPago y
          transferencia en este mismo flujo.
        </p>
        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/" variant="secondary" size="md">
            Volver al inicio
          </Button>
          <button
            type="button"
            onClick={onRestart}
            className="text-sm text-faint transition-colors hover:text-fg"
          >
            Configurar otro proyecto
          </button>
        </div>
      </div>
    </motion.div>
  );
}
