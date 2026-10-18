// Labs de RUN: datos ficticios y lógica determinista de las tres demos (sección 9).
// Solo datos y funciones puras. Sin red, sin modelos, sin datos reales.
// Server-safe: lo consumen las páginas (server) y los componentes de demo (client).

export const DEMO_BANNER = "Demo interactiva · Datos ficticios";
export const DEMO_BANNER_NOTE = "Simulación local: no se envían datos ni se usa ningún modelo.";
export const DEMO_STEPS = ["Entrada", "Proceso", "Resultado"] as const;

// ---------- Índice y metadatos de página ----------

export type LabKind = "Software" | "IA" | "Automatización";

export type LabCard = {
  id: "operacion" | "agente" | "integraciones";
  kind: LabKind;
  title: string;
  text: string;
  href: string;
  cta: string;
};

export const LABS_INDEX = {
  eyebrow: "Labs",
  h1Lead: "Entendé la solución antes de imaginarla en",
  h1Accent: "tu empresa.",
  bajada: "Explorá ejemplos de software, agentes y automatizaciones con datos ficticios.",
  meta: {
    title: "Demos de software y agentes",
    description:
      "Explorá ejemplos de software, agentes y automatizaciones con datos ficticios. Son simulaciones locales: no se envían datos ni se usan modelos.",
  },
  cards: [
    {
      id: "operacion",
      kind: "Software",
      title: "Sistema operativo",
      text: "Un recorrido de pedidos y estados en una sola vista.",
      href: "/labs/operacion",
      cta: "Probar el sistema",
    },
    {
      id: "agente",
      kind: "IA",
      title: "Agente operativo",
      text: "Consultar, preparar una acción y pedir aprobación.",
      href: "/labs/agente",
      cta: "Probar el agente",
    },
    {
      id: "integraciones",
      kind: "Automatización",
      title: "Integración operativa",
      text: "De un evento a un registro, con control de fallos.",
      href: "/labs/integraciones",
      cta: "Probar la integración",
    },
  ] satisfies LabCard[],
  map: {
    title: "Ver un mapa de implementación",
    text: "Un ejemplo de cómo se ordena un proyecto: etapas, decisiones y entregables.",
    href: "/mapa/ejemplo",
  },
} as const;

export const LAB_PAGES = {
  operacion: {
    crumb: "Sistema operativo",
    title: "Una operación en una sola vista.",
    subtitle: "Seguí solicitudes, responsables y pendientes sin reconstruir el estado entre varias planillas.",
    meta: {
      title: "Demo de sistema interno",
      description:
        "Seguí solicitudes, responsables y pendientes en una sola vista. Demo interactiva con datos ficticios, sin conexión a sistemas reales.",
    },
    cta: {
      text: "¿Tu equipo reconstruye el estado entre planillas?",
      label: "Evaluar una herramienta interna",
      href: "/contacto?interes=software",
    },
  },
  agente: {
    crumb: "Agente operativo",
    title: "Un agente que consulta y sabe cuándo pedir ayuda.",
    subtitle:
      "Elegí una consulta y mirá qué fuente usa, qué acción hace y en qué punto necesita una persona. Es una simulación determinista.",
    meta: {
      title: "Demo de agente de IA",
      description:
        "Un agente que consulta una fuente de ejemplo y sabe cuándo pedir aprobación humana. Simulación local con datos ficticios, sin modelo real.",
    },
    cta: {
      text: "¿Querés un agente que consulte y pida aprobación en tu operación?",
      label: "Evaluar un agente para mi operación",
      href: "/contacto?interes=agentes",
    },
  },
  integraciones: {
    crumb: "Integración operativa",
    title: "Un dato entra una vez y el proceso sabe cómo seguir.",
    subtitle: "De un evento a un registro, con control de fallos, reintentos y protección frente a eventos repetidos.",
    meta: {
      title: "Demo de integración",
      description:
        "Un evento, cuatro pasos, un fallo y un reintento sin duplicados. Demo interactiva con datos ficticios, sin conectores reales.",
    },
    cta: {
      text: "¿Copiás información a mano entre herramientas?",
      label: "Revisar mis integraciones",
      href: "/contacto?interes=automatizacion",
    },
  },
} as const;

