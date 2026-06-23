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

export type Microservice = {
  id: string;
  service_slug: string;
  group_name: string;
  slug: string;
  name: string;
  description: string | null;
  price_ars: number;
  active: boolean;
  default_on: boolean;
  sort_order: number;
};

/** Clave compuesta para identificar un microservicio seleccionado. */
export type SelectedMicro = {
  service_slug: string;
  slug: string;
  name: string;
  price_ars: number;
};

export type LeadStatus =
  | "nuevo"
  | "pendiente_validacion"
  | "validado"
  | "rechazado_alcance"
  | "esperando_pago"
  | "comprobante_recibido"
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
  microservices_selected: SelectedMicro[];
  line_items: LineItem[];
  whatsapp: string | null;
  urgency_note: string | null;
  files: Array<{ name: string; url: string; type: string }>;
  subtotal_ars: number;
  iva_ars: number;
  total_ars: number;
  deposit_ars: number;
  balance_ars: number;
  deposit_percent: number;
  score: number;
  hot: boolean;
  status: LeadStatus;
  preview_text: string | null;
  preview_rating: number | null;
  preview_comments: string | null;
  preference_id: string | null;
  payment_id: string | null;
  payment_status: string | null;
  production_started_at: string | null;
  // Fase B
  comprobante_url: string | null;
  comprobante_name: string | null;
  comprobante_status: string | null;
  comprobante_uploaded_at: string | null;
  comprobante_observaciones: string | null;
  complexity_score: number;
  requires_manual_review: boolean;
  scope_accepted: boolean;
  rejection_reason: string | null;
  estimated_delivery_at: string | null;
  intake: Record<string, unknown> | null;
  preparation_level: string | null;
  delivery_doc: Record<string, unknown> | null;
};

export type PreviewMockup = { title: string; description: string; html: string };

export type ProjectPreview = {
  interpretation: string;
  detectedFunctionalities: string[];
  includedDeliverables: string[];
  mockups: PreviewMockup[];
  generatedAt?: string;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  active: boolean;
};

export type LeadFile = {
  name: string;
  /** URL para mostrar (firmada en bucket privado). Al persistir guardamos el path. */
  url: string;
  type: string;
  /** Path del objeto dentro del bucket (para re-firmar). */
  path?: string;
};

/** Payload que envía el configurador al crear un lead. */
export type QuoteSubmission = {
  projectTypes: string[]; // slugs de servicios 'project' (multi-select)
  brandStatus: string | null;
  addons: string[]; // slugs de servicios 'addon'
  /** claves "service_slug:micro_slug" de microservicios activados */
  microservices: string[];
  objective: string | null;
  timing: string | null;
  urgencyNote: string;
  files: LeadFile[];
  previewRating: number | null;
  previewComments: string;
  previewText: string | null;
  intake?: unknown;
  preparationLevel?: string;
  sessionId?: string;
  funnelStepReached?: number;
  contact: {
    name: string;
    company: string;
    email: string;
    whatsapp: string;
  };
};

/** Resumen calculado que devuelve el server tras crear el lead. */
export type QuoteResult = {
  leadId: string;
  projectLabel: string | null;
  lineItems: LineItem[];
  subtotal: number;
  iva: number;
  total: number;
  deposit: number;
  balance: number;
  depositPercent: number;
};
