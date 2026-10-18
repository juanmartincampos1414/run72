// Servicios de RUN: datos de las tres especialidades (sección 6 del plan).
// Server-safe: solo datos. Copy exacto; no inventar clientes, precios ni plazos.

import { HOME } from "./content";

export type MarketingSolutionId = "software" | "agentes" | "automatizacion";

export type SolutionSlug = "software-a-medida" | "agentes-ia" | "automatizacion";

export type SolutionCapability = { title: string; text: string };
export type SolutionFaq = { q: string; a: string };

export type MarketingSolution = {
  id: MarketingSolutionId;
  slug: SolutionSlug;
  /** Ruta pública de la ficha: /servicios/<slug>. */
  href: string;
  /** Título corto (nav, bandas del índice, breadcrumb). */
  navTitle: string;
  /** Descripción corta de las bandas (idéntica a Inicio). */
  description: string;
  h1: string;
  bajada: string;
  /** Bloque "problema". */
  problema: string;
  /** Exactamente cuatro, mostradas en grilla 2x2. */
  capacidades: readonly [SolutionCapability, SolutionCapability, SolutionCapability, SolutionCapability];
  /** Bloque "cómo se valida" / "límites" / "método" según la especialidad. */
  metodo: { title: string; text: string };
  demo: { href: string; label: string; badge: string };
  ctaContacto: { label: string; href: string };
  faqs: readonly SolutionFaq[];
  /** Tres ejemplos para la banda del índice (capacidades propuestas). */
  ejemplos: readonly [string, string, string];
  /** Metadatos de la ficha. */
  meta: { title: string; description: string };
};

export const DEMO_BADGE = "Ejemplo interactivo con datos ficticios";

const homeItem = (id: MarketingSolutionId) => {
  const item = HOME.capabilities.items.find((i) => i.id === id);
  if (!item) throw new Error(`Capacidad de Inicio no encontrada: ${id}`);
  return item;
};

