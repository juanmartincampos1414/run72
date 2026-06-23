import type { Lead } from "./types";

export type DeliveryDoc = {
  resumen: string;
  tecnologias: string;
  dominio: string;
  hosting: string;
  correos: string;
  redes: string;
  herramientas: string;
  integraciones: string;
  credenciales: string;
  configuraciones: string;
  recomendaciones: string;
};

export const DELIVERY_FIELDS: { key: keyof DeliveryDoc; label: string; hint?: string }[] = [
  { key: "resumen", label: "Resumen del proyecto" },
  { key: "tecnologias", label: "Tecnologías utilizadas" },
  { key: "dominio", label: "Dominio" },
  { key: "hosting", label: "Hosting" },
  { key: "correos", label: "Correos" },
  { key: "redes", label: "Redes sociales" },
  { key: "herramientas", label: "Herramientas conectadas" },
  { key: "integraciones", label: "Integraciones" },
  { key: "credenciales", label: "Credenciales entregadas" },
  { key: "configuraciones", label: "Configuraciones realizadas" },
  { key: "recomendaciones", label: "Recomendaciones futuras" },
];

const EMPTY: DeliveryDoc = {
  resumen: "",
  tecnologias: "",
  dominio: "",
  hosting: "",
  correos: "",
  redes: "",
  herramientas: "",
  integraciones: "",
  credenciales: "",
  configuraciones: "",
  recomendaciones: "",
};

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Pre-llena el documento con lo que ya sabemos del lead. */
export function buildDeliveryDoc(lead: Lead): DeliveryDoc {
  const intake: any = lead.intake ?? {};
  const infra = intake.infra ?? {};
  const social = intake.social ?? {};

  const redes = Object.entries(social)
    .filter(([, v]: any) => v?.active)
    .map(([name, v]: any) => `${name}: ${v.url || v.user || "—"}`)
    .join("\n");

  const integraciones = [
    ...(intake.functionalities ?? []),
    ...(intake.customFunctionalities ?? []),
    ...((lead.microservices_selected ?? []).map((m) => m.name)),
  ].join(", ");

  const resumen = [
    lead.project_label ? `Proyecto: ${lead.project_label}.` : "",
    lead.objective ? `Objetivo: ${lead.objective}.` : "",
    intake.comments ? `Notas: ${intake.comments}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    ...EMPTY,
    resumen,
    dominio: infra.domainName
      ? `${infra.domainName}${infra.domainProvider ? ` (${infra.domainProvider})` : ""}`
      : "",
    hosting: infra.hostingProvider
      ? `${infra.hostingProvider}${infra.hostingType ? ` · ${infra.hostingType}` : ""}`
      : "",
    correos: infra.emailProvider
      ? `${infra.emailProvider}${infra.emailAccounts ? ` · ${infra.emailAccounts} cuentas` : ""}`
      : "",
    redes,
    integraciones,
  };
}

/** Combina el doc guardado con los defaults pre-llenados (el guardado tiene prioridad). */
export function resolveDeliveryDoc(lead: Lead): DeliveryDoc {
  const saved = (lead.delivery_doc ?? {}) as Partial<DeliveryDoc>;
  const base = buildDeliveryDoc(lead);
  const out = { ...base };
  for (const k of Object.keys(EMPTY) as (keyof DeliveryDoc)[]) {
    if (saved[k] && String(saved[k]).trim()) out[k] = saved[k] as string;
  }
  return out;
}
