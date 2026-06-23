"use client";

import { AnimatePresence, motion } from "framer-motion";
import { formatARS, computeTotals } from "@/lib/pricing";
import type { LineItem } from "@/lib/types";
import { BoltIcon } from "../icons";

type Props = {
  lineItems: LineItem[];
  depositPercent?: number;
  pending?: boolean;
};

export function CostPanel({ lineItems, depositPercent = 30, pending }: Props) {
  const { total, deposit, balance } = computeTotals(lineItems, depositPercent);
  const hasItems = lineItems.length > 0;

  return (
    <div className="glass rounded-3xl p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2 border-b border-line pb-4">
        <BoltIcon className="h-4 w-4 text-brand-cyan" />
        <span className="text-sm font-medium tracking-tight">Tu presupuesto</span>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-2.5 py-1 text-[11px] text-faint">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          en vivo
        </span>
      </div>

      {!hasItems ? (
        <p className="py-6 text-center text-sm text-faint">
          Elegí tu proyecto y los servicios para ver el presupuesto en tiempo real.
        </p>
      ) : (
        <ul className="space-y-2.5">
          <AnimatePresence initial={false}>
            {lineItems.map((item) => (
              <motion.li
                key={item.name}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-baseline justify-between gap-3 text-sm"
              >
                <span className="text-muted">{item.name}</span>
                <span className="shrink-0 tabular-nums text-fg">
                  {item.price_ars > 0 ? formatARS(item.price_ars) : "a definir"}
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <div className="mt-5 space-y-3 border-t border-line pt-4">
        <Row label="Total" value={formatARS(total)} strong />
        <Row
          label={`Adelanto (${depositPercent}%)`}
          value={formatARS(deposit)}
          accent
        />
        <Row label={`Saldo (${100 - depositPercent}%)`} value={formatARS(balance)} />
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-faint">
        El adelanto del {depositPercent}% inicia la producción. El saldo se abona al
        finalizar la entrega.
      </p>

      {pending && (
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full w-1/3 rounded-full bg-gradient-to-r from-brand-cyan to-brand-violet"
            animate={{ x: ["-100%", "300%"] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  strong,
  accent,
}: {
  label: string;
  value: string;
  strong?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className={strong ? "text-sm font-medium text-fg" : "text-sm text-muted"}>
        {label}
      </span>
      <span
        className={
          accent
            ? "font-display text-lg font-semibold tabular-nums text-gradient"
            : strong
              ? "font-display text-lg font-semibold tabular-nums text-fg"
              : "text-sm tabular-nums text-muted"
        }
      >
        {value}
      </span>
    </div>
  );
}
