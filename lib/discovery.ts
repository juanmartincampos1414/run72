// Guía de descubrimiento para la primera meet. Se muestra dentro de la ficha del
// lead (/admin/leads/[id]); las respuestas se guardan en la columna `discovery` (jsonb).

export type DiscoveryQuestion = { id: string; section: string; q: string };

export const DISCOVERY_QUESTIONS: DiscoveryQuestion[] = [
  // 1. Contexto del negocio
  { id: "ctx_rubro", section: "Contexto del negocio", q: "¿A qué se dedican y hace cuánto operan?" },
  { id: "ctx_tamano", section: "Contexto del negocio", q: "Tamaño (empleados, clientes, facturación/etapa)" },
  { id: "ctx_decisor", section: "Contexto del negocio", q: "¿Quién decide la inversión y quién va a usar la solución?" },

  // 2. El problema
  { id: "prob_cual", section: "El problema (por qué ahora)", q: "¿Qué problema puntual quieren resolver?" },
  { id: "prob_ahora", section: "El problema (por qué ahora)", q: "¿Por qué ahora? ¿Qué pasa si no lo resuelven?" },
  { id: "prob_intentos", section: "El problema (por qué ahora)", q: "¿Ya intentaron resolverlo? ¿Con qué y por qué no alcanzó?" },

  // 3. Proceso actual
  { id: "proc_hoy", section: "Proceso actual (clave)", q: "¿Cómo es el proceso hoy, paso a paso (quién hace qué)?" },
  { id: "proc_herramientas", section: "Proceso actual (clave)", q: "¿Qué herramientas usan hoy (planillas, WhatsApp, CRM, ERP…)?" },
  { id: "proc_cuellos", section: "Proceso actual (clave)", q: "¿Dónde se traba / demora / falla?" },
  { id: "proc_volumen", section: "Proceso actual (clave)", q: "Volumen (casos/día, pedidos, operaciones)" },
  { id: "proc_costo", section: "Proceso actual (clave)", q: "¿Cuánto tiempo/plata consume hoy? (para el ROI)" },
  { id: "proc_manual", section: "Proceso actual (clave)", q: "¿Qué es repetitivo/manual vs. qué necesita criterio humano?" },

  // 4. Solución imaginada
  { id: "sol_ideal", section: "Solución imaginada (MVP)", q: "¿Cómo se imaginan la solución ideal?" },
  { id: "sol_mvp", section: "Solución imaginada (MVP)", q: "Imprescindible para la v1 vs. deseable (después)" },
  { id: "sol_tipo", section: "Solución imaginada (MVP)", q: "¿Software a medida, automatización, IA o mezcla? ¿Web / app / interno?" },
  { id: "sol_no", section: "Solución imaginada (MVP)", q: "¿Algo que explícitamente NO quieren?" },

  // 5. Datos y sistemas
  { id: "dat_datos", section: "Datos y sistemas", q: "¿Qué datos manejan y dónde viven hoy? ¿Calidad?" },
  { id: "dat_integr", section: "Datos y sistemas", q: "¿Con qué sistemas debe integrarse? (pagos, facturación, WhatsApp, APIs…)" },
  { id: "dat_sensible", section: "Datos y sistemas", q: "¿Datos sensibles / regulación? (salud, datos personales, legal)" },
  { id: "dat_equipo", section: "Datos y sistemas", q: "¿Tienen equipo técnico interno?" },

  // 6. Objetivos y éxito
  { id: "obj_exito", section: "Objetivos y éxito", q: "Si sale perfecto, ¿qué cambia en 3-6 meses?" },
  { id: "obj_resultado", section: "Objetivos y éxito", q: "Resultado concreto esperado (horas, % de cierre, menos errores…)" },
  { id: "obj_medir", section: "Objetivos y éxito", q: "¿Cómo lo van a medir?" },

  // 7. Gente y adopción
  { id: "gen_uso", section: "Gente y adopción", q: "¿Quién lo usa día a día? ¿Hay resistencia al cambio?" },
  { id: "gen_owner", section: "Gente y adopción", q: "Referente/owner del proyecto de su lado" },

  // 8. Tiempos, presupuesto y decisión
  { id: "dec_cuando", section: "Tiempos, presupuesto y decisión", q: "¿Para cuándo lo necesitan? ¿Deadline o evento gatillo?" },
  { id: "dec_presupuesto", section: "Tiempos, presupuesto y decisión", q: "Presupuesto que tienen en mente (rango)" },
  { id: "dec_decision", section: "Tiempos, presupuesto y decisión", q: "¿Cómo deciden? ¿Quién firma? ¿Qué necesitan para avanzar?" },
  { id: "dec_modalidad", section: "Tiempos, presupuesto y decisión", q: "¿MVP e iterar o todo de una? ¿Cerrado / por fases / mantenimiento?" },

  // 9. Riesgos y expectativas
  { id: "rie_preocupa", section: "Riesgos y expectativas", q: "¿Qué les preocupa / qué podría hacer fracasar esto?" },
  { id: "rie_partner", section: "Riesgos y expectativas", q: "Malas experiencias previas / qué valoran de un partner" },

  // 10. Próximo paso
  { id: "next_paso", section: "Próximo paso", q: "Próximo paso acordado (con fecha)" },
];

export const DISCOVERY_SECTIONS: string[] = DISCOVERY_QUESTIONS.reduce<string[]>((acc, q) => {
  if (!acc.includes(q.section)) acc.push(q.section);
  return acc;
}, []);
