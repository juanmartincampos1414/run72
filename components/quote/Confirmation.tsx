"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatARS } from "@/lib/pricing";
import type { QuoteResult } from "@/lib/types";
import { CheckIcon, BoltIcon } from "../icons";
import { Button } from "../ui/Button";

const ease = [0.16, 1, 0.3, 1] as const;

type PublicConfig = {
  bank_cbu: string | null;
  bank_alias: string | null;
  bank_holder: string | null;
  mp_enabled: boolean;
};

export function Confirmation({
  result,
  name,
  onRestart,
}: {
  result: QuoteResult;
  name: string;
  onRestart: () => void;
}) {
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [payMethod, setPayMethod] = useState<"mp" | "transfer">("mp");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/config/public")
      .then((r) => r.json())
      .then((c) => setConfig(c))
      .catch(() => setConfig(null));
  }, []);

  useEffect(() => {
    if (config && !config.mp_enabled) setPayMethod("transfer");
  }, [config]);

  async function payWithMP() {
    setPaying(true);
    setPayError(null);
    try {
      const res = await fetch("/api/payments/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: result.leadId }),
      });
      const data = await res.json();
      if (!res.ok || !data.init_point)
        throw new Error(data.error ?? "No se pudo iniciar el pago.");
      window.location.href = data.init_point;
    } catch (e) {
      setPayError(e instanceof Error ? e.message : "Error inesperado.");
      setPaying(false);
    }
  }

  const hasAmount = result.deposit > 0;

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
          {name ? `${name.split(" ")[0]}, ` : ""}este es tu proyecto. Aboná el
          adelanto del {result.depositPercent}% y entramos a producción.
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
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-muted">Subtotal</span>
            <span className="tabular-nums text-fg">{formatARS(result.subtotal)}</span>
          </div>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-muted">IVA (21%)</span>
            <span className="tabular-nums text-fg">{formatARS(result.iva)}</span>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-t border-line pt-3">
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

      {/* Pago */}
      {hasAmount ? (
        <div className="mt-5 rounded-3xl border border-line bg-surface/30 p-6">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Iniciá tu proyecto
          </h2>
          <p className="mt-1 text-sm text-muted">
            Aboná el adelanto de{" "}
            <span className="font-medium text-fg">{formatARS(result.deposit)}</span>{" "}
            para entrar a producción.
          </p>

          {/* Selector de método */}
          <div className="mt-5 flex gap-2 rounded-full border border-line bg-ink/40 p-1">
            {config?.mp_enabled !== false && (
              <MethodTab
                active={payMethod === "mp"}
                onClick={() => setPayMethod("mp")}
                label="MercadoPago"
              />
            )}
            <MethodTab
              active={payMethod === "transfer"}
              onClick={() => setPayMethod("transfer")}
              label="Transferencia"
            />
          </div>

          <div className="mt-5">
            {payMethod === "mp" ? (
              <div>
                <button
                  type="button"
                  onClick={payWithMP}
                  disabled={paying}
                  className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-cyan to-brand-violet px-6 py-3.5 text-[15px] font-semibold text-ink transition-all duration-300 hover:scale-[1.01] disabled:pointer-events-none disabled:opacity-60"
                >
                  {paying
                    ? "Redirigiendo a MercadoPago…"
                    : `Pagar ${formatARS(result.deposit)} con MercadoPago`}
                </button>
                {payError && (
                  <p className="mt-3 text-sm text-red-300">{payError}</p>
                )}
                <p className="mt-3 text-center text-xs text-faint">
                  Pago seguro · Tarjeta, débito o dinero en cuenta
                </p>
              </div>
            ) : (
              <TransferDetails config={config} amount={result.deposit} />
            )}
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-3xl border border-line bg-surface/30 p-6 text-center text-sm text-muted">
          Como elegiste “No estoy seguro”, vamos a definir el alcance y te pasamos
          el presupuesto final para iniciar.
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-4">
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
    </motion.div>
  );
}

function MethodTab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active ? "bg-white text-ink" : "text-muted hover:text-fg"
      }`}
    >
      {label}
    </button>
  );
}

function TransferDetails({
  config,
  amount,
}: {
  config: PublicConfig | null;
  amount: number;
}) {
  const rows = [
    { label: "CBU / CVU", value: config?.bank_cbu },
    { label: "Alias", value: config?.bank_alias },
    { label: "Titular", value: config?.bank_holder },
    { label: "Monto a transferir", value: formatARS(amount), plain: true },
  ];

  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <CopyRow key={r.label} label={r.label} value={r.value} plain={r.plain} />
      ))}
      <p className="mt-1 rounded-xl border border-brand-cyan/25 bg-brand-cyan/[0.06] px-4 py-3 text-xs leading-relaxed text-fg">
        Una vez realizada la transferencia, debés enviar el comprobante a{" "}
        <span className="font-medium">hola@run72.app</span> para iniciar el proyecto.
      </p>
    </div>
  );
}

function CopyRow({
  label,
  value,
  plain,
}: {
  label: string;
  value: string | null | undefined;
  plain?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;

  function copy() {
    navigator.clipboard?.writeText(value!).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-ink/40 px-4 py-3">
      <div className="min-w-0">
        <p className="text-[11px] text-faint">{label}</p>
        <p className="truncate text-sm font-medium tabular-nums">{value}</p>
      </div>
      {!plain && (
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:text-fg"
        >
          {copied ? "Copiado" : "Copiar"}
        </button>
      )}
    </div>
  );
}
