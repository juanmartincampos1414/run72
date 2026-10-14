// Radar de IA de RUN72 — config del diagnóstico (v1).
// Inspirado en el radar de CESSI, reescrito para PyMEs y orientado a la acción.

export type Dimension = {
  code: string;
  name: string;
  short: string;
  /** Servicio RUN72 que levanta esta dimensión cuando está floja. */
  service: string;
};

export const DIMENSIONS: Dimension[] = [
  { code: "PO", name: "Procesos y Operaciones", short: "Procesos", service: "Automatizaciones y agentes de IA" },
  { code: "CO", name: "Clientes y Ventas", short: "Clientes", service: "Web + marketing con IA" },
  { code: "DT", name: "Datos y Herramientas", short: "Datos", service: "Plataforma, datos y CRM a medida" },
  { code: "PC", name: "Equipo y Cultura", short: "Equipo", service: "Formación e implementación con tu equipo" },
  { code: "ES", name: "Estrategia y Liderazgo", short: "Estrategia", service: "Estrategia y hoja de ruta de IA" },
  { code: "GR", name: "Gobernanza y Riesgo", short: "Gobernanza", service: "Buenas prácticas y uso responsable" },
];

export type Question = {
  id: string;
  dim: string;
  /** Línea con la que Runit presenta la pregunta. */
  runit: string;
  q: string;
  /** 4 opciones; el índice (1-4) es el nivel. */
  options: [string, string, string, string];
};

export const QUESTIONS: Question[] = [
  // Procesos
  { id: "PO1", dim: "PO", runit: "Arranquemos por lo operativo.", q: "¿Dónde está la IA en tu trabajo diario?", options: [
    "Casi no se usa, o solo cosas sueltas (redactar, resumir, buscar).",
    "En una o dos áreas, a modo de prueba.",
    "Integrada a procesos clave de varias áreas.",
    "En los procesos principales de todo el equipo, como forma de trabajar.",
  ] },
  { id: "PO2", dim: "PO", runit: "¿Y la parte repetitiva?", q: "¿Cómo automatizás las tareas?", options: [
    "A mano, o con automatizaciones sin IA.",
    "Algunas automatizaciones con IA, sueltas.",
    "Procesos clave ya corren automatizados con IA.",
    "Agentes de IA ejecutan tareas completas, con supervisión.",
  ] },
  // Clientes
  { id: "CO1", dim: "CO", runit: "Pasemos a tus clientes.", q: "¿Cómo usás IA para atenderlos?", options: [
    "No la uso.",
    "En algún canal (ej. un bot que responde mensajes).",
    "En los canales principales, con resultados medidos.",
    "La atención se personaliza y se adelanta a lo que necesitan.",
  ] },
  { id: "CO2", dim: "CO", runit: "¿Y para vender y comunicar?", q: "¿Cómo usás IA en ventas y marketing?", options: [
    "No la uso.",
    "Apoyo puntual en contenidos o campañas.",
    "Integrada a cómo capto y sigo clientes, con métricas.",
    "Me ayuda a decidir a quién, qué y cuándo ofrecer.",
  ] },
  // Datos
  { id: "DT1", dim: "DT", runit: "La base: datos y sistemas.", q: "¿Cómo están tus datos y sistemas?", options: [
    "Planillas y sistemas sueltos; información dispersa.",
    "Tengo un sistema de gestión, pero la info está dispersa.",
    "Sistemas integrados; la información fluye y está disponible.",
    "Listos para sumar IA a escala, de forma segura.",
  ] },
  { id: "DT2", dim: "DT", runit: "¿Y las herramientas?", q: "¿Con qué herramientas de IA trabajás?", options: [
    "Ninguna, o cuentas personales sueltas.",
    "Licencias para algunos, sin criterio común.",
    "Herramientas definidas, con accesos y seguridad.",
    "Integradas a tus sistemas, con reglas de uso.",
  ] },
  // Equipo
  { id: "PC1", dim: "PC", runit: "Hablemos del equipo.", q: "¿Quién impulsa la IA en tu organización?", options: [
    "Nadie en particular, o entusiastas sueltos.",
    "Referentes informales.",
    "Responsables por área o un equipo dedicado.",
    "Está en los objetivos de cada área.",
  ] },
  { id: "PC2", dim: "PC", runit: "¿Y la formación?", q: "¿Cómo se forma tu gente en IA?", options: [
    "Cada uno aprende por su cuenta.",
    "Capacitaciones puntuales.",
    "Formación continua, según el puesto.",
    "Además, hay tiempo para practicar y compartir aprendizajes.",
  ] },
  // Estrategia
  { id: "ES1", dim: "ES", runit: "Mirada de dirección.", q: "¿Qué lugar tiene la IA en la dirección?", options: [
    "Interés, pero sin una agenda.",
    "Alguien impulsa iniciativas puntuales.",
    "Es prioridad del año, con responsable y recursos.",
    "Orienta las decisiones centrales del negocio.",
  ] },
  { id: "ES2", dim: "ES", runit: "¿Y los resultados?", q: "¿Cómo medís el impacto de la IA?", options: [
    "No lo mido.",
    "Mido el uso (quién usa qué).",
    "Mido ahorros de tiempo, costos o mejoras de calidad.",
    "Mido su efecto en ventas, satisfacción o metas.",
  ] },
  // Gobernanza
  { id: "GR1", dim: "GR", runit: "Cerramos con lo serio: las reglas.", q: "¿Qué reglas tenés para usar IA?", options: [
    "No hay reglas; el uso es informal.",
    "Lineamientos mínimos comunicados.",
    "Una política vigente, conocida y aplicada.",
    "Se controla y se puede demostrar ante clientes.",
  ] },
  { id: "GR2", dim: "GR", runit: "¿Y los datos sensibles?", q: "¿Cómo protegés los datos frente a la IA?", options: [
    "No se evalúa qué datos se exponen.",
    "Restricciones básicas (qué no se puede cargar).",
    "Controles técnicos y acuerdos con proveedores.",
    "Cada nuevo uso se evalúa antes de arrancar.",
  ] },
];

