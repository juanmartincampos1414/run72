/**
 * RUN72 — Single source of truth for landing copy.
 * Centralised so sections stay presentational and copy is easy to iterate.
 */

export const SITE = {
  name: "RUN72",
  tagline: "Tu negocio listo en 72 horas.",
  email: "hola@run72.app",
  linkedin: "https://www.linkedin.com/company/run72",
} as const;

/**
 * Punto único de conversión.
 *
 * Toda la landing empuja hacia el cotizador. Cuando el cotizador web
 * multi-paso esté listo, sólo hay que cambiar `QUOTE.href` a su ruta
 * (p. ej. "/cotizar") y poner `QUOTE.isExternalForm = false`.
 * Mientras tanto, el CTA abre un email pre-armado como fallback funcional.
 */
export const QUOTE = {
  /** Cotizador web multi-paso. */
  href: "/cotizar",
  /** true = fallback email · false = ruta interna del cotizador. */
  isFallbackEmail: false,
  label: "Cotizar mi proyecto",
  labelShort: "Cotizar",
} as const;

export const NAV_LINKS = [
  { label: "Servicios", href: "#servicios" },
  { label: "Cómo funciona", href: "#proceso" },
  { label: "Ideal para", href: "#ideal" },
  { label: "Experiencia", href: "#experiencia" },
  { label: "Proyectos", href: "#proyectos" },
  { label: "FAQ", href: "#faq" },
] as const;

export type ServiceCard = {
  id: string;
  title: string;
  icon: "code" | "spark" | "target" | "rocket";
  items: string[];
};

export const SERVICES: ServiceCard[] = [
  {
    id: "desarrollo",
    title: "Desarrollo",
    icon: "code",
    items: ["Landing Pages", "Sitios Web", "Ecommerce", "Plataformas Web"],
  },
  {
    id: "branding",
    title: "Branding",
    icon: "spark",
    items: ["Naming", "Logo", "Sistema Visual", "Manual de Marca"],
  },
  {
    id: "estrategia",
    title: "Estrategia",
    icon: "target",
    items: [
      "Propuesta de Valor",
      "Posicionamiento",
      "Mensaje Comercial",
      "Definición de Audiencia",
    ],
  },
  {
    id: "marketing",
    title: "Marketing Ready",
    icon: "rocket",
    items: [
      "Redes Sociales",
      "Creatividades Iniciales",
      "Base para Campañas",
      "Preparación Comercial",
    ],
  },
];

export type Step = {
  day: string;
  title: string;
  description: string;
};

export const STEPS: Step[] = [
  {
    day: "Día 1",
    title: "Descubrimiento y estrategia",
    description:
      "Definimos propuesta de valor, audiencia y mensaje. Salís del día 1 con un plan claro de ejecución.",
  },
  {
    day: "Día 2",
    title: "Diseño y desarrollo",
    description:
      "Construimos marca, interfaz y producto en paralelo. Todo el equipo ejecutando sobre un mismo objetivo.",
  },
  {
    day: "Día 3",
    title: "Ajustes finales y lanzamiento",
    description:
      "Pulido, optimización y entrega lista para operar. Tu negocio queda en línea y listo para vender.",
  },
];

export type IdealCard = {
  title: string;
  description: string;
  icon: "startup" | "founder" | "company" | "product" | "validate" | "digital";
};

export const IDEAL_FOR: IdealCard[] = [
  {
    title: "Startups",
    description: "Que necesitan estar en el mercado antes que la competencia.",
    icon: "startup",
  },
  {
    title: "Emprendedores",
    description: "Con una idea clara y urgencia por empezar a vender.",
    icon: "founder",
  },
  {
    title: "Empresas tradicionales",
    description: "Que quieren dar el salto digital sin frenar su operación.",
    icon: "company",
  },
  {
    title: "Nuevos productos",
    description: "Lanzamientos que requieren marca y plataforma desde cero.",
    icon: "product",
  },
  {
    title: "Validación de ideas",
    description: "Para testear demanda real con un producto funcional.",
    icon: "validate",
  },
  {
    title: "Negocios digitales",
    description: "Que viven y crecen 100% en el canal online.",
    icon: "digital",
  },
];