export const SOLUTIONS: readonly MarketingSolution[] = [
  {
    id: "software",
    slug: "software-a-medida",
    href: "/servicios/software-a-medida",
    navTitle: homeItem("software").title,
    description: homeItem("software").text,
    h1: "Software que se adapta a cómo trabaja tu empresa.",
    bajada:
      "Diseñamos y desarrollamos plataformas, portales y sistemas internos cuando las herramientas disponibles dejan parte de la operación sin resolver.",
    problema:
      "Cuando una tarea depende de varias planillas, pantallas desconectadas o pasos manuales, un sistema propio puede ordenar el recorrido. Antes de construir, evaluamos qué conviene mantener y qué necesita una solución a medida.",
    capacidades: [
      {
        title: "Sistemas internos",
        text: "Procesos, estados y permisos para que cada persona trabaje con la información adecuada.",
      },
      {
        title: "Portales",
        text: "Un espacio para que clientes, proveedores o equipos consulten y gestionen su parte del proceso.",
      },
      {
        title: "Productos digitales",
        text: "Una primera versión con alcance claro para validar el uso y evolucionar.",
      },
      {
        title: "Datos y reportes",
        text: "Vistas consistentes sobre la operación, conectadas a las fuentes acordadas.",
      },
    ],
    metodo: {
      title: "Cómo se valida",
      text: "Definimos usuarios y recorridos, modelo de datos, integraciones y criterios de aceptación. La entrega se prueba con tareas representativas y se documentan las dependencias.",
    },
    demo: { href: "/labs/operacion", label: "Probar la demo de operación", badge: DEMO_BADGE },
    ctaContacto: { label: "Evaluar mi sistema", href: "/contacto?interes=software" },
    faqs: [
      {
        q: "¿Reemplaza mis herramientas?",
        a: "Solo lo que el alcance justifique; se evalúa mantener e integrar antes de reemplazar.",
      },
      {
        q: "¿Cómo empieza el proyecto?",
        a: "Con una definición de problema, usuarios y primera etapa verificable.",
      },
      {
        q: "¿Incluye una aplicación móvil?",
        a: "Se determina según el recorrido; no es una inclusión automática.",
      },
      {
        q: "¿Puedo seguir con otro equipo?",
        a: "Se documentan los entregables y las condiciones para dar continuidad al sistema.",
      },
    ],
    ejemplos: ["Sistemas internos", "Portales", "Productos digitales"],
    meta: {
      title: "Software a medida para empresas",
      description:
        "Diseñamos y desarrollamos plataformas, portales y sistemas internos cuando las herramientas disponibles dejan parte de la operación sin resolver.",
    },
  },
  {
    id: "agentes",
    slug: "agentes-ia",
    href: "/servicios/agentes-ia",
    navTitle: homeItem("agentes").title,
    description: homeItem("agentes").text,
    h1: "Agentes de IA con contexto y herramientas para trabajar.",
    bajada:
      "Construimos asistentes para consultar información, procesar entradas y ejecutar tareas dentro de permisos y reglas definidos.",
    problema:
      "Responder preguntas es solo una parte. Para trabajar dentro de una empresa, un agente necesita fuentes confiables, herramientas concretas y un modo de pedir ayuda cuando no puede resolver.",
    capacidades: [
      {
        title: "Asistencia interna",
        text: "Consultar documentación y datos autorizados con referencias al origen.",
      },
      {
        title: "Atención y clasificación",
        text: "Entender solicitudes, reunir contexto y derivar al equipo cuando corresponde.",
      },
      {
        title: "Documentos y tareas",
        text: "Extraer, revisar y preparar información para un proceso definido.",
      },
      {
        title: "Ejecución con control",
        text: "Proponer o realizar acciones según el permiso, con registros y aprobaciones donde se necesiten.",
      },
    ],
    metodo: {
      title: "Límites",
      text: "Definimos qué puede consultar, qué puede modificar y qué requiere una persona. Probamos respuestas incompletas, fuentes ausentes y fallos de herramientas, además de las situaciones correctas.",
    },
    demo: { href: "/labs/agente", label: "Probar la demo del agente", badge: DEMO_BADGE },
    ctaContacto: { label: "Evaluar un agente", href: "/contacto?interes=agentes" },
    faqs: [
      {
        q: "¿Es lo mismo que un chatbot?",
        a: "El alcance puede incluir herramientas y acciones, además de conversación; depende del diseño del proyecto.",
      },
      {
        q: "¿Puede equivocarse?",
        a: "Sí; por eso se prueban sus límites y se establecen validaciones y derivaciones.",
      },
      {
        q: "¿Dónde se usa?",
        a: "En el canal que justifique el proceso y permita la integración acordada.",
      },
      {
        q: "¿Cómo se cobra el uso?",
        a: "La propuesta separa construcción, mantenimiento y consumos cuando correspondan.",
      },
    ],
    ejemplos: ["Consultas sobre información", "Clasificación de documentos", "Asistencia operativa"],
    meta: {
      title: "Agentes de inteligencia artificial para empresas",
      description:
        "Construimos asistentes para consultar información, procesar entradas y ejecutar tareas dentro de permisos y reglas definidos.",
    },
  },
  {
    id: "automatizacion",
    slug: "automatizacion",
    href: "/servicios/automatizacion",
    navTitle: homeItem("automatizacion").title,
    description: homeItem("automatizacion").text,
    h1: "Conectá tus sistemas y evitá repetir el mismo trabajo.",
    bajada:
      "Diseñamos flujos entre herramientas, con validaciones, seguimiento y recuperación cuando una parte del proceso falla.",
    problema:
      "Cuando la información pasa de una herramienta a otra a mano, aparecen demoras y errores difíciles de rastrear. Revisamos dónde se origina cada dato y qué necesita pasar para que el proceso avance.",
    capacidades: [
      {
        title: "Sincronización",
        text: "Transferir datos entre fuentes autorizadas, evitando duplicados.",
      },
      {
        title: "Flujos operativos",
        text: "Ejecutar pasos a partir de un evento, una regla o una aprobación.",
      },
      {
        title: "Alertas y reportes",
        text: "Avisar lo que requiere atención y preparar información para decidir.",
      },
      {
        title: "Observabilidad",
        text: "Registrar estados, fallos y reintentos para entender qué ocurrió.",
      },
    ],
    metodo: {
      title: "Método",
      text: "Verificamos API y permisos, definimos una fuente de verdad, acordamos identificadores y diseñamos reintentos. Una automatización debe poder explicar qué hizo y qué quedó pendiente.",
    },
    demo: { href: "/labs/integraciones", label: "Probar la demo de integraciones", badge: DEMO_BADGE },
    ctaContacto: { label: "Revisar mi proceso", href: "/contacto?interes=automatizacion" },
    faqs: [
      {
        q: "¿Necesito cambiar mi sistema?",
        a: "No necesariamente; primero se revisan las opciones de conexión.",
      },
      {
        q: "¿Qué pasa si una API falla?",
        a: "El flujo define qué se reintenta y qué necesita intervención.",
      },
      {
        q: "¿Se puede integrar cualquier herramienta?",
        a: "Depende de su acceso técnico, permisos y condiciones.",
      },
      {
        q: "¿Cómo se evita duplicar información?",
        a: "Se acuerdan identificadores, reglas de actualización y registros de ejecución.",
      },
    ],
    ejemplos: ["Sincronización entre herramientas", "Alertas y reportes", "Validaciones y seguimiento"],
    meta: {
      title: "Integraciones y automatización para empresas",
      description:
        "Diseñamos flujos entre herramientas, con validaciones, seguimiento y recuperación cuando una parte del proceso falla.",
    },
  },
];

export function getSolution(slug: string): MarketingSolution | undefined {
  return SOLUTIONS.find((s) => s.slug === slug);
}

// Índice de servicios (6.1).
export const SERVICES_INDEX = {
  h1: "Tecnología construida alrededor de tu operación.",
  bajada:
    "Software, agentes e integraciones pueden trabajar juntos. Elegimos la combinación según el proceso, los datos y el resultado que necesitás conseguir.",
  closing: {
    question: "¿Tu necesidad cruza varias áreas?",
    text: "Contanos el proceso y evaluamos cómo resolverlo.",
    cta: { label: "Contanos tu proceso", href: "/contacto" },
  },
  meta: {
    title: "Servicios para empresas",
    description:
      "Software a medida, agentes de inteligencia artificial e integraciones. Elegimos la combinación según el proceso, los datos y el resultado que necesitás conseguir.",
  },
} as const;
