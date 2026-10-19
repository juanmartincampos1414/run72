// Trabajos (sección 10). Modelo, datos y validación compartidos entre la
// navegación, el índice, la ficha, generateStaticParams y el sitemap.
// Server-safe: solo datos.

export type WorkKind = "producto" | "demo" | "client";
export type WorkCategory = "software" | "ia" | "automatizacion";

export const DEMO_LABEL = "Demo conceptual · Datos ficticios";

/** Marcador literal para todo dato sin verificar. Nunca se reemplaza por un valor inventado. */
export const PENDING = "[Pendiente de validar]";

export function isPending(value: string | null | undefined): boolean {
  return typeof value === "string" && value.includes(PENDING);
}

export const CATEGORY_LABELS: Record<WorkCategory, string> = {
  software: "Software",
  ia: "IA",
  automatizacion: "Automatización",
};

export type WorkLink = { label: string; href: string };

export type WorkMedia = {
  /** Color de acento de la portada (CSS), tomado de la paleta RUN. */
  poster: string;
  /** Solo casos client: medios reales aprobados. Las demos usan portada generada. */
  images?: string[];
};

export type Work = {
  slug: string;
  title: string;
  subtitle: string;
  kind: WorkKind;
  categories: WorkCategory[];
  /** Año real de creación; null cuando no está validado (nunca una fecha inventada). */
  year: number | null;
  summary: string;
  problem: string;
  solution: string;
  scope: string;
  /** Demo funcional en Labs (solo demos). */
  demoHref?: string;
  labDataHref?: string;
  ctaDemoLabel?: string;
  ctaContacto: WorkLink;
  media: WorkMedia;
  published: boolean;
  /** Solo kind=client: requisitos de publicación (sección 10). */
  evidence?: string[];
  publicationPermission?: boolean;
  teamRole?: string;
  /** Ficha de producto (kind=producto). Todo dato sin verificar es PENDING. */
  context?: string;
  userType?: string;
  built?: string;
  features?: string[];
  flow?: string;
  stack?: WorkStack;
  decisions?: string;
  status?: string;
};

export type WorkStack = {
  architecture: string;
  technologies: string;
  integrations: string;
};

function pendingProduct(
  base: Pick<Work, "slug" | "title" | "subtitle" | "categories"> & { poster: string },
): Work {
  return {
    slug: base.slug,
    title: base.title,
    subtitle: base.subtitle,
    kind: "producto",
    categories: base.categories,
    year: null,
    summary: `${base.title} es un producto real del portafolio de RUN. La ficha completa está en validación.`,
    problem: PENDING,
    solution: PENDING,
    scope: PENDING,
    ctaContacto: {
      label: "Hablar de un proyecto como este",
      href: `/contacto?interes=${base.categories.includes("ia") ? "agentes" : "software"}`,
    },
    media: { poster: base.poster },
    published: true,
    context: PENDING,
    userType: PENDING,
    built: PENDING,
    features: [PENDING],
    flow: PENDING,
    stack: { architecture: PENDING, technologies: PENDING, integrations: PENDING },
    decisions: PENDING,
    status: PENDING,
    evidence: [PENDING],
  };
}

