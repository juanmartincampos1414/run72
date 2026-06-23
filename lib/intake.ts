/**
 * Recolección inteligente del cotizador (Fase A).
 * Toda la data opcional que acelera la construcción del proyecto.
 */

export type TriState = "si" | "no" | "unsure" | null;

export type IntakeData = {
  infra: {
    domain: TriState;
    domainName: string;
    domainProvider: string;
    domainAccess: boolean;
    hosting: TriState;
    hostingProvider: string;
    hostingType: string;
    hostingAccess: boolean;
    email: "si" | "no" | null;
    emailProvider: string;
    emailAccounts: string;
  };
  social: Record<string, { active: boolean; user: string; url: string; access: boolean }>;
  material: string[];
  functionalities: string[];
  customFunctionalities: string[];
  references: Array<{ url: string; likes: string[] }>;
  dislikeUrls: string;
  avoid: string;
  access: string[];
  comments: string;
};

export const EMPTY_INTAKE: IntakeData = {
  infra: {
    domain: null,
    domainName: "",
    domainProvider: "",
    domainAccess: false,
    hosting: null,
    hostingProvider: "",
    hostingType: "",
    hostingAccess: false,
    email: null,
    emailProvider: "",
    emailAccounts: "",
  },
  social: {},
  material: [],
  functionalities: [],
  customFunctionalities: [],
  references: [],
  dislikeUrls: "",
  avoid: "",
  access: [],
  comments: "",
};

export const SOCIAL_NETWORKS = [
  "Instagram",
  "Facebook",
  "LinkedIn",
  "TikTok",
  "YouTube",
  "Google Business Profile",
];

export const MATERIAL_ITEMS = [
  "Logo",
  "Manual de marca",
  "Paleta de colores",
  "Tipografías",
  "Fotografías profesionales",
  "Videos",
  "Catálogo PDF",
  "Textos comerciales",
  "Base de datos de clientes",
  "Casos de éxito",
  "Testimonios",
  "Presentaciones comerciales",
];

export const ACCESS_ITEMS = [
  "Dominio",
  "Hosting",
  "Correo corporativo",
  "Google Analytics",
  "Google Search Console",
  "Meta Business Manager",
  "Instagram",
  "Facebook",
  "LinkedIn",
  "Google Business Profile",
];

export const REFERENCE_LIKES = [
  "Diseño",
  "Colores",
  "Experiencia",
  "Velocidad",
  "Funcionalidades",
  "Organización del contenido",
];

/** Funcionalidades sugeridas por tipo de proyecto (slug). */
export const FUNCTIONALITIES_BY_PROJECT: Record<string, string[]> = {
  landing: ["Formulario", "WhatsApp", "Newsletter", "Reservas / Turnos", "Integraciones", "Analítica"],
  sitio: ["Formulario", "WhatsApp", "Blog", "Multi idioma", "Turnos", "Reservas", "Ecommerce", "Integraciones", "Área privada", "CRM"],
  ecommerce: ["Carrito", "Medios de pago", "Cálculo de envíos", "Cupones", "Multi moneda", "Gestión de stock", "Lista de deseos", "Reseñas"],
  plataforma: ["Autenticación", "Roles y permisos", "Dashboard", "Suscripciones", "Integración API", "Notificaciones", "Panel admin", "Reportes"],
  branding: ["Logo", "Manual de marca", "Aplicaciones", "Papelería"],
  "estrategia-comercial": ["Propuesta de valor", "Posicionamiento", "Buyer persona", "Plan comercial"],
};

export function functionalitiesFor(projectSlugs: string[]): string[] {
  const set = new Set<string>();
  for (const slug of projectSlugs) {
    (FUNCTIONALITIES_BY_PROJECT[slug] ?? []).forEach((f) => set.add(f));
  }
  return [...set];
}

/* ---------------- Nivel de Preparación ---------------- */

export type PrepLevel = "red" | "yellow" | "green";

export function computePreparation(intake: IntakeData): {
  level: PrepLevel;
  score: number;
  filled: number;
  total: number;
} {
  const checks = [
    intake.infra.domain !== null,
    intake.infra.hosting !== null,
    intake.infra.email !== null,
    Object.values(intake.social).some((s) => s.active),
    intake.material.length > 0,
    intake.functionalities.length > 0 || intake.customFunctionalities.length > 0,
    intake.references.some((r) => r.url.trim()),
    intake.access.length > 0,
    intake.comments.trim().length > 0,
  ];
  const filled = checks.filter(Boolean).length;
  const total = checks.length;
  const score = Math.round((filled / total) * 100);
  const level: PrepLevel = score >= 70 ? "green" : score >= 35 ? "yellow" : "red";
  return { level, score, filled, total };
}

export const PREP_LABEL: Record<PrepLevel, { dot: string; label: string; text: string }> = {
  red: { dot: "🔴", label: "Faltan elementos importantes", text: "text-red-400" },
  yellow: { dot: "🟡", label: "Información parcial", text: "text-amber-300" },
  green: { dot: "🟢", label: "Listo para comenzar", text: "text-emerald-400" },
};