// ---------- 9.2 Sistema interno ----------

export type OpStatus = "Pendiente" | "En curso" | "Finalizada";
export type OpFilter = "Todos" | OpStatus;
export type OpPriority = "Alta" | "Media" | "Baja";

export type OpHistoryEntry = { text: string; when: string };

export type OpRequest = {
  id: string;
  title: string;
  area: string;
  owner: string;
  priority: OpPriority;
  status: OpStatus;
  description: string;
  // Más reciente primero. Los horarios son relativos y simulados.
  history: OpHistoryEntry[];
};

export const OP_FILTERS: readonly OpFilter[] = ["Todos", "Pendiente", "En curso", "Finalizada"];

export const OP_EMPTY = "No hay solicitudes en este estado.";
export const OP_WHEN_NOW = "hace instantes (hora simulada)";

export const OP_INITIAL: readonly OpRequest[] = [
  {
    id: "SOL-104",
    title: "Reposición de insumos",
    area: "Operaciones",
    owner: "Equipo de compras",
    priority: "Media",
    status: "Pendiente",
    description: "Reunir la información del pedido, validar cantidades y enviarlo a revisión.",
    history: [{ text: "Solicitud creada", when: "hace 2 h (hora simulada)" }],
  },
  {
    id: "SOL-105",
    title: "Actualización de acceso",
    area: "Sistemas",
    owner: "Equipo interno",
    priority: "Alta",
    status: "En curso",
    description: "Revisar los permisos del área y registrar los cambios aprobados.",
    history: [
      { text: "Pasó a En curso", when: "hace 3 h (hora simulada)" },
      { text: "Solicitud creada", when: "hace 1 d (hora simulada)" },
    ],
  },
  {
    id: "SOL-106",
    title: "Resumen de cierre",
    area: "Administración",
    owner: "Equipo interno",
    priority: "Baja",
    status: "Finalizada",
    description: "Reunir los pendientes del período y dejar el resumen listo para consulta.",
    history: [
      { text: "Pasó a Finalizada", when: "hace 1 d (hora simulada)" },
      { text: "Solicitud creada", when: "hace 3 d (hora simulada)" },
    ],
  },
];

export function opInitial(): OpRequest[] {
  return OP_INITIAL.map((r) => ({ ...r, history: r.history.map((h) => ({ ...h })) }));
}

export function opFilterItems(items: readonly OpRequest[], filter: OpFilter): OpRequest[] {
  return filter === "Todos" ? [...items] : items.filter((r) => r.status === filter);
}

// Los contadores se calculan sobre los registros de la demo, no son métricas de RUN.
export function opCounts(items: readonly OpRequest[]): Record<OpFilter, number> {
  return {
    Todos: items.length,
    Pendiente: items.filter((r) => r.status === "Pendiente").length,
    "En curso": items.filter((r) => r.status === "En curso").length,
    Finalizada: items.filter((r) => r.status === "Finalizada").length,
  };
}

export type OpAction = { label: string; to: OpStatus; history: string };

export function opNextAction(status: OpStatus): OpAction | null {
  if (status === "Pendiente") {
    return { label: "Asignar revisión", to: "En curso", history: "Revisión asignada en esta demo" };
  }
  if (status === "En curso") {
    return { label: "Completar revisión", to: "Finalizada", history: "Revisión completada en esta demo" };
  }
  return null;
}

export function opApplyAction(items: readonly OpRequest[], id: string): OpRequest[] {
  return items.map((r) => {
    if (r.id !== id) return r;
    const action = opNextAction(r.status);
    if (!action) return r;
    return { ...r, status: action.to, history: [{ text: action.history, when: OP_WHEN_NOW }, ...r.history] };
  });
}

export function opFilterMessage(filter: OpFilter, count: number): string {
  if (count === 0) return OP_EMPTY;
  const noun = count === 1 ? "solicitud" : "solicitudes";
  return filter === "Todos" ? `Mostrando ${count} ${noun}.` : `Mostrando ${count} ${noun} con estado ${filter}.`;
}

