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
  /** Productos: logo real del producto (/public). */
  logo?: string;
  /** Productos: capturas reales de la aplicación. Si no hay, la ficha dice que están en preparación. */
  gallery?: WorkShot[];
};

export type WorkShot = { src: string; alt: string; caption: string };

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
  /** Ficha de producto (kind=producto). Solo datos verificados; un dato desconocido se omite o es PENDING. */
  context?: string;
  userType?: string;
  built?: string;
  features?: string[];
  flow?: string;
  stack?: WorkStack;
  decisions?: string;
  status?: string;
  /** Etiqueta corta de madurez (p. ej. "MVP en desarrollo activo"). */
  statusLabel?: string;
};

export type WorkStack = {
  architecture: string;
  technologies: string;
  integrations: string;
};

type ProductInput = {
  slug: string;
  title: string;
  subtitle: string;
  categories: WorkCategory[];
  year: number;
  poster: string;
  summary: string;
  statusLabel: string;
  context: string;
  userType: string;
  built: string;
  features: string[];
  flow: string;
  stack: WorkStack;
  decisions: string;
  status: string;
  evidence: string[];
  teamRole: string;
  logo?: string;
  gallery?: WorkShot[];
};

/** Ficha de producto real: solo datos verificados en el repositorio. */
function product(p: ProductInput): Work {
  return {
    slug: p.slug,
    title: p.title,
    subtitle: p.subtitle,
    kind: "producto",
    categories: p.categories,
    year: p.year,
    summary: p.summary,
    problem: p.context,
    solution: p.built,
    scope: p.status,
    ctaContacto: {
      label: "Hablar de un proyecto como este",
      href: `/contacto?interes=${p.categories.includes("ia") ? "agentes" : "software"}`,
    },
    media: { poster: p.poster, logo: p.logo, gallery: p.gallery },
    published: true,
    context: p.context,
    userType: p.userType,
    built: p.built,
    features: p.features,
    flow: p.flow,
    stack: p.stack,
    decisions: p.decisions,
    status: p.status,
    statusLabel: p.statusLabel,
    evidence: p.evidence,
    teamRole: p.teamRole,
  };
}

const OWN_PRODUCT_ROLE = "Producto propio · diseño y desarrollo";

