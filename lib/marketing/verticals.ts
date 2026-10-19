// Agentes por industria: datos de las tres líneas de producto en desarrollo.
// Server-safe: solo datos. Son capacidades y líneas de producto, no casos de éxito:
// no inventar clientes, despliegues ni métricas.

export type VerticalSlug = "restaurantes" | "hoteles" | "real-estate";

export type Vertical = {
  slug: VerticalSlug;
  /** Ruta pública: /soluciones/<slug>. */
  href: string;
  name: string;
  /** Etiqueta de estado comercial (nunca "caso de éxito"). */
  status: string;
  tagline: string;
  /** Qué problema resuelve. */
  problema: string;
  /** Quién lo usa. */
  userType: string;
  /** Qué conversaciones y tareas gestiona. */
  handles: readonly string[];
  /** Qué acciones puede ejecutar. */
  actions: readonly string[];
  /** Con qué sistemas puede integrarse (cuando la integración sea viable). */
  integrations: readonly string[];
  /** Qué datos necesita. */
  data: readonly string[];
  /** Permisos y controles. */
  controls: readonly string[];
  /** Cómo se adapta a cada empresa. */
  adapts: string;
  /** Próximo paso comercial. */
  nextStep: string;
  meta: { title: string; description: string };
};

/** Mensaje común sobre el estado de desarrollo. */
export const VERTICALS_PROMISE =
  "RUN ya cuenta con la arquitectura y la capacidad para desarrollar y adaptar estos agentes a una operación concreta.";

export const VERTICALS_INDEX = {
  eyebrow: "Agentes por industria",
  h1: "Agentes diseñados para operaciones reales.",
  bajada:
    "Estamos desarrollando agentes de IA para tres rubros donde la atención repetitiva le come tiempo al equipo: restaurantes, hoteles y real estate. Son líneas de producto en desarrollo, pensadas para adaptarse a cada operación.",
  statusNote:
    "Las tres líneas están en desarrollo y disponibles para pilotos. No son implementaciones cerradas: se definen y se ajustan con cada empresa antes de salir a producción.",
  closing: {
    title: "¿Tu operación encaja en alguna de estas líneas?",
    text: "Contanos cómo atienden hoy y qué sistemas usan. Evaluamos si tiene sentido un piloto y qué alcance conviene.",
  },
  cta: { label: "Quiero evaluar un piloto en mi empresa", href: "/contacto?interes=agentes" },
  meta: {
    title: "Agentes por industria",
    description:
      "Agentes de IA en desarrollo para restaurantes, hoteles y real estate. Disponibles para pilotos y adaptables a cada operación.",
  },
} as const;

