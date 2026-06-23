import type { Service, LineItem } from "./types";

/** Formatea un monto entero en ARS: 350000 -> "$350.000". */
export function formatARS(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Math.round(amount || 0));
}

export const IVA_RATE = 0.21;

export type Totals = {
  subtotal: number;
  iva: number;
  total: number;
  deposit: number;
  balance: number;
};

/**
 * Calcula subtotal, IVA (21%), total (subtotal + IVA), adelanto y saldo.
 * El adelanto/saldo se calculan sobre el total con IVA.
 */
export function computeTotals(
  lineItems: LineItem[],
  depositPercent = 30,
): Totals {
  const subtotal = lineItems.reduce((sum, i) => sum + (i.price_ars || 0), 0);
  const iva = Math.round(subtotal * IVA_RATE);
  const total = subtotal + iva;
  const deposit = Math.round((total * depositPercent) / 100);
  const balance = total - deposit;
  return { subtotal, iva, total, deposit, balance };
}

/* ------------------------------------------------------------------ *
 * Lead scoring — pondera la selección del usuario.
 * Es lógica de negocio (no precios), vive en el server.
 * ------------------------------------------------------------------ */

const PROJECT_SCORE: Record<string, number> = {
  plataforma: 40,
  ecommerce: 30,
  sitio: 15,
  landing: 10,
  branding: 12,
  "estrategia-comercial": 14,
  unsure: 5,
};

const ADDON_SCORE: Record<string, number> = {
  automatizaciones: 15,
  crm: 15,
  campanas: 10,
  estrategia: 10,
  manual: 5,
  logo: 5,
  redes: 5,
};

const TIMING_SCORE: Record<string, number> = {
  asap: 10,
  "30d": 5,
  "90d": 0,
};

const OBJECTIVE_SCORE: Record<string, number> = {
  startup: 10,
  digitalizar: 10,
  clientes: 5,
  validar: 5,
  otro: 3,
};

/** Umbral para etiquetar un lead como 🔥 caliente. */
export const HOT_LEAD_THRESHOLD = 50;

export function computeScore(input: {
  projectTypes: string[];
  addons: string[];
  microservices?: string[];
  timing: string | null;
  objective: string | null;
  total: number;
}): { score: number; hot: boolean } {
  let score = 0;
  for (const p of input.projectTypes) score += PROJECT_SCORE[p] ?? 10;
  for (const a of input.addons) score += ADDON_SCORE[a] ?? 0;
  // Cada microservicio suma intención; integraciones/automatizaciones valen más
  for (const m of input.microservices ?? []) {
    score += /auto|integr|crm|api|suscrip/i.test(m) ? 4 : 2;
  }
  if (input.timing) score += TIMING_SCORE[input.timing] ?? 0;
  if (input.objective) score += OBJECTIVE_SCORE[input.objective] ?? 0;
  // Bonus por ticket alto
  if (input.total >= 2000000) score += 15;
  else if (input.total >= 1000000) score += 8;

  return { score, hot: score >= HOT_LEAD_THRESHOLD };
}

/** Arma los line items (snapshot de precios) a partir de servicios + microservicios. */
export function buildLineItems(
  projects: Service[],
  addons: Service[],
  micros: Array<{ name: string; price_ars: number }> = [],
): LineItem[] {
  const items: LineItem[] = [];
  for (const p of projects) items.push({ name: p.name, price_ars: p.price_ars });
  for (const a of addons) items.push({ name: a.name, price_ars: a.price_ars });
  for (const m of micros) items.push({ name: `↳ ${m.name}`, price_ars: m.price_ars });
  return items;
}