export const WORKS: Work[] = [
  // ---- Productos propios de RUN: fichas con datos verificados en cada repositorio ----
  product({
    slug: "aikestar",
    title: "Aikestar",
    subtitle: "Gestión administrativa y financiera con IA para pymes y emprendedores.",
    categories: ["software", "ia"],
    year: 2026,
    poster: "#18ACFF",
    statusLabel: "En desarrollo activo",
    summary:
      "Sistema de gestión administrativa y financiera con IA para pymes y emprendedores argentinos, más una plataforma de competencias, la Liga Aikestar, que premia el uso sostenido y la reducción de gastos evitables.",
    context:
      "Muchas pymes no entienden sus números: mezclan las finanzas personales con las del negocio, no saben cuánto ganan y una planilla de Excel ya no alcanza. Aikestar reúne gestión, finanzas y un asistente de IA en un solo lugar, y suma la Liga para fidelizar a quien usa la herramienta de forma sostenida.",
    userType:
      "Pymes y emprendedores del mercado argentino, con roles de operador, especialista y owner o admin, y soporte multi-organización.",
    built:
      "Desarrollo de punta a punta de dos aplicaciones. La Liga se construyó desde cero: motor de cálculo, panel de administración, sitio público, API de ingesta, webhooks firmados y cron diario. En el producto principal: migración de la IA de OpenAI a Claude, pagos con Mercado Pago (suscripciones), integración con Tiendanube, CRM, órdenes de trabajo y remitos, módulo de Inversiones con cotizaciones en vivo y la sección Liga embebida.",
    features: [
      "Transacciones, calendario, cuentas, reportes e impuestos en una sola aplicación.",
      "Asistente de IA “Aike” y bot de WhatsApp para registrar movimientos.",
      "Facturación electrónica ARCA a través de Facturitas.",
      "CRM, órdenes de trabajo y remitos, con catálogo y pedidos de Tiendanube.",
      "Módulo de Inversiones con cotizaciones en vivo, resultado por posición y reporte en PDF.",
      "Liga Aikestar: Desafío de 21 días en pareja y ranking trimestral con un libro de puntos auditable.",
    ],
    flow:
      "aikestar.net envía datos agregados a la Liga por API, con idempotencia. La Liga recalcula los rankings a diario (cron) y emite webhooks firmados con HMAC. La sección Liga se embebe dentro de la aplicación principal.",
    stack: {
      architecture:
        "Dos aplicaciones, el producto principal y la Liga, con el mismo stack y comunicadas por API y webhooks firmados.",
      technologies:
        "React 19, TypeScript, Vite, Tailwind 4, Express y PostgreSQL (Drizzle). IA con Claude (Anthropic); Gemini solo para transcribir los audios de WhatsApp.",
      integrations:
        "Mercado Pago (suscripciones), Tiendanube, WhatsApp (Twilio), SendGrid (email), ARCA vía Facturitas (facturación electrónica) y cotizaciones de Finnhub, CoinGecko y data912/BYMA.",
    },
    decisions:
      "Privacidad en la Liga: solo se reciben totales por día y categoría, y los rankings usan alias públicos. Seguridad: API keys con hash, magic links de un solo uso, bcrypt, rate limiting, CSRF y cifrado AES-GCM. La migración de OpenAI a Claude se hizo mediante un módulo traductor que aisló el cambio.",
    status:
      "En desarrollo activo, con commits recientes hasta octubre de 2026. Según su documentación, la Liga está publicada en liga.aikestar.com; ese dato no fue verificado en vivo para esta ficha.",
    evidence: [
      "Liga publicada en liga.aikestar.com según la documentación del proyecto (no verificado en vivo).",
      "Aplicación principal migrada a app.aikestar.com según la misma documentación.",
      "Capturas reales de la aplicación, con una organización de demostración.",
    ],
    teamRole: OWN_PRODUCT_ROLE,
    gallery: [
      {
        src: "/work/aikestar/dashboard.jpg",
        alt: "Dashboard de Aikestar con salud financiera, cuentas operativas y últimos movimientos.",
        caption: "Dashboard con salud financiera y cuentas operativas.",
      },
      {
        src: "/work/aikestar/inversiones.jpg",
        alt: "Módulo de Inversiones de Aikestar con carteras en pesos y dólares y listado de posiciones.",
        caption: "Módulo de Inversiones con carteras y posiciones.",
      },
      {
        src: "/work/aikestar/reportes.jpg",
        alt: "Sección de Reportes e Informes de Aikestar con evolución de caja y análisis por categoría.",
        caption: "Reportes e informes: evolución de caja y análisis por categoría.",
      },
      {
        src: "/work/aikestar/crm.jpg",
        alt: "CRM comercial de Aikestar con un pipeline de oportunidades por etapa y un campo para pedirle acciones a Aike.",
        caption: "CRM comercial con pipeline por etapas y pedidos al asistente Aike.",
      },
    ],
  }),
  product({
    slug: "margin",
    title: "Margin",
    subtitle: "Inteligencia económica para restaurantes y hospitality.",
    categories: ["software", "ia"],
    year: 2026,
    poster: "#8960FF",
    statusLabel: "MVP en desarrollo activo",
    summary:
      "Plataforma de inteligencia económica para hospitality: convierte facturas, menús, recetas y cierres operativos en una lectura de márgenes y costos. No es un ERP, un POS ni un sistema contable.",
    context:
      "Un restaurante suele no saber cuánto cuesta realmente cada plato, cuál es su margen, qué proveedores deterioran el costo ni qué turnos son rentables. Margin cruza lo que se compra con lo que se vende para responder esas preguntas.",
    userType: "Restaurantes y operadores gastronómicos, con aislamiento multi-tenant por restaurante.",
    built:
      "Aplicación Next.js completa, 21 migraciones SQL y documentación de producto y arquitectura, con un único autor.",
    features: [
      "Facturas con OCR por IA: extrae proveedor, ingredientes y precios, con revisión humana antes de confirmar.",
      "Recetas y costeo, con importación desde PDF o XLSX y conversión de unidades.",
      "Menu Intelligence sobre márgenes por plato.",
      "Supplier Intelligence: ranking, proveedores críticos, oportunidades y evolución de precios.",
      "Importación de operaciones por turno.",
      "Dashboard ejecutivo y Copilot de IA con recomendaciones.",
    ],
    flow:
      "Alta del restaurante, carga de facturas (el OCR genera proveedores, ingredientes e historial de precios), importación de menú y recetas, cruce de ítems, importación de operaciones, revisión de coincidencias y oportunidades, y lectura de márgenes, proveedores y dashboard. Principio: la IA sugiere y la persona valida.",
    stack: {
      architecture:
        "Aplicación Next.js sobre Supabase, con datos multi-tenant por restaurante y el restaurante resuelto desde la sesión.",
      technologies:
        "Next 16, React 19, TypeScript, Tailwind 4 y Recharts; Supabase (Postgres, Auth, Storage y RLS); xlsx y pdf-lib. IA de Anthropic: Claude Sonnet para OCR y parsing, Claude Haiku para recomendaciones.",
      integrations: "Supabase y Anthropic.",
    },
    decisions:
      "El historial de precios es append-only con borrado lógico. El restaurante se resuelve desde la sesión, nunca desde el cliente. Toda salida de OCR o IA pasa por revisión humana. Quedan fuera de alcance por decisión: inventario, órdenes de compra y contabilidad.",
    status:
      "MVP funcional en desarrollo activo, con brechas conocidas. Según su propia auditoría interna, todavía no está listo para clientes pagos. Sin despliegue público verificado.",
    evidence: [
      "Repositorio privado, con un único autor.",
      "Auditoría interna del producto que documenta sus brechas y que todavía no está listo para clientes pagos.",
    ],
    teamRole: OWN_PRODUCT_ROLE,
    logo: "/work/margin/logo.png",
  }),
  product({
    slug: "tips",
    title: "Tips",
    subtitle: "Reconocimiento al staff de hospitality con bandas NFC.",
    categories: ["software", "automatizacion"],
    year: 2026,
    poster: "#FFD873",
    statusLabel: "En piloto / MVP",
    summary:
      "Plataforma de reconocimiento para hospitality. Cada banda NFC pertenece a una persona del staff, no a una mesa, y convierte la buena atención en propinas, reseñas y clientes que vuelven.",
    context:
      "Un restaurante no captura ni mide el buen servicio, ni su retorno: reseñas, datos del cliente y visitas repetidas. Tips conecta cada interacción con la persona que atendió y con lo que genera después.",
    userType: "Cliente, camarero, restaurante (owner o manager) y el equipo de Tips.",
    built:
      "Aplicación Next.js y 23 migraciones SQL sobre Supabase: pagos, CRM Guest 360, campañas, aislamiento por tenant y documentación de producto extensa, con un único autor.",
    features: [
      "Tap NFC público: perfil del staff, calificación, propina y ruteo de reseña (4 o más estrellas a Google, 3 o menos a feedback privado).",
      "Rewards y Wallet: pase web móvil con QR dinámico.",
      "Panel para managers: dashboard, staff, inventario de bandas NFC e impacto.",
      "CRM Guest 360 con importación desde CSV o Excel.",
      "Campañas por email con atribución.",
      "Pagos de propinas con webhooks.",
    ],
    flow: "Tap, identificación, reconocimiento, ruteo de reseña, captura del guest, reward y wallet.",
    stack: {
      architecture:
        "Aplicación Next.js sobre Supabase, con RLS como defensa en profundidad y aislamiento por tenant verificado en el build.",
      technologies:
        "Next 16, React 19, TypeScript y Tailwind 4; Supabase (Postgres, Auth y Storage); libphonenumber-js, qrcode y xlsx.",
      integrations:
        "Supabase, Mercado Pago (adaptador real y sandbox), Resend (email y webhook) y enlace a Google Reviews. Los conectores con sistemas POS y PMS existen como catálogo de arquitectura sobre un adaptador de prueba, no como integraciones activas; Apple Wallet y Google Wallet nativos son placeholders.",
    },
    decisions:
      "La banda pertenece a una persona, no a una mesa. Los datos nunca se borran: se archivan por estado. Los pagos son agnósticos de pasarela y con idempotencia: el dinero solo se confirma por webhook. Las credenciales se guardan solo por referencia.",
    status:
      "MVP en piloto, probado en un entorno de laboratorio propio. Sin clientes pagos verificados y sin URL pública verificada.",
    evidence: [
      "Repositorio privado, con un único autor.",
      "Entorno de laboratorio propio para el piloto; sin clientes pagos verificados.",
    ],
    teamRole: OWN_PRODUCT_ROLE,
    logo: "/work/tips/logo.png",
  }),
  // J: sin información verificada todavía; la ficha queda oculta hasta tenerla.
  {
    ...product({
      slug: "j",
      title: "J",
      subtitle: "Producto de la marca propia de RUN.",
      categories: ["ia"],
      year: 2026,
      poster: "#5583FF",
      statusLabel: "Sin ficha",
      summary: "Ficha en preparación.",
      context: PENDING,
      userType: PENDING,
      built: PENDING,
      features: [PENDING],
      flow: PENDING,
      stack: { architecture: PENDING, technologies: PENDING, integrations: PENDING },
      decisions: PENDING,
      status: PENDING,
      evidence: [PENDING],
      teamRole: PENDING,
    }),
    year: null,
    published: false,
  },

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
