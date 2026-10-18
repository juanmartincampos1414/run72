// Guías del blog de RUN (sección 11). Copy final, sin fechas ni cifras inventadas.
// Server-safe: solo datos.

export type ArticleCategory = "software" | "ia" | "automatizacion";

export type Block =
  | { kind: "lead"; text: string }
  | { kind: "p"; text: string }
  | { kind: "h2"; text: string };

export type Article = {
  slug: string;
  title: string;
  category: ArticleCategory;
  summary: string;
  /** Fecha efectiva de publicación (ISO, AAAA-MM-DD). */
  dateISO: string;
  author: "Equipo RUN";
  related: {
    solutionHref: string;
    solutionLabel: string;
    demoHref: string;
    demoLabel: string;
  };
  body: Block[];
  /** Párrafo de cierre previo a los enlaces relacionados. */
  closing: string;
};

export const CATEGORY_LABEL: Record<ArticleCategory, string> = {
  software: "Software",
  ia: "IA",
  automatizacion: "Automatización",
};

const PUBLISHED = "2026-10-18";

export const ARTICLES: Article[] = [
  {
    slug: "software-a-medida-o-saas",
    title: "Cuándo conviene un sistema a medida y cuándo integrar lo que ya usás.",
    category: "software",
    summary: "La decisión empieza por el proceso y sus restricciones, antes de elegir una tecnología.",
    dateISO: PUBLISHED,
    author: "Equipo RUN",
    related: {
      solutionHref: "/servicios/software-a-medida",
      solutionLabel: "Software a medida",
      demoHref: "/labs/operacion",
      demoLabel: "Demo de operación",
    },
    body: [
      {
        kind: "lead",
        text: "Una empresa puede necesitar una pantalla nueva sin necesitar un sistema completamente nuevo. Antes de desarrollar, conviene describir qué trabajo no está resuelto, quién lo hace y qué información necesita. Ese recorrido permite comparar alternativas con un criterio concreto.",
      },
      { kind: "h2", text: "Qué conviene mantener" },
      {
        kind: "p",
        text: "Una herramienta existente puede resolver correctamente una parte importante del trabajo. Revisá qué datos contiene, qué funciones usa el equipo y qué conexiones permite. Si el problema aparece entre herramientas, una integración puede resolverlo con menos cambio operativo que reemplazarlas.",
      },
      { kind: "h2", text: "Qué justificaría construir" },
      {
        kind: "p",
        text: "Un desarrollo a medida puede tener sentido cuando el proceso necesita reglas, permisos o recorridos que las alternativas disponibles no resuelven de manera razonable. La comparación debe considerar también mantenimiento, uso cotidiano y dependencia de servicios externos. Tener más funciones no es un objetivo por sí mismo.",
      },
      { kind: "h2", text: "Cómo comparar opciones" },
      {
        kind: "p",
        text: "Elegí una tarea representativa y describí el estado inicial, los pasos necesarios y el resultado aceptable. Probá cómo la resolvería cada alternativa. Anotá las excepciones: una corrección de datos, una aprobación o una falla de conexión suelen revelar necesidades que una demostración ideal no muestra.",
      },
      { kind: "h2", text: "Qué debería dejar una primera etapa" },
      {
        kind: "p",
        text: "Una etapa acotada necesita usuarios identificados, un alcance, criterios de aceptación y una forma de observar el uso. También debe explicar qué queda fuera. Con esa base, la decisión de ampliar el sistema puede apoyarse en experiencia de operación y no solo en la apariencia de una interfaz.",
      },
    ],
    closing:
      "Si querés evaluar una tarea concreta, contanos cómo se resuelve hoy y qué debería cambiar.",
  },
  {
    slug: "primer-agente-de-ia",
    title: "Qué definir antes de poner un agente de IA a trabajar.",
    category: "ia",
    summary: "Una primera implementación necesita fuentes, acciones permitidas y criterios para pedir ayuda.",
    dateISO: PUBLISHED,
    author: "Equipo RUN",
    related: {
      solutionHref: "/servicios/agentes-ia",
      solutionLabel: "Agentes de IA",
      demoHref: "/labs/agente",
      demoLabel: "Demo de agente",
    },
    body: [
      {
        kind: "lead",
        text: "Un agente útil tiene un trabajo delimitado. La primera pregunta es qué necesita resolver una persona y qué parte de ese recorrido puede asumir el sistema. A partir de ahí se definen información, herramientas y límites.",
      },
      { kind: "h2", text: "Fuentes y contexto" },
      {
        kind: "p",
        text: "Identificá dónde está la información autorizada, quién la mantiene y qué debe pasar cuando falta o se contradice. Una respuesta segura puede ser reconocer que no hay datos suficientes y preparar una derivación. La interfaz debe permitir entender de dónde salió una respuesta cuando ese origen sea relevante.",
      },
      { kind: "h2", text: "Consultar y modificar son permisos distintos" },
      {
        kind: "p",
        text: "Leer el estado de una solicitud y cambiar sus condiciones tienen consecuencias diferentes. Definí qué acciones son de consulta, cuáles generan un borrador y cuáles necesitan aprobación. No conviene conceder una herramienta de escritura solo porque simplifica una demostración.",
      },
      { kind: "h2", text: "Probar situaciones difíciles" },
      {
        kind: "p",
        text: "Además de preguntas habituales, incluí solicitudes fuera de alcance, documentos incompletos, fuentes no disponibles y herramientas que fallan. El resultado esperado puede ser una respuesta, un pedido de aclaración o una derivación. Esos comportamientos también forman parte de la aceptación.",
      },
      { kind: "h2", text: "Poner una primera versión en uso" },
      {
        kind: "p",
        text: "Empezá por un proceso delimitado y observá qué ocurre. Registrá errores y motivos de derivación sin recopilar datos innecesarios. La ampliación de permisos debe responder al aprendizaje del uso y a una decisión del responsable del proceso.",
      },
    ],
    closing:
      "Mirá la demo de consulta y aprobación para ver la diferencia entre responder, preparar una acción y ejecutarla.",
  },
  {
    slug: "integrar-sin-reemplazar",
    title: "Cómo ordenar una integración entre sistemas antes de automatizar.",
    category: "automatizacion",
    summary: "La fuente de verdad, los identificadores y los fallos importan tanto como el recorrido correcto.",
    dateISO: PUBLISHED,
    author: "Equipo RUN",
    related: {
      solutionHref: "/servicios/automatizacion",
      solutionLabel: "Automatización",
      demoHref: "/labs/integraciones",
      demoLabel: "Demo de integración",
    },
    body: [
      {
        kind: "lead",
        text: "Una integración conecta información y decisiones entre herramientas. Para diseñarla conviene empezar por un evento concreto: qué ocurre, dónde se registra y qué debería suceder después. Dibujar ese recorrido ayuda a separar un paso necesario de una copia manual que puede evitarse.",
      },
      { kind: "h2", text: "Definir el origen de cada dato" },
      {
        kind: "p",
        text: "Si dos sistemas pueden modificar el mismo campo, hay que decidir cuál prevalece y cómo se resuelven las diferencias. También conviene identificar qué información necesita actualizarse de inmediato y qué parte puede procesarse por lotes.",
      },
      { kind: "h2", text: "Reconocer un evento repetido" },
      {
        kind: "p",
        text: "Una conexión puede entregar el mismo aviso más de una vez. El flujo necesita un identificador que permita reconocerlo y evitar duplicar una operación. Esa regla debe probarse, no quedar como una expectativa sobre el proveedor.",
      },
      { kind: "h2", text: "Preparar los fallos" },
      {
        kind: "p",
        text: "Una API puede no responder o rechazar un dato. Definí qué errores se reintentan, cuántas veces y cuáles requieren una persona. El equipo debe poder ver qué quedó pendiente y volver a ejecutar el paso adecuado sin recrear todo el proceso.",
      },
      { kind: "h2", text: "Observar el recorrido" },
      {
        kind: "p",
        text: "Un historial útil explica qué dato entró, qué validación pasó y qué acción se completó. No necesita exponer información sensible para ofrecer trazabilidad. Los permisos y el contenido de los registros se diseñan junto con la integración.",
      },
    ],
    closing:
      "La demo de integraciones muestra un evento repetido y un fallo temporal. Son parte del funcionamiento esperado, no situaciones para ocultar.",
  },
];

/** Entrada destacada del índice; el listado muestra el resto. */
export const FEATURED_SLUG = "primer-agente-de-ia";

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** "2026-10-18" -> "18 de octubre de 2026" (sin depender de ICU). */
export function formatArticleDate(dateISO: string): string {
  const [y, m, d] = dateISO.split("-").map(Number);
  return `${d} de ${MONTHS[m - 1]} de ${y}`;
}
