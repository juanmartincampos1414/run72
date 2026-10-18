// Contenido público de RUN (marketing). Copy final de secciones 3, 5 y 14.
// Server-safe: solo datos, sin dependencias de cliente.

export const SITE = {
  name: "RUN",
  legalName: "RUN",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.run72.app",
  email: "hola@run72.app",
  titleDefault: "RUN · Software a medida y agentes de IA",
  description:
    "Desarrollamos software a medida, agentes de inteligencia artificial e integraciones para mejorar la operación de tu empresa. Contanos qué necesitás resolver.",
  locale: "es_AR",
} as const;

export type NavLink = { label: string; href: string };

// Header: misma secuencia y jerarquía que Nubi (3.1).
export const NAV_LINKS: NavLink[] = [
  { label: "Servicios", href: "/servicios" },
  { label: "Trabajos", href: "/trabajos" },
  { label: "Blog", href: "/blog" },
  { label: "Labs", href: "/labs" },
];
export const NAV_CTA: NavLink = { label: "Contacto", href: "/contacto" };

// ---------- Inicio (sección 5) ----------
export const HOME = {
  hero: {
    eyebrow: "SOFTWARE A MEDIDA · AGENTES DE IA · AUTOMATIZACIÓN",
    // Las líneas definen la composición en escritorio.
    titleLines: ["Software a medida.", "Agentes de IA.", "Tu operación, conectada."],
    // Palabra con gradiente animado (última línea).
    gradientWord: "conectada.",
    subtitle:
      "Construimos sistemas, agentes y automatizaciones para que tu empresa trabaje con menos tareas manuales y mejor información.",
    cta: { label: "Conocé lo que hacemos", href: "#servicios" },
  },
  principle: {
    lead: "Primero entendemos tu operación. Después construimos lo que falta.",
    secondary: "La tecnología empieza por el trabajo que necesitás resolver.",
    accent: "No por una solución prefabricada.",
    steps: [
      { n: "01", title: "Entender", text: "Mapeamos el proceso, las herramientas y el resultado que buscás." },
      { n: "02", title: "Diseñar", text: "Definimos una solución y un alcance que podamos validar." },
      { n: "03", title: "Construir", text: "Desarrollamos, probamos y dejamos una base para continuar." },
    ],
  },
  capabilities: {
    eyebrow: "QUÉ CONSTRUIMOS",
    title: "Tres capacidades. Una operación conectada.",
    items: [
      {
        id: "software",
        title: "Software a medida",
        text: "Plataformas, portales y sistemas internos construidos alrededor de tu forma de trabajar.",
        href: "/servicios/software-a-medida",
      },
      {
        id: "agentes",
        title: "Agentes de IA",
        text: "Asistentes que consultan información, usan herramientas y ejecutan tareas con límites definidos.",
        href: "/servicios/agentes-ia",
      },
      {
        id: "automatizacion",
        title: "Integraciones y automatización",
        text: "Datos y procesos conectados, con validaciones, alertas y trazabilidad.",
        href: "/servicios/automatizacion",
      },
    ],
  },
  process: {
    eyebrow: "CÓMO TRABAJAMOS",
    title: "De entender el problema a poner la solución en uso.",
    steps: [
      { n: "01", title: "Entender", text: "Revisamos el proceso actual, las herramientas y el resultado que necesitás conseguir.", deliverable: "Problema y objetivo." },
      { n: "02", title: "Delimitar", text: "Definimos alcance, integraciones y criterios de aceptación.", deliverable: "Plan y estimación por alcance." },
      { n: "03", title: "Construir y validar", text: "Desarrollamos por etapas y probamos recorridos representativos.", deliverable: "Versión validada." },
      { n: "04", title: "Operar y evolucionar", text: "Documentamos la entrega y acordamos soporte y continuidad.", deliverable: "Documentación y plan de mantenimiento según contrato." },
    ],
    secondaryLink: { label: "Cómo trabajamos en detalle", href: "/como-trabajamos" },
  },
  works: {
    eyebrow: "TRABAJOS SELECCIONADOS",
    rows: [
      { title: "Sistema operativo", slug: "sistema-operativo-demo", labData: "/labs/operacion" },
      { title: "Agente operativo", slug: "agente-operativo-demo", labData: "/labs/agente" },
      { title: "Integración operativa", slug: "integracion-operativa-demo", labData: "/labs/integraciones" },
    ],
    allLink: { label: "Ver todos los trabajos", href: "/trabajos" },
    demosLink: { label: "Probar las demos", href: "/labs" },
    demoBadge: "DEMO CONCEPTUAL",
  },
  closing: {
    muted: "No necesitás tener la solución.",
    strong: "Contanos qué querés resolver.",
    cta: { label: "Hablemos de tu proyecto", href: "/contacto" },
  },
} as const;

// ---------- Footer (3.2) ----------
export const FOOTER = {
  description:
    "Software a medida, agentes de inteligencia artificial e integraciones para la operación de tu empresa.",
  columns: [
    {
      title: "Explorar",
      links: [
        { label: "Servicios", href: "/servicios" },
        { label: "Trabajos", href: "/trabajos" },
        { label: "Blog", href: "/blog" },
        { label: "Labs", href: "/labs" },
        { label: "Cómo trabajamos", href: "/como-trabajamos" },
        { label: "Runit Scan", href: "/runit-scan" },
      ],
    },
    {
      title: "Conectar",
      links: [
        { label: "Contacto", href: "/contacto" },
        { label: "Cotizador · RUN Express", href: "/cotizar" },
        { label: "Área de clientes", href: "/hub" },
        { label: "Mapa de ejemplo", href: "/mapa/ejemplo" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacidad", href: "/privacidad" },
        { label: "Términos", href: "/terminos" },
        { label: "Ajustes de privacidad", href: "#consent", id: "consent-settings" },
      ],
    },
  ],
} as const;