export const VERTICALS: readonly Vertical[] = [
  {
    slug: "restaurantes",
    href: "/soluciones/restaurantes",
    name: "Restaurantes",
    status: "Disponible para pilotos",
    tagline: "Reservas, grupos y consultas atendidas sin que el equipo pierda el servicio.",
    problema:
      "En un restaurante, las consultas llegan todo el día por WhatsApp, Instagram o teléfono, y suelen caer justo cuando el equipo está sirviendo. Reservas, cambios, grupos, señas y preguntas repetidas se pierden o se contestan tarde.",
    userType:
      "El comensal que escribe para consultar o reservar, y el equipo del local (encargados, anfitriones, eventos) que recibe las gestiones ya ordenadas.",
    handles: [
      "Consultas y reservas",
      "Gestión de grupos y eventos",
      "Confirmaciones y recordatorios",
      "Preguntas frecuentes: horarios, carta, ubicación, políticas",
      "Derivación a una persona cuando el caso lo requiere",
    ],
    actions: [
      "Tomar y modificar reservas según las reglas del local",
      "Pedir los datos necesarios para grupos y eventos y pasarlos al equipo",
      "Enviar confirmaciones y recordatorios",
      "Solicitar señas o pagos mediante el medio que el restaurante defina",
      "Derivar la conversación a una persona con el contexto resumido",
    ],
    integrations: [
      "Sistemas operativos del restaurante (reservas, caja, gestión de salón) cuando haya una integración viable",
      "Canales de mensajería que el local ya usa",
      "Medios de pago para señas, según el proveedor",
    ],
    data: [
      "Horarios, capacidad y reglas de reserva",
      "Carta, políticas y preguntas frecuentes",
      "Criterios para grupos y eventos (mínimos, señas, condiciones)",
      "Disponibilidad, si hay un sistema del que leerla",
    ],
    controls: [
      "El restaurante define qué puede resolver solo el agente y qué pasa siempre a una persona",
      "Cobros y señas solo por los medios habilitados",
      "Historial de conversaciones disponible para revisión",
      "Acceso a sistemas limitado a lo necesario, con lectura primero",
    ],
    adapts:
      "Cada local tiene su forma de reservar, sus reglas para grupos y sus herramientas. Se configura el tono, las políticas, los canales y las conexiones con lo que ya usan, y se acota el alcance al inicio para ampliarlo a medida que se valida.",
    nextStep:
      "Una conversación inicial para entender cómo atienden hoy, qué canales y sistemas usan, y definir el alcance de un piloto.",
    meta: {
      title: "Agente para restaurantes",
      description:
        "Agente de IA en desarrollo para restaurantes: reservas, grupos y eventos, confirmaciones, señas y preguntas frecuentes. Disponible para pilotos.",
    },
  },
  {
    slug: "hoteles",
    href: "/soluciones/hoteles",
    name: "Hoteles",
    status: "Disponible para pilotos",
    tagline: "Atención del huésped antes, durante y después de la reserva.",
    problema:
      "Un hotel recibe las mismas preguntas antes de reservar y durante la estadía, a cualquier hora. Responder rápido define si la reserva se concreta, pero el equipo de recepción tiene que atender también a quienes están en el lobby.",
    userType:
      "El potencial huésped que consulta antes de reservar, el huésped alojado que necesita algo durante su estadía, y el equipo de recepción y reservas.",
    handles: [
      "Consultas de disponibilidad",
      "Información previa a la reserva",
      "Preguntas frecuentes",
      "Recomendaciones y servicios del hotel",
      "Atención durante la estadía",
      "Derivación al equipo",
    ],
    actions: [
      "Consultar disponibilidad y tarifas cuando haya conexión con el sistema",
      "Responder con la información del hotel: servicios, políticas, check-in y check-out",
      "Sugerir servicios y recomendaciones locales",
      "Registrar pedidos o solicitudes del huésped y pasarlos al área correspondiente",
      "Derivar al equipo con el contexto de la conversación",
    ],
    integrations: [
      "PMS (sistema de gestión del hotel), cuando sea viable",
      "CRM del hotel",
      "Motor de reservas",
      "Canales de mensajería que el hotel ya usa",
    ],
    data: [
      "Descripción de habitaciones, servicios y políticas",
      "Disponibilidad y tarifas, si hay un sistema del que leerlas",
      "Recomendaciones y contenidos locales que el hotel quiera ofrecer",
      "Criterios de derivación por área",
    ],
    controls: [
      "El hotel define qué información y qué acciones están habilitadas",
      "Reclamos, cambios de reserva y temas sensibles pasan siempre al equipo",
      "Historial de conversaciones disponible para revisión",
      "Conexión a PMS, CRM o motor de reservas con permisos acotados, lectura primero",
    ],
    adapts:
      "Cada hotel opera con un PMS, un motor y un estilo de atención distintos. Se adapta el contenido, el tono, los idiomas, los canales y las integraciones posibles, empezando por el alcance que el equipo pueda validar.",
    nextStep:
      "Una conversación inicial para relevar canales, sistemas (PMS, CRM, motor de reservas) y consultas más frecuentes, y definir el alcance de un piloto.",
    meta: {
      title: "Agente para hoteles",
      description:
        "Agente de IA en desarrollo para hoteles: disponibilidad, información previa, atención durante la estadía e integración con PMS, CRM y motor de reservas. Disponible para pilotos.",
    },
  },
  {
    slug: "real-estate",
    href: "/soluciones/real-estate",
    name: "Real estate",
    status: "Versión piloto",
    tagline: "Leads calificados y visitas coordinadas, con el asesor correcto a cargo.",
    problema:
      "En una inmobiliaria o desarrolladora entran consultas de todo tipo, a cualquier hora y por varios canales. Sin una primera calificación, los asesores dedican tiempo a leads que no avanzan y los buenos se enfrían esperando respuesta.",
    userType:
      "La persona que busca comprar, alquilar o invertir, y el equipo comercial (asesores y coordinadores) que recibe leads ya calificados.",
    handles: [
      "Calificación inicial de leads",
      "Identificación de intención y presupuesto",
      "Recomendación de propiedades",
      "Coordinación de visitas",
      "Seguimiento comercial",
      "Registro de conversaciones",
      "Derivación al asesor adecuado",
    ],
    actions: [
      "Hacer las preguntas de calificación que defina la inmobiliaria",
      "Recomendar propiedades del inventario según lo que busca la persona",
      "Proponer y coordinar horarios de visita",
      "Registrar la conversación y los datos del lead en el CRM",
      "Hacer el seguimiento acordado con quienes no avanzaron",
      "Derivar al asesor adecuado con un resumen",
    ],
    integrations: [
      "CRM de la inmobiliaria",
      "Inventario o portal de propiedades, cuando haya una fuente accesible",
      "Calendario de los asesores para coordinar visitas",
      "Canales de mensajería que el equipo ya usa",
    ],
    data: [
      "Inventario de propiedades con sus características",
      "Criterios de calificación y de asignación de asesores",
      "Disponibilidad de los asesores para visitas",
      "Reglas de seguimiento comercial",
    ],
    controls: [
      "La inmobiliaria define cómo se califica y a quién se deriva cada lead",
      "Condiciones comerciales, precios y negociación quedan a cargo del asesor",
      "Registro de cada conversación disponible para revisión",
      "Acceso al CRM con permisos acotados a lo necesario",
    ],
    adapts:
      "Cada inmobiliaria califica distinto, trabaja con un CRM propio y reparte los leads a su manera. Se adaptan las preguntas, el inventario, la asignación de asesores y las integraciones, y se arranca con un piloto de alcance acotado.",
    nextStep:
      "Una conversación inicial para entender el recorrido de un lead hoy, el CRM y el inventario, y definir el alcance de un piloto.",
    meta: {
      title: "Agente para real estate",
      description:
        "Agente de IA en desarrollo para real estate: calificación de leads, recomendación de propiedades, coordinación de visitas e integración con CRM. Versión piloto.",
    },
  },
];

export function getVertical(slug: string): Vertical | undefined {
  return VERTICALS.find((v) => v.slug === slug);
}
