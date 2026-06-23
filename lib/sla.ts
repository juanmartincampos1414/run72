export const SLA_HOURS = 72;

export type SlaBucket = "green" | "yellow" | "orange" | "red" | "expired";

export type Sla = {
  active: boolean;
  startedAt: string | null;
  deadlineAt: string | null;
  elapsedH: number;
  remainingH: number;
  pct: number; // % consumido (0-100)
  bucket: SlaBucket;
  overdue: boolean;
};

/** Calcula el estado del SLA 72h a partir del inicio de producción. */
export function computeSla(
  startedAt: string | null | undefined,
  deadlineAt?: string | null,
  now: number = Date.now(),
): Sla {
  if (!startedAt) {
    return {
      active: false,
      startedAt: null,
      deadlineAt: null,
      elapsedH: 0,
      remainingH: SLA_HOURS,
      pct: 0,
      bucket: "green",
      overdue: false,
    };
  }
  const start = new Date(startedAt).getTime();
  const deadline = deadlineAt
    ? new Date(deadlineAt).getTime()
    : start + SLA_HOURS * 3600000;
  const elapsedH = Math.max(0, (now - start) / 3600000);
  const remainingH = (deadline - now) / 3600000;
  const pct = Math.min(100, Math.max(0, (elapsedH / SLA_HOURS) * 100));

  let bucket: SlaBucket;
  if (remainingH <= 0) bucket = "expired";
  else if (remainingH < 12) bucket = "red";
  else if (remainingH < 24) bucket = "orange";
  else if (remainingH <= 48) bucket = "yellow";
  else bucket = "green";

  return {
    active: true,
    startedAt,
    deadlineAt: new Date(deadline).toISOString(),
    elapsedH: Math.round(elapsedH),
    remainingH: Math.round(remainingH),
    pct: Math.round(pct),
    bucket,
    overdue: remainingH <= 0,
  };
}

export const SLA_COLOR: Record<SlaBucket, { bar: string; text: string; label: string }> = {
  green: { bar: "from-emerald-400 to-emerald-500", text: "text-emerald-400", label: "En tiempo" },
  yellow: { bar: "from-amber-300 to-amber-400", text: "text-amber-300", label: "Atención" },
  orange: { bar: "from-orange-400 to-orange-500", text: "text-orange-400", label: "Urgente" },
  red: { bar: "from-red-400 to-red-500", text: "text-red-400", label: "Crítico" },
  expired: { bar: "from-red-600 to-red-700", text: "text-red-500", label: "Fuera de SLA" },
};

/** ¿El lead está en ventana de producción (SLA corriendo)? */
export function isActiveProject(lead: {
  status: string;
  production_started_at: string | null;
}): boolean {
  return Boolean(lead.production_started_at) && lead.status === "en_produccion";
}

/* ---------------- Estados de pago (badges) ---------------- */

export type AnticipoState =
  | "pendiente"
  | "mercadopago"
  | "comprobante_recibido"
  | "confirmado";

export function anticipoState(lead: {
  status: string;
  payment_status: string | null;
  comprobante_status: string | null;
}): AnticipoState {
  const confirmedStatuses = ["adelanto_pagado", "en_produccion", "entregado", "cobrado_completo"];
  if (lead.payment_status === "approved") return "mercadopago";
  if (confirmedStatuses.includes(lead.status) || lead.comprobante_status === "aprobado")
    return "confirmado";
  if (lead.comprobante_status === "recibido") return "comprobante_recibido";
  return "pendiente";
}

export const ANTICIPO_LABEL: Record<AnticipoState, { label: string; cls: string }> = {
  pendiente: { label: "Anticipo pendiente", cls: "bg-white/[0.05] text-faint" },
  mercadopago: { label: "✅ MercadoPago confirmado", cls: "bg-emerald-500/15 text-emerald-300" },
  comprobante_recibido: { label: "Verificación pendiente", cls: "bg-amber-500/15 text-amber-300" },
  confirmado: { label: "Anticipo confirmado", cls: "bg-brand-cyan/15 text-brand-cyan" },
};

export function saldoState(lead: { status: string }): { label: string; cls: string } {
  return lead.status === "cobrado_completo"
    ? { label: "Saldo confirmado", cls: "bg-emerald-500/15 text-emerald-300" }
    : { label: "Saldo pendiente", cls: "bg-white/[0.05] text-faint" };
}
