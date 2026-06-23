/**
 * Cotizador v2 — configuración del flujo de 4 pasos.
 * Fuente de verdad de los tipos de proyecto, etapas y objetivos.
 * Los PRECIOS siguen viniendo de la DB (services + microservices); acá solo
 * mapeamos label/icono/familia y qué pasos condicionales aplican.
 */

export type IconKey =
  | "web"
  | "landing"
  | "cart"
  | "saas"
  | "crm"
  | "brand"
  | "social"
  | "automation";

export type ProjectTypeDef = {
  /** slug del service en la DB (de ahí sale el precio). */
  slug: string;
  label: string;
  tagline: string;
  icon: IconKey;
  /** Para mostrar el modal opcional de infraestructura (dominio/hosting/etc.). */
  needsInfra: boolean;
};

/** Los 8 tipos visibles, en orden. */
export const PROJECT_TYPES: ProjectTypeDef[] = [
  { slug: "sitio", label: "Web corporativa", tagline: "Sitio institucional profesional.", icon: "web", needsInfra: true },
  { slug: "landing", label: "Landing page", tagline: "Página única de alta conversión.", icon: "landing", needsInfra: true },
  { slug: "ecommerce", label: "Ecommerce", tagline: "Tienda online lista para vender.", icon: "cart", needsInfra: true },
  { slug: "plataforma", label: "Plataforma / SaaS", tagline: "Aplicación web a medida.", icon: "saas", needsInfra: true },
  { slug: "crm", label: "CRM / Sistema interno", tagline: "Gestión interna y pipeline.", icon: "crm", needsInfra: true },
  { slug: "branding", label: "Branding / Identidad", tagline: "Marca, logo y sistema visual.", icon: "brand", needsInfra: false },
  { slug: "redes", label: "Redes sociales", tagline: "Contenido y presencia social.", icon: "social", needsInfra: false },
  { slug: "automatizaciones", label: "Automatización / Integraciones", tagline: "Flujos automáticos entre tus apps.", icon: "automation", needsInfra: true },
];

export function projectTypeBySlug(slug: string): ProjectTypeDef | undefined {
  return PROJECT_TYPES.find((p) => p.slug === slug);
}

export type Choice = { value: string; label: string };

export const STAGES: Choice[] = [
  { value: "idea", label: "Idea" },
  { value: "validando", label: "Validando" },
  { value: "vendiendo", label: "Vendiendo" },
  { value: "escalando", label: "Escalando" },
];

export const OBJECTIVES_V2: Choice[] = [
  { value: "vender", label: "Vender más" },
  { value: "automatizar", label: "Automatizar procesos" },
  { value: "lanzar", label: "Lanzar rápido" },
  { value: "profesionalizar", label: "Profesionalizar marca" },
  { value: "escalar", label: "Escalar" },
];

export function labelOf(list: Choice[], value: string | null): string | null {
  if (!value) return null;
  return list.find((c) => c.value === value)?.label ?? value;
}

/**
 * Garantía (condicionada, tono positivo). GUARANTEE_TIMING aclara cuándo
 * arranca el plazo; GUARANTEE_V2 es la promesa de reembolso.
 */
export const GUARANTEE_TIMING =
  "El plazo de 72 horas comienza una vez confirmado el anticipo y recibida toda la información, materiales y accesos necesarios por parte del cliente.";

export const GUARANTEE_V2 =
  "Si luego de revisar tu proyecto determinamos que no puede ejecutarse dentro del alcance de RUN72, te avisamos antes de comenzar y te devolvemos el 100% del anticipo abonado.";

/** Estructura del intake mínimo (todo opcional salvo lo del Paso 2). */
export type IntakeV2 = {
  businessWhat: string;
  stage: string | null;
  idealClient: string;
  differentiation: string;
  market: string;
  infra: { domain: boolean; hosting: boolean; instagram: boolean; branding: boolean };
};

export const EMPTY_INTAKE_V2: IntakeV2 = {
  businessWhat: "",
  stage: null,
  idealClient: "",
  differentiation: "",
  market: "",
  infra: { domain: false, hosting: false, instagram: false, branding: false },
};

/** Genera el resumen automático del proyecto para el Paso 4. */
export function buildSummary(input: {
  typeLabels: string[];
  businessWhat: string;
  stage: string | null;
  objective: string | null;
  functionalityNames: string[];
}): { resumen: string; construir: string[] } {
  const { typeLabels, businessWhat, stage, objective, functionalityNames } = input;
  const tipos = typeLabels.length > 0 ? typeLabels.join(" + ") : "Tu proyecto";

  const partes = [
    businessWhat ? `${tipos} para ${businessWhat.trim()}.` : `${tipos}.`,
    stage ? `Etapa del negocio: ${labelOf(STAGES, stage)}.` : "",
    objective ? `Objetivo: ${labelOf(OBJECTIVES_V2, objective)}.` : "",
  ].filter(Boolean);

  const construir = [...typeLabels, ...functionalityNames];

  return { resumen: partes.join(" "), construir };
}