export type Stage = { level: number; key: string; name: string; tagline: string; desc: string };

export const STAGES: Stage[] = [
  { level: 1, key: "explorando", name: "Explorando", tagline: "Recién arrancando con IA.",
    desc: "La IA todavía no cambió cómo trabajás. Hay mucho terreno fácil de ganar." },
  { level: 2, key: "probando", name: "Probando", tagline: "Ya hay pruebas sueltas.",
    desc: "Diste los primeros pasos. El salto está en integrarlas al día a día." },
  { level: 3, key: "adoptando", name: "Adoptando", tagline: "La IA ya es parte de cómo trabajás.",
    desc: "La incorporaste puertas adentro. Ahora toca llevarla a tus clientes y escalar." },
  { level: 4, key: "liderando", name: "Liderando", tagline: "La IA está en el núcleo de tu negocio.",
    desc: "Estás adelante. El foco es sostener la ventaja y seguir creando valor nuevo." },
];

export type DimScore = Dimension & { level: number; raw: number };
export type RadarResult = {
  dims: DimScore[];
  stageLevel: number;
  stage: Stage;
  moves: DimScore[];
  avg: number;
};

/** Puntúa las respuestas. Estadio = la dimensión más baja manda (cuello de botella). */
export function scoreRadar(answers: Record<string, number>): RadarResult {
  const dims: DimScore[] = DIMENSIONS.map((d) => {
    const qs = QUESTIONS.filter((q) => q.dim === d.code);
    const vals = qs.map((q) => answers[q.id]).filter((v): v is number => !!v);
    const raw = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 1;
    return { ...d, raw, level: Math.max(1, Math.round(raw)) };
  });
  const stageLevel = Math.min(...dims.map((d) => d.level));
  const stage = STAGES[stageLevel - 1] ?? STAGES[0];
  const moves = [...dims].sort((a, b) => a.raw - b.raw).slice(0, 3);
  const avg = dims.reduce((a, d) => a + d.raw, 0) / dims.length;
  return { dims, stageLevel, stage, moves, avg };
}

export const NIVEL_NOMBRE = ["", "Explorando", "Probando", "Adoptando", "Liderando"];
