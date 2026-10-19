// Radar de IA de RUN — config del diagnóstico (v2).
// Vocabulario 100% propio (no usa los términos del radar de CESSI).
// 6 áreas · 1 pregunta por área · rápido de completar.

export type Area = {
  code: string;
  /** Nombre que ve el cliente. */
  name: string;
  /** Etiqueta corta para el gráfico. */
  short: string;
  /** Servicio RUN que empuja esta área cuando está floja. */
  service: string;
  /** Qué hacer para subir de nivel (próximo paso). */
  tip: string;
};

export const AREAS: Area[] = [
  { code: "OP", name: "Tu operación", short: "Operación",
    service: "Automatizaciones y agentes de IA",
    tip: "Elegí una tarea repetitiva y definí qué parte puede automatizarse y qué requiere revisión." },
  { code: "CL", name: "Tus clientes", short: "Clientes",
    service: "Agentes e integración de atención",
    tip: "Sumá agentes e integraciones a cómo atendés consultas, y medí qué cambia." },
  { code: "HE", name: "Tus datos y herramientas", short: "Herramientas",
    service: "Plataforma, datos y CRM a medida",
    tip: "Ordená tus datos y pasá a herramientas con accesos y seguridad." },
  { code: "EQ", name: "Tu equipo", short: "Equipo",
    service: "Adopción con tu equipo",
    tip: "Como condición del proyecto, definí un responsable interno y el tiempo del equipo para adoptar la herramienta." },
  { code: "ES", name: "Tu estrategia", short: "Estrategia",
    service: "Prioridades y alcance del proyecto",
    tip: "Acordá 2 o 3 prioridades y una forma de medir el impacto antes de construir." },
  { code: "RG", name: "Tus reglas", short: "Reglas",
    service: "Buenas prácticas y uso responsable",
    tip: "Escribí reglas mínimas de uso y qué datos no se cargan." },
];

export type Question = {
  id: string;
  area: string;
  /** Línea con la que Runit abre la pregunta. */
  runit: string;
  q: string;
  /** 4 opciones; el índice (1-4) es el nivel. También son la escala para el modo conversación. */
  options: [string, string, string, string];
};

export const QUESTIONS: Question[] = [
  { id: "OP", area: "OP", runit: "Arranquemos por tu día a día.", q: "¿Cuánto usás IA para trabajar?", options: [
    "Casi nada, alguna consulta suelta.",
    "La probé en una o dos cosas.",
    "Ya es parte de cómo trabajo en varias áreas.",
    "Está metida en casi todo lo que hacemos.",
  ] },
  { id: "CL", area: "CL", runit: "Vamos a tus clientes.", q: "¿Y para conseguirlos y atenderlos?", options: [
    "No la uso para eso.",
    "Algo puntual en contenido o respuestas.",
    "La uso seguido y miro los resultados.",
    "Personaliza y decide a quién y cuándo ofrecer.",
  ] },
  { id: "HE", area: "HE", runit: "La base: tus datos.", q: "¿Cómo están tus datos y herramientas?", options: [
    "Todo en planillas y cuentas sueltas.",
    "Tengo un sistema, pero la info está desordenada.",
    "Sistemas ordenados y herramientas con criterio.",
    "Todo conectado y listo para IA a escala.",
  ] },
  { id: "EQ", area: "EQ", runit: "Hablemos de tu gente.", q: "¿Cómo viene tu equipo con la IA?", options: [
    "Cada uno por su cuenta, sin rumbo.",
    "Un par de curiosos que empujan.",
    "Hay referentes y algo de formación.",
    "Todo el equipo capacitado y sumando.",
  ] },
  { id: "ES", area: "ES", runit: "Mirada de arriba.", q: "¿Qué lugar tiene la IA en tus decisiones?", options: [
    "Me interesa, pero no hay un plan.",
    "Pruebo cosas sueltas cuando puedo.",
    "Es una prioridad del año, con foco.",
    "Guía hacia dónde va el negocio.",
  ] },
  { id: "RG", area: "RG", runit: "Cerramos con lo importante.", q: "¿Tenés reglas para usarla con cuidado?", options: [
    "Ninguna, es a pulmón.",
    "Un par de pautas básicas.",
    "Reglas claras de qué sí y qué no.",
    "Todo prolijo y demostrable ante clientes.",
  ] },
];

export type Stage = { level: number; key: string; name: string; desc: string };

export const STAGES: Stage[] = [
  { level: 1, key: "arranque", name: "En el arranque",
    desc: "Estás empezando con la IA. Hay un montón de terreno fácil de ganar rápido." },
  { level: 2, key: "ritmo", name: "Agarrando ritmo",
    desc: "Ya diste los primeros pasos. Ahora toca ordenarlos y hacerlos rendir." },
  { level: 3, key: "velocidad", name: "En velocidad",
    desc: "La IA ya es parte de cómo trabajás. El próximo salto es llevarla a tus clientes y escalar." },
  { level: 4, key: "cabeza", name: "A la cabeza",
    desc: "Vas adelante. El foco es sostener la ventaja y seguir creando valor nuevo." },
];

export type AreaScore = Area & { level: number };
export type RadarResult = {
  areas: AreaScore[];
  stageLevel: number;
  stage: Stage;
  steps: AreaScore[];
};

/** Puntúa las respuestas. El nivel general lo marca el área más floja. */
export function scoreRadar(answers: Record<string, number>): RadarResult {
  const areas: AreaScore[] = AREAS.map((a) => ({
    ...a,
    level: Math.max(1, Math.min(4, answers[a.code] || 1)),
  }));
  const stageLevel = Math.min(...areas.map((a) => a.level));
  const stage = STAGES[stageLevel - 1] ?? STAGES[0];
  const steps = [...areas].sort((a, b) => a.level - b.level).slice(0, 3);
  return { areas, stageLevel, stage, steps };
}

export const NIVEL = ["", "En el arranque", "Agarrando ritmo", "En velocidad", "A la cabeza"];