// ---------- 9.3 Agente ----------

export type AgentScenarioId = "consultar" | "excepcion";

export type AgentTraceEntry = { title: string; detail: string };

export type AgentScenario = {
  id: AgentScenarioId;
  buttonLabel: string;
  hint: string;
  input: string;
  processing: string;
  reply: string;
  nextLabel: string;
  resultTitle: string;
  resultText: string;
  trace: AgentTraceEntry[];
};

export const AGENT_SCENARIOS: Record<AgentScenarioId, AgentScenario> = {
  consultar: {
    id: "consultar",
    buttonLabel: "Consultar un pedido",
    hint: "El agente lee una fuente de ejemplo y responde.",
    input: "¿Cuál es el estado del pedido DEMO-021?",
    processing: "Consultando fuente de ejemplo",
    reply: "Estoy leyendo el registro ficticio del pedido. Es una consulta de solo lectura.",
    nextLabel: "Ver respuesta",
    resultTitle: "Pedido preparado",
    resultText: "La entrega todavía no tiene fecha confirmada.",
    trace: [
      { title: "Entrada recibida", detail: "Consulta sobre el estado del pedido DEMO-021." },
      { title: "Fuente consultada", detail: "Registro ficticio DEMO-021, en modo de solo lectura." },
      { title: "Respuesta preparada", detail: "Respuesta armada con reglas locales de esta demo." },
    ],
  },
  excepcion: {
    id: "excepcion",
    buttonLabel: "Pedir una excepción",
    hint: "El agente reconoce un cambio que no decide solo.",
    input: "Quiero modificar las condiciones del pedido.",
    processing: "Revisando qué puede hacer por su cuenta",
    reply: "Este cambio requiere revisión del equipo. Puedo preparar la solicitud con el contexto disponible.",
    nextLabel: "Preparar solicitud",
    resultTitle: "Borrador preparado",
    resultText: "La solicitud queda lista para que una persona del equipo la revise.",
    trace: [
      { title: "Entrada recibida", detail: "Pedido de cambio de condiciones sobre DEMO-021." },
      { title: "Regla aplicada", detail: "Los cambios de condiciones requieren revisión del equipo." },
      { title: "Borrador preparado", detail: "Borrador local con estado Pendiente de aprobación." },
    ],
  },
};

export const AGENT_SCENARIO_ORDER: readonly AgentScenarioId[] = ["consultar", "excepcion"];

export const AGENT_SOURCE = { label: "Fuente", value: "Registro ficticio DEMO-021" };
export const AGENT_ACTION = { label: "Acción", value: "Consulta de solo lectura" };

export const AGENT_DRAFT = {
  subjectLabel: "Asunto",
  subject: "Cambio solicitado para DEMO-021",
  statusLabel: "Estado",
  status: "Pendiente de aprobación",
  bodyLabel: "Contexto incluido",
  body: "Pedido DEMO-021 del registro ficticio. Entrega sin fecha confirmada. Cambio de condiciones pedido por el usuario de la demo.",
  disclaimer: "No se envió ningún mensaje ni se modificó un pedido real.",
};

export const AGENT_NOT_A_MODEL =
  "Las respuestas de esta demo salen de reglas locales y texto fijo. No provienen de un modelo externo.";

// ---------- 9.4 Integración ----------

export type FlowNodeStatus = "waiting" | "ok" | "temp-fail" | "pending";
export type FlowPhase = "inicial" | "fallo" | "finalizado";

export const FLOW_NODES = [
  { id: "entrada", title: "Entrada de pedido", text: "Llega el evento con los datos del pedido." },
  { id: "validacion", title: "Validación", text: "Se controla que el pedido tenga lo necesario." },
  { id: "sistema", title: "Sistema interno", text: "Se registra el pedido una sola vez." },
  { id: "aviso", title: "Aviso al equipo", text: "Se avisa a quien tiene que seguir el proceso." },
] as const;

export const FLOW_STATUS_LABEL: Record<FlowNodeStatus, string> = {
  waiting: "En espera",
  ok: "Correcto",
  "temp-fail": "Fallo temporal",
  pending: "Pendiente",
};

