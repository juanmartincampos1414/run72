"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatARS } from "@/lib/pricing";
import { track } from "@/lib/track";
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
  const [scopeAccepted, setScopeAccepted] = useState(false);

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
    track("payment_initiated", { leadId: result.leadId, method: "mercadopago" });
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

      {/* Validación de alcance */}
      {hasAmount && (
        <div className="mt-5 rounded-3xl border border-line bg-surface/30 p-6">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Validación de alcance
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            RUN72 está diseñado para lanzar proyectos digitales en un plazo de 72 horas.
            En algunos casos excepcionales, luego de revisar la información enviada,
            podríamos determinar que el alcance solicitado requiere una complejidad,
            volumen de trabajo o nivel de personalización incompatible con nuestro
            modelo de ejecución rápida.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Si esto ocurriera, nos pondremos en contacto para proponer una alternativa.
            En caso de no avanzar, cualquier pago realizado será reintegrado en su
            totalidad.
          </p>
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-ink/40 p-4">
            <input
              type="checkbox"
              checked={scopeAccepted}
              onChange={(e) => setScopeAccepted(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-brand-violet)]"
            />
            <span className="text-sm text-fg">
              He leído y acepto las condiciones de validación de alcance de RUN72.
            </span>
          </label>
        </div>
      )}

      {/* Pago */}
      {hasAmount ? (
        <div
          className={`mt-5 rounded-3xl border border-line bg-surface/30 p-6 transition-opacity ${
            scopeAccepted ? "" : "pointer-events-none opacity-50"
          }`}
          aria-disabled={!scopeAccepted}
        >
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Iniciá tu proyecto
          </h2>
          {!scopeAccepted && (
            <p className="mt-1 text-xs text-brand-cyan">
              Aceptá las condiciones de validación de alcance para continuar.
            </p>
          )}
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
                  disabled={paying || !scopeAccepted}
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
              <TransferDetails
                config={config}
                amount={result.deposit}
                leadId={result.leadId}
                enabled={scopeAccepted}
              />
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
  leadId,
  enabled,
}: {
  config: PublicConfig | null;
  amount: number;
  leadId: string;
  enabled: boolean;
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
      <ComprobanteUploader leadId={leadId} enabled={enabled} />
    </div>
  );
}

function ComprobanteUploader({ leadId, enabled }: { leadId: string; enabled: boolean }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pick(f: File | null) {
    setError(null);
    if (!f) return;
    const ok = ["image/jpeg", "image/png", "application/pdf"].includes(f.type);
    if (!ok) {
      setError("Formato no permitido. Subí JPG, PNG o PDF.");
      return;
    }
    setFile(f);
    setPreviewUrl(f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
  }

  async function send() {
    if (!file) return;
    setSending(true);
    setError(null);
    track("payment_initiated", { leadId, method: "transferencia" });
    try {
      const form = new FormData();
      form.append("leadId", leadId);
      form.append("file", file);
      const res = await fetch("/api/leads/comprobante", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo enviar el comprobante.");
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="mt-2 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
        <CheckIcon className="h-5 w-5 text-emerald-400" strokeWidth={2.5} />
        <div>
          <p className="text-sm font-medium text-emerald-300">Comprobante recibido</p>
          <p className="text-xs text-muted">
            Lo validamos y, al aprobarlo, tu proyecto entra a producción.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <p className="mb-2 text-sm font-medium">Adjuntá tu comprobante</p>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          pick(e.dataTransfer.files?.[0] ?? null);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed px-4 py-6 text-center transition-colors ${
          dragOver ? "border-brand-cyan bg-brand-cyan/[0.06]" : "border-line-strong bg-surface/40 hover:bg-surface-2/60"
        }`}
      >
        <span className="text-sm font-medium">Arrastrá o hacé clic para subir</span>
        <span className="text-xs text-faint">JPG, PNG o PDF</span>
        <input
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0] ?? null)}
        />
      </label>

      {file && (
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-line bg-ink/40 p-3">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Comprobante" className="h-12 w-12 rounded-lg object-cover" />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/[0.06] text-xs text-muted">
              PDF
            </span>
          )}
          <span className="min-w-0 flex-1 truncate text-sm text-fg">{file.name}</span>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setPreviewUrl(null);
            }}
            className="shrink-0 text-xs text-faint hover:text-red-300"
          >
            Quitar
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}

      <button
        type="button"
        onClick={send}
        disabled={!file || sending || !enabled}
        className="mt-3 w-full rounded-full bg-white py-3 text-sm font-medium text-ink transition-transform hover:scale-[1.01] disabled:pointer-events-none disabled:opacity-50"
      >
        {sending ? "Enviando…" : "Enviar comprobante"}
      </button>
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
