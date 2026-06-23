import type { Service, LineItem } from "./types";

/** Formatea un monto entero en ARS: 350000 -> "$350.000". */
export function formatARS(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Math.round(amount || 0));
}

export type Totals = {
  total: number;
  deposit: number;
  balance: number;
};

/** Calcula total, adelanto y saldo a partir de los ítems y el % de adelanto. */
export function computeTotals(
  lineItems: LineItem[],
  depositPercent = 30,
): Totals {
  const total = lineItems.reduce((sum, i) => sum + (i.price_ars || 0), 0);
  const deposit = Math.round((total * depositPercent) / 100);
  const balance = total - deposit;
  return { total, deposit, balance };
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
  projectType: string | null;
  addons: string[];
  timing: string | null;
  objective: string | null;
  total: number;
}): { score: number; hot: boolean } {
  let score = 0;
  if (input.projectType) score += PROJECT_SCORE[input.projectType] ?? 0;
  for (const a of input.addons) score += ADDON_SCORE[a] ?? 0;
  if (input.timing) score += TIMING_SCORE[input.timing] ?? 0;
  if (input.objective) score += OBJECTIVE_SCORE[input.objective] ?? 0;
  // Bonus por ticket alto
  if (input.total >= 2000000) score += 15;
  else if (input.total >= 1000000) score += 8;

  return { score, hot: score >= HOT_LEAD_THRESHOLD };
}

/** Arma los line items (snapshot de precios) a partir de servicios de la DB. */
export function buildLineItems(
  project: Service | null,
  addons: Service[],
): LineItem[] {
  const items: LineItem[] = [];
  if (project) items.push({ name: project.name, price_ars: project.price_ars });
  for (const a of addons) items.push({ name: a.name, price_ars: a.price_ars });
  return items;
}