export type Metric = {
  value: string;
  label: string;
};

export const METRICS: Metric[] = [
  { value: "+10", label: "Años de experiencia acumulada del equipo" },
  { value: "+300", label: "Proyectos desarrollados por el equipo" },
  { value: "12", label: "Industrias atendidas" },
  { value: "72h", label: "Tiempo de entrega" },
];

export type Project = {
  name: string;
  category: string;
  description: string;
  /** Sitio del proyecto (se abre al hacer click en la card). */
  url: string;
  /** Color stops para el mockup (gradiente de marca por proyecto). */
  accent: [string, string];
};

export const PROJECTS: Project[] = [
  {
    name: "Aikestar",
    category: "SaaS Financiero",
    description:
      "Plataforma de gestión financiera para empresas y emprendedores.",
    url: "https://aikestar.net",
    accent: ["#22d3ee", "#6366f1"],
  },
  {
    name: "Aigency",
    category: "Agencia IA",
    description:
      "Marca y presencia digital enfocada en automatización e inteligencia artificial.",
    url: "https://jcmarketing.digital",
    accent: ["#8b5cf6", "#ec4899"],
  },
  {
    name: "Poxcom",
    category: "Tecnología",
    description:
      "Presencia digital y estructura comercial para crecimiento online.",
    url: "https://web.poxcom.com",
    accent: ["#38bdf8", "#22d3ee"],
  },
  {
    name: "Margin",
    category: "Consultoría Empresarial",
    description: "Branding, posicionamiento y ecosistema digital.",
    url: "https://margin.business",
    accent: ["#6366f1", "#a855f7"],
  },
  {
    name: "Galante D’Antonio 0KM",
    category: "Automotriz",
    description:
      "Experiencia digital para concesionaria y generación de oportunidades comerciales.",
    url: "https://galantedantonio0km.com",
    accent: ["#f59e0b", "#ef4444"],
  },
  {
    name: "Flips",
    category: "Negocios Digitales",
    description: "Marca y presencia online para lanzamiento comercial.",
    url: "https://flips.ar",
    accent: ["#10b981", "#38bdf8"],
  },
  {
    name: "The One House",
    category: "Real Estate",
    description:
      "Identidad digital y plataforma de presentación para el mercado inmobiliario.",
    url: "https://theonehouse.net",
    accent: ["#a855f7", "#6366f1"],
  },
  {
    name: "Tips",
    category: "Plataforma Digital",
    description: "Plataforma y presencia digital lista para operar.",
    url: "https://tips.li",
    accent: ["#f43f5e", "#a855f7"],
  },
];

/**
 * Lista ÚNICA y oficial de entregables. Se muestra igual en landing
 * (Ownership), cotizador (Paso 4) y checkout. No duplicar en otros lados.
 */
export const DELIVERABLES = [
  "Proyecto funcional listo para operar",
  "Código fuente completo",
  "Accesos y credenciales organizados",
  "Documento maestro con configuraciones",
  "Entrega preparada para continuidad con cualquier proveedor",
  "30 días de soporte post-entrega",
  "Una instancia de revisión",
  "Capacitación básica de uso (si corresponde)",
] as const;

export const OWNERSHIP_TITLE = "Tu proyecto es 100% tuyo";

export const OWNERSHIP_TEXT =
  "Al finalizar el desarrollo recibís un documento completo con todas las configuraciones, accesos y credenciales necesarias para administrar tu proyecto de forma totalmente independiente. No generamos dependencia: vas a tener acceso y control sobre cada herramienta utilizada durante el proyecto.";

export const TRUST_MESSAGE =
  "No creemos en generar dependencia tecnológica. Nuestro objetivo es que tengas control total sobre tu negocio desde el primer día. Por eso documentamos todo lo realizado y te entregamos cada acceso, configuración y credencial necesaria para que puedas administrar tu proyecto con total independencia.";

export const TRADITIONAL_FLOW = [
  "Idea",
  "Branding",
  "Diseño",
  "Desarrollo",
  "Marketing",
  "Lanzamiento",
] as const;

export const RUN72_FLOW = ["Idea", "RUN72", "Lanzamiento"] as const;