export const FLOW_EVENT = {
  eventId: "EVT-031",
  orderId: "DEMO-031",
  amount: "120 unidades monetarias",
} as const;

export type FlowLog = { n: number; title: string; detail: string; tone: "ok" | "error" | "info" };

export type FlowState = {
  phase: FlowPhase;
  nodes: FlowNodeStatus[];
  logs: FlowLog[];
  orders: number;
  eventStatus: "Recibido" | "Fallo temporal" | "Finalizado";
  message: string;
};

function withLogs(logs: FlowLog[], extra: Omit<FlowLog, "n">[]): FlowLog[] {
  return [...logs, ...extra.map((e, i) => ({ ...e, n: logs.length + i + 1 }))];
}

export function flowInitial(): FlowState {
  return {
    phase: "inicial",
    nodes: ["ok", "waiting", "waiting", "waiting"],
    logs: [],
    orders: 0,
    eventStatus: "Recibido",
    message: "Evento EVT-031 recibido. Todavía no se ejecutó el flujo.",
  };
}

const LOG_VALIDATION: Omit<FlowLog, "n"> = {
  title: "Validación correcta",
  detail: "EVT-031: el pedido DEMO-031 tiene los datos necesarios. Importe de ejemplo: 120 unidades monetarias.",
  tone: "ok",
};

export function flowRun(s: FlowState): FlowState {
  if (s.phase !== "inicial") return s;
  return {
    phase: "finalizado",
    nodes: ["ok", "ok", "ok", "ok"],
    logs: withLogs(s.logs, [
      LOG_VALIDATION,
      { title: "Alta en sistema interno", detail: "Pedido DEMO-031 registrado una vez, asociado al evento EVT-031.", tone: "ok" },
      { title: "Aviso al equipo completado", detail: "Aviso de ejemplo registrado. No se envió ningún mensaje real.", tone: "ok" },
    ]),
    orders: 1,
    eventStatus: "Finalizado",
    message: "Flujo finalizado. Se registró un pedido y se avisó al equipo.",
  };
}

export function flowFail(s: FlowState): FlowState {
  if (s.phase !== "inicial") return s;
  return {
    phase: "fallo",
    nodes: ["ok", "ok", "temp-fail", "pending"],
    logs: withLogs(s.logs, [
      LOG_VALIDATION,
      {
        title: "Intento 1 fallido",
        detail: "Sistema interno: fallo temporal simulado. El pedido no se registró. Listo para reintentar.",
        tone: "error",
      },
    ]),
    orders: 0,
    eventStatus: "Fallo temporal",
    message: "Fallo temporal en Sistema interno. El aviso quedó pendiente y el evento está listo para reintentar.",
  };
}

export function flowRetry(s: FlowState): FlowState {
  if (s.phase !== "fallo") return s;
  return {
    phase: "finalizado",
    nodes: ["ok", "ok", "ok", "ok"],
    logs: withLogs(s.logs, [
      { title: "Intento 2 correcto", detail: "Pedido DEMO-031 registrado una vez, con el mismo evento EVT-031.", tone: "ok" },
      { title: "Aviso al equipo completado", detail: "Aviso de ejemplo registrado. No se envió ningún mensaje real.", tone: "ok" },
    ]),
    orders: 1,
    eventStatus: "Finalizado",
    message: "Reintento correcto. Se mantuvo el mismo evento y hay un solo registro de pedido.",
  };
}

export const FLOW_REPEAT_MESSAGE = "Evento ya procesado. No se creó un segundo pedido.";

export function flowRepeat(s: FlowState): FlowState {
  if (s.phase !== "finalizado") return s;
  return {
    ...s,
    logs: withLogs(s.logs, [
      { title: "Evento EVT-031 repetido", detail: "Se detectó el mismo identificador de evento y se ignoró.", tone: "info" },
    ]),
    message: FLOW_REPEAT_MESSAGE,
  };
}

export function flowStepIndex(phase: FlowPhase): number {
  return phase === "inicial" ? 0 : phase === "fallo" ? 1 : 2;
}
