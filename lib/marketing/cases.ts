// Trabajos (sección 10). Modelo, datos y validación compartidos entre la
// navegación, el índice, la ficha, generateStaticParams y el sitemap.
// Server-safe: solo datos.

export type WorkKind = "producto" | "demo" | "client";
export type WorkCategory = "software" | "ia" | "automatizacion";
/** Sección de un producto real: principal (operativo) o MVP desarrollado. */
export type WorkSection = "principal" | "mvp";

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
  /** Productos: capturas reales y seguras de la aplicación. Si no hay, la ficha muestra el bloque "Evidencia del producto". */
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
  /** Solo productos: "principal" (operativo) o "mvp" (desarrollado, no operativo). */
  section?: WorkSection;
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
  section: WorkSection;
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
  ctaContacto?: WorkLink;
};

/** Ficha de producto real: solo datos verificados en el repositorio. */
function product(p: ProductInput): Work {
  return {
    slug: p.slug,
    title: p.title,
    subtitle: p.subtitle,
    kind: "producto",
    section: p.section,
    categories: p.categories,
    year: p.year,
    summary: p.summary,
    problem: p.context,
    solution: p.built,
    scope: p.status,
    ctaContacto: p.ctaContacto ?? {
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

/** Estado de los MVP desarrollados que hoy no tienen un entorno operativo. */
const MVP_STATUS = "MVP desarrollado · Actualmente no operativo";

/**
 * Orden definitivo de Trabajos (el orden del array ES el orden público):
 *   Productos principales: 1 Aikestar, 2 Jota, 3 Relevo.
 *   MVPs desarrollados:    4 Margin, 5 Tips (numeración continua 01-05).
 *   Labs: demos conceptuales, aparte.
 */
export const WORKS: Work[] = [
  // ---- Productos principales (operativos) ----
  product({
    slug: "aikestar",
    section: "principal",
    title: "Aikestar",
    subtitle: "ERP SaaS para finanzas personales, de pareja y de pequeñas empresas.",
    categories: ["software", "ia"],
    year: 2026,
    poster: "#18ACFF",
    statusLabel: "Operativo",
    summary:
      "Plataforma de gestión financiera y administrativa impulsada por inteligencia artificial. Aikestar centraliza la información de personas, emprendedores y pequeñas empresas, automatiza la carga y conciliación de movimientos y convierte los datos operativos en información útil para decidir.",
    context:
      "Muchas pymes no entienden sus números: mezclan las finanzas personales con las del negocio, no saben cuánto ganan y una planilla de Excel ya no alcanza. Aikestar reúne gestión, finanzas y un asistente de IA en un solo lugar, y suma la Liga para fidelizar a quien usa la herramienta de forma sostenida.",
    userType:
      "Pymes y emprendedores del mercado argentino, con roles de operador, especialista y owner o admin, y soporte multi-organización.",
    built:
      "Desarrollo de punta a punta de dos aplicaciones. La Liga se construyó desde cero: motor de cálculo, panel de administración, sitio público, API de ingesta, webhooks firmados y cron diario. En el producto principal: migración de la IA de OpenAI a Claude, pagos con Mercado Pago (suscripciones), integración con Tiendanube, CRM, órdenes de trabajo y remitos, módulo de Inversiones con cotizaciones en vivo y la sección Liga embebida.",
    features: [
      "Dashboard financiero, cuentas, calendario, reportes e impuestos, con conciliación bancaria y multimoneda.",
      "Asistente de IA “Aike” y carga de movimientos por WhatsApp (texto, voz o imagen).",
      "Facturación electrónica ARCA a través de Facturitas.",
      "Rentabilidad por proyecto, gestión de empleados, roles y permisos, y multi-organización.",
      "CRM, órdenes de trabajo y remitos, con catálogo y pedidos de Tiendanube.",
      "Módulo de Inversiones con cotizaciones en vivo, resultado por posición y exportación a PDF o CSV.",
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
      "Operativo, con presencia pública: landing en aikestar.com, acceso en aikestar.net y la Liga en liga.aikestar.com. En desarrollo activo, con commits recientes hasta octubre de 2026.",
    evidence: [
      "La Liga Aikestar cuenta con una superficie pública y navegable para competencias, ganadores y consulta de puntos (liga.aikestar.com).",
      "Sitio público en aikestar.com y acceso en aikestar.net.",
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
    slug: "jota",
    section: "principal",
    title: "Jota",
    subtitle: "Sistema operativo de marketing con IA: tu Director de Crecimiento.",
    categories: ["ia", "automatizacion"],
    year: 2026,
    poster: "#5583FF",
    statusLabel: "Operativo",
    summary:
      "Sistema operativo de marketing impulsado por inteligencia artificial. Jota aprende la identidad de una marca, organiza su estrategia, produce contenidos y coordina campañas y canales desde un solo lugar, manteniendo la aprobación humana antes de ejecutar.",
    context:
      "Las marcas necesitan planear, producir, aprobar, publicar y medir marketing de forma coordinada, pero hoy ese trabajo queda disperso entre herramientas, equipos y canales.",
    userType:
      "Marcas, emprendedores, equipos y agencias, con gestión multimarca, roles y equipos.",
    built:
      "Desarrollo de punta a punta de la plataforma multimarca (Brand Twin): generación de contenido, imagen y video, calendario y aprobación, publicación en redes, campañas y publicidad, CRM y mensajería, webs, dominios y leads, analítica, SEO y reporting, y chat y voz con niveles de autonomía.",
    features: [
      "Identidad de marca y Brand Twin.",
      "Generación de imágenes, carruseles y video (avatares, UGC y voz).",
      "Calendario y aprobación de contenidos.",
      "Redes, campañas y publicidad.",
      "CRM, mensajería, webs y leads.",
      "Analítica, SEO y reporting, con roles y gestión multimarca.",
    ],
    flow:
      "1) Conecta canales (redes, publicidad, WhatsApp, web y analítica). 2) Aprende la identidad de la marca con su Brand Twin. 3) Propone y genera contenidos, anuncios y campañas. 4) Una persona revisa y aprueba antes de programar o publicar. El usuario dirige; Jota propone, organiza y ejecuta.",
    stack: {
      architecture:
        "Plataforma multimarca con roles y equipos, y aprobación humana antes de ejecutar acciones.",
      technologies:
        "Next.js 16 (App Router), TypeScript, Tailwind, Supabase (Postgres y Auth) y SDK de Anthropic; LiveKit para voz y tiempo real; exceljs y jspdf para exportación; motion.",
      integrations:
        "Supabase, Anthropic y LiveKit; además de los canales que se conectan (redes, publicidad, WhatsApp, web y analítica) según la configuración de cada marca. Las conexiones con cada canal dependen de esa configuración.",
    },
    decisions:
      "Aprobación humana antes de ejecutar (human-in-the-loop); gestión multimarca con roles; niveles de autonomía configurables.",
    status: "Operativo; con sitio público, planes, registro y acceso en jcaigency.com.",
    evidence: ["jcaigency.com"],
    teamRole: OWN_PRODUCT_ROLE,
    ctaContacto: { label: "Hablar de un proyecto así", href: "/contacto?interes=agentes" },
  }),

  product({
    slug: "relevo",
    section: "principal",
    title: "Relevo",
    subtitle: "Sistema operativo de inteligencia para originar e investigar oportunidades.",
    categories: ["software", "ia"],
    year: 2026,
    poster: "#5583FF",
    statusLabel: "OPERATIVO · EN USO",
    gallery: [
      {
        src: "/work/relevo/mision.jpg",
        alt: "Vista Misión de Relevo: resumen de la misión en una mirada (dónde estamos, qué buscamos, avances, qué bloquea, qué viene) sobre un espacio de trabajo demostrativo.",
        caption: "Vista Misión: el resumen de la misión en una mirada. Datos demostrativos.",
      },
      {
        src: "/work/relevo/agenda.jpg",
        alt: "Vista Hoy de Relevo con la agenda del día, filtros por estado y una barra para consultar la agenda, sobre datos demostrativos.",
        caption: "Vista Hoy: agenda del día con filtros y consulta. Datos demostrativos.",
      },
      {
        src: "/work/relevo/oportunidades.jpg",
        alt: "Vista Oportunidades de Relevo mostrando el estado del pipeline sobre un espacio de trabajo demostrativo.",
        caption: "Vista Oportunidades: estado del pipeline. Datos demostrativos.",
      },
    ],
    summary:
      "Sistema operativo de inteligencia para equipos de originación e investigación: reúne empresas, personas, oportunidades y fuentes en un modelo único, con trazabilidad completa y un resumen diario de qué requiere atención.",
    context:
      "Reunir y mantener al día la inteligencia de una misión de originación (empresas, personas, oportunidades y fuentes) sin perder trazabilidad ni depender de planillas dispersas.",
    userType:
      "Equipos de originación e investigación, con roles de owner, admin (con aprobación) y visor de solo lectura, y soporte multi-workspace.",
    built:
      "Desarrollo de punta a punta: arquitectura multi-workspace con registro de auditoría append-only, lectura e ingesta del CRM maestro, modelo canónico de relaciones e IA.",
    features: [
      "Lectura determinística y de solo lectura del CRM maestro.",
      "Sincronización incremental.",
      "Modelo canónico de relaciones: empresas, personas, activos, oportunidades, entrevistas, actividades y fuentes.",
      "Historial y trazabilidad con un registro de auditoría append-only.",
      "Seguimiento de pendientes, fechas, contradicciones y campos críticos.",
      "Morning Brief y vistas de trabajo: Hoy, Misión, Brain y Ficha.",
    ],
    flow:
      "Sincroniza el CRM maestro en solo lectura, arma el modelo canónico de relaciones, detecta pendientes, contradicciones y campos críticos, y entrega el Morning Brief y las vistas de trabajo.",
    stack: {
      architecture:
        "Arquitectura multi-workspace con capacidades por rol y un registro de auditoría append-only.",
      technologies:
        "Next.js 16 (App Router), TypeScript, Tailwind 4, shadcn/ui, Supabase (Postgres, Auth y RLS) y zod; SDK de Anthropic; leaflet (mapas) y exceljs.",
      integrations: "Supabase, Anthropic y lectura (solo lectura) del CRM maestro.",
    },
    decisions:
      "Lectura de solo lectura y determinística del CRM, que nunca escribe en la fuente. Sincronización incremental. Registro de auditoría append-only. Multi-workspace con capacidades por rol.",
    status: "Operativo en relevo.site; en uso real.",
    evidence: ["relevo.site"],
    teamRole: OWN_PRODUCT_ROLE,
    ctaContacto: { label: "Hablar de un proyecto así", href: "/contacto?interes=software" },
  }),

  // ---- MVPs desarrollados: construidos y documentados, hoy no operativos ----
  product({
    slug: "margin",
    section: "mvp",
    title: "Margin",
    subtitle: "Inteligencia económica para restaurantes y hospitality.",
    categories: ["software", "ia"],
    year: 2026,
    poster: "#8960FF",
    statusLabel: MVP_STATUS,
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
    status: MVP_STATUS,
    evidence: [
      "Repositorio privado, con un único autor.",
      "Auditoría interna del producto que documenta sus brechas: no está listo para clientes pagos. Sin despliegue público verificado.",
    ],
    teamRole: OWN_PRODUCT_ROLE,
    logo: "/work/margin/logo.png",
  }),
  product({
    slug: "tips",
    section: "mvp",
    title: "Tips",
    subtitle: "Reconocimiento al staff de hospitality con bandas NFC.",
    categories: ["software", "automatizacion"],
    year: 2026,
    poster: "#FFD873",
    statusLabel: MVP_STATUS,
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
    status: MVP_STATUS,
    evidence: [
      "Repositorio privado, con un único autor.",
      "Probado en un entorno de laboratorio propio; sin clientes pagos ni URL pública verificados.",
    ],
    teamRole: OWN_PRODUCT_ROLE,
    logo: "/work/tips/logo.png",
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

/** Productos principales (operativos), en orden: Aikestar, Jota, Relevo. */
export function getPrincipalProducts(): Work[] {
  return getProducts().filter((w) => w.section === "principal");
}

/** MVPs desarrollados, en orden: Margin, Tips. */
export function getMvpProducts(): Work[] {
  return getProducts().filter((w) => w.section === "mvp");
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

/**
 * Posición circular dentro del grupo del trabajo: los productos reales siguen
 * el orden Aikestar → Jota → Relevo → Margin → Tips; las demos de Labs, el suyo.
 */
export function getWorkSequence(
  slug: string,
): { index: number; total: number; next: Work; prev: Work } | undefined {
  const current = getPublishedWorks().find((w) => w.slug === slug);
  if (!current) return undefined;
  const list = current.kind === "demo" ? getDemos() : [...getPrincipalProducts(), ...getMvpProducts()];
  const i = list.findIndex((w) => w.slug === slug);
  if (i === -1) return undefined;
  return {
    index: i + 1,
    total: list.length,
    next: list[(i + 1) % list.length],
    prev: list[(i - 1 + list.length) % list.length],
  };
}

export function formatCounter(n: number, total: number): string {
  const pad = (v: number) => String(v).padStart(2, "0");
  return `${pad(n)}/${pad(total)}`;
}

export function workPath(work: Pick<Work, "slug">): string {
  return `/trabajos/${work.slug}`;
}
