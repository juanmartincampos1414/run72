/** Tipos compartidos del sistema comercial RUN72. */

export type ServiceType = "project" | "addon";

export type Service = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  price_ars: number;
  type: ServiceType;
  active: boolean;
  sort_order: number;
};

export type LeadStatus =
  | "nuevo"
  | "adelanto_pagado"
  | "en_produccion"
  | "entregado"
  | "cobrado_completo";

export type LineItem = { name: string; price_ars: number };

export type Lead = {
  id: string;
  created_at: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  project_type: string | null;
  project_label: string | null;
  brand_status: string | null;
  objective: string | null;
  timing: string | null;
  addons: Array<{ slug: string; name: string; price_ars: number }>;
  line_items: LineItem[];
  total_ars: number;
  deposit_ars: number;
  balance_ars: number;
  deposit_percent: number;
  score: number;
  hot: boolean;
  status: LeadStatus;
  preference_id: string | null;
  payment_id: string | null;
  payment_status: string | null;
};

/** Payload que envía el configurador al crear un lead. */
export type QuoteSubmission = {
  projectType: string | null; // slug del servicio 'project' o 'unsure'
  brandStatus: string | null;
  addons: string[]; // slugs de servicios 'addon'
  objective: string | null;
  timing: string | null;
  contact: {
    name: string;
    company: string;
    email: string;
    phone: string;
  };
};

/** Resumen calculado que devuelve el server tras crear el lead. */
export type QuoteResult = {
  leadId: string;
  projectLabel: string | null;
  lineItems: LineItem[];
  total: number;
  deposit: number;
  balance: number;
  depositPercent: number;
};