export const WORKS: Work[] = [
  // ---- Productos reales (fichas en validación: no se inventan datos) ----
  pendingProduct({
    slug: "aikestar",
    title: "Aikestar",
    subtitle: "Producto de software del portafolio de RUN.",
    categories: ["software", "ia"],
    poster: "#18ACFF",
  }),
  pendingProduct({
    slug: "margin",
    title: "Margin",
    subtitle: "Producto del portafolio de RUN.",
    categories: ["software"],
    poster: "#8960FF",
  }),
  pendingProduct({
    slug: "tips",
    title: "Tips",
    subtitle: "Producto del portafolio de RUN.",
    categories: ["software"],
    poster: "#FFD873",
  }),
  pendingProduct({
    slug: "j",
    title: "J",
    subtitle: "Producto de la marca propia de RUN.",
    categories: ["ia"],
    poster: "#5583FF",
  }),

  // ---- Labs: demos conceptuales con datos ficticios ----
  {
    slug: "sistema-operativo-demo",
    title: "Sistema operativo",
    subtitle: "Un recorrido de pedidos y estados en una sola vista.",
    kind: "demo",
    categories: ["software"],
    year: 2026,
    summary:
      "Pedidos, responsables y estados reunidos en una sola vista, con filtros y una acción de cambio de estado.",
    problem:
      "Cuando cada pedido vive en una planilla distinta, seguir el trabajo exige reconstruir información.",
    solution:
      "Este ejemplo reúne pedidos, responsables y estados, con filtros y una acción de cambio de estado.",
    scope:
      "Demo local, sin backend empresarial. Las solicitudes, áreas y responsables son entidades ficticias; no representan clientes ni personas reales.",
    demoHref: "/labs/operacion",
    labDataHref: "/labs/operacion",
    ctaDemoLabel: "Probar el sistema",
    ctaContacto: {
      label: "Evaluar un sistema para mi empresa",
      href: "/contacto?interes=software",
    },
    media: { poster: "#18ACFF" },
    published: true,
  },
  {
    slug: "agente-operativo-demo",
    title: "Agente operativo",
    subtitle: "Consultar, preparar una acción y pedir aprobación.",
    kind: "demo",
    categories: ["ia"],
    year: 2026,
    summary:
      "Un recorrido que distingue la consulta informativa, la solicitud preparada y la aprobación humana.",
    problem:
      "Una conversación no explica por sí sola qué puede ejecutar un agente.",
    solution:
      "Este ejemplo diferencia consulta informativa, solicitud preparada y aprobación humana.",
    scope:
      "Simulación determinista, no un agente conectado. Los registros son ficticios, no se envía ningún mensaje ni se modifica un pedido real, y las respuestas no se atribuyen a un modelo externo.",
    demoHref: "/labs/agente",
    labDataHref: "/labs/agente",
    ctaDemoLabel: "Probar el agente",
    ctaContacto: {
      label: "Evaluar un agente para mi operación",
      href: "/contacto?interes=agentes",
    },
    media: { poster: "#8960FF" },
    published: true,
  },
  {
    slug: "integracion-operativa-demo",
    title: "Integración operativa",
    subtitle: "De un evento a un registro, con control de fallos.",
    kind: "demo",
    categories: ["automatizacion"],
    year: 2026,
    summary:
      "Un flujo de cuatro pasos que muestra el recorrido de un evento, un fallo, un reintento y la protección frente a eventos repetidos.",
    problem:
      "Copiar información entre herramientas genera duplicados y excepciones sin seguimiento.",
    solution:
      "Este ejemplo muestra el recorrido, un fallo, un reintento y la protección frente a eventos repetidos.",
    scope:
      "Demo local con un evento y un pedido ficticios. No usa logos de terceros ni promete conectores concretos; reiniciar borra solo el estado local de la demo.",
    demoHref: "/labs/integraciones",
    labDataHref: "/labs/integraciones",
    ctaDemoLabel: "Probar la integración",
    ctaContacto: {
      label: "Revisar mis integraciones",
      href: "/contacto?interes=automatizacion",
    },
    media: { poster: "#FFD873" },
    published: true,
  },
];

/**
 * Regla de publicación (sección 10): una demo o un producto propio es
 * publicable si está marcado published (los productos muestran sus campos
 * pendientes de forma visible); un caso client exige medios reales, rol
 * acreditado, permiso de publicación y evidencia.
 */
export function isPublishable(work: Work): boolean {
  if (!work.published) return false;
  if (work.kind === "demo" || work.kind === "producto") return true;
  return Boolean(
    work.media.images?.length &&
      work.teamRole &&
      work.publicationPermission === true &&
      work.evidence?.length,
  );
}

export function getPublishedWorks(): Work[] {
  return WORKS.filter(isPublishable);
}

export function getProducts(): Work[] {
  return getPublishedWorks().filter((w) => w.kind === "producto");
}

export function getDemos(): Work[] {
  return getPublishedWorks().filter((w) => w.kind === "demo");
}

/** Etiquetas de los campos de ficha de producto que siguen pendientes. */
export function getPendingFields(work: Work): string[] {
  if (work.kind !== "producto") return [];
  const checks: [string, boolean][] = [
    ["Contexto", isPending(work.context)],
    ["Tipo de usuario", isPending(work.userType)],
    ["Qué construyó RUN", isPending(work.built)],
    ["Funcionalidades", !work.features?.length || work.features.some(isPending)],
    ["Flujo", isPending(work.flow)],
    ["Arquitectura", isPending(work.stack?.architecture)],
    ["Tecnologías", isPending(work.stack?.technologies)],
    ["Integraciones", isPending(work.stack?.integrations)],
    ["Decisiones", isPending(work.decisions)],
    ["Estado", isPending(work.status)],
    ["Evidencia", !work.evidence?.length || work.evidence.some(isPending)],
    ["Año", work.year === null],
  ];
  return checks.filter(([, pending]) => pending).map(([label]) => label);
}

export function hasPendingFields(work: Work): boolean {
  return getPendingFields(work).length > 0;
}

export function getWork(slug: string): Work | undefined {
  return getPublishedWorks().find((w) => w.slug === slug);
}

export function getWorkSlugs(): string[] {
  return getPublishedWorks().map((w) => w.slug);
}

export function isWorkCategory(value: string | null | undefined): value is WorkCategory {
  return value === "software" || value === "ia" || value === "automatizacion";
}

/** Posición circular entre trabajos publicados (contador 01/03 → 03/03). */
export function getWorkSequence(slug: string): { index: number; total: number; next: Work } | undefined {
  const list = getPublishedWorks();
  const i = list.findIndex((w) => w.slug === slug);
  if (i === -1) return undefined;
  return { index: i + 1, total: list.length, next: list[(i + 1) % list.length] };
}

export function formatCounter(n: number, total: number): string {
  const pad = (v: number) => String(v).padStart(2, "0");
  return `${pad(n)}/${pad(total)}`;
}

export function workPath(work: Pick<Work, "slug">): string {
  return `/trabajos/${work.slug}`;
}
