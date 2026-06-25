/**
 * RUN72 Business Hub — definición del checklist maestro y scoring.
 * Las áreas y los ítems son la plantilla; el ESTADO por usuario vive en la DB
 * (tabla hub_checklist). El score se computa server/client desde esos estados.
 */

/** Precio de la suscripción mensual al Business Hub (ARS). */
export const HUB_PRICE_ARS = 25000;

/** Carpetas del Centro de Documentos. */
export const HUB_FOLDERS = ["Contratos", "Facturas", "Marca", "Legal", "Impuestos", "General"] as const;

/** Extensiones permitidas para documentos del Hub. */
export const HUB_DOC_EXT = ["pdf", "doc", "docx", "xls", "xlsx", "png", "jpg", "jpeg"] as const;

export type HubStatus = "pendiente" | "en_proceso" | "completado" | "no_aplica";

export const STATUS_LABEL: Record<HubStatus, string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  completado: "Completado",
  no_aplica: "No aplica",
};

export const STATUS_ORDER: HubStatus[] = ["pendiente", "en_proceso", "completado", "no_aplica"];

export type HubItem = { key: string; label: string };
export type HubArea = { key: string; label: string; icon: string; items: HubItem[] };

/** Construye los ítems con clave compuesta "area:slug". */
function area(key: string, label: string, icon: string, items: [string, string][]): HubArea {
  return { key, label, icon, items: items.map(([slug, l]) => ({ key: `${key}:${slug}`, label: l })) };
}

export const HUB_AREAS: HubArea[] = [
  area("marca", "Marca", "🎨", [
    ["logo", "Logo"],
    ["manual", "Manual de Marca"],
    ["paleta", "Paleta de Colores"],
    ["tipografias", "Tipografías"],
    ["fotos", "Fotos Institucionales"],
    ["instagram", "Perfil de Instagram"],
    ["linkedin", "Perfil de LinkedIn"],
    ["google-business", "Google Business"],
  ]),
  area("legal", "Legal", "⚖️", [
    ["terminos", "Términos y Condiciones"],
    ["privacidad", "Política de Privacidad"],
    ["aviso-legal", "Aviso Legal"],
    ["contratos", "Contratos Comerciales"],
    ["nda", "NDA"],
    ["registro-marca", "Registro de Marca"],
    ["dominio", "Dominio Registrado"],
  ]),
  area("societaria", "Societaria", "🏛️", [
    ["monotributo", "Monotributo"],
    ["responsable-inscripto", "Responsable Inscripto"],
    ["sas", "SAS"],
    ["srl", "SRL"],
    ["cuenta-empresarial", "Cuenta Bancaria Empresarial"],
  ]),
  area("fiscal", "Fiscal", "🧾", [
    ["facturacion", "Facturación Configurada"],
    ["afip", "AFIP Configurada"],
    ["certificados", "Certificados Vigentes"],
    ["contador", "Contador Asignado"],
  ]),
  area("cobros", "Cobros", "💳", [
    ["mercadopago", "Mercado Pago"],
    ["links-pago", "Links de Pago"],
    ["transferencias", "Transferencias"],
    ["pasarela-internacional", "Pasarela Internacional"],
    ["suscripciones", "Suscripciones Configuradas"],
  ]),
  area("marketing", "Marketing", "📣", [
    ["meta-ads", "Meta Ads"],
    ["google-ads", "Google Ads"],
    ["pixel", "Pixel Instalado"],
    ["analytics", "Google Analytics"],
    ["search-console", "Google Search Console"],
    ["email-marketing", "Email Marketing"],
  ]),
  area("ventas", "Ventas", "📈", [
    ["crm", "CRM"],
    ["embudo", "Embudo Comercial"],
    ["whatsapp-business", "WhatsApp Business"],
    ["automatizaciones", "Automatizaciones"],
    ["seguimiento-leads", "Seguimiento de Leads"],
  ]),
  area("tecnologica", "Infraestructura Digital", "🖥️", [
    ["dominio", "Dominio"],
    ["hosting", "Hosting"],
    ["ssl", "SSL"],
    ["correo", "Correo Corporativo"],
    ["backups", "Backups"],
    ["sitio-web", "Sitio Web"],
    ["automatizaciones-ia", "Automatizaciones IA"],
  ]),
  area("seguridad", "Seguridad", "🔒", [
    ["2fa", "2FA Activado"],
    ["backups-verificados", "Backups Verificados"],
    ["usuarios-revisados", "Usuarios Revisados"],
    ["contrasenas", "Contraseñas Actualizadas"],
  ]),
];

export const TOTAL_ITEMS = HUB_AREAS.reduce((n, a) => n + a.items.length, 0);

const WEIGHT: Record<HubStatus, number> = {
  completado: 1,
  en_proceso: 0.5,
  pendiente: 0,
  no_aplica: 0,
};

export type Level = "green" | "yellow" | "red";

export function levelOf(pct: number): Level {
  if (pct >= 80) return "green";
  if (pct >= 40) return "yellow";
  return "red";
}

export const LEVEL_META: Record<Level, { dot: string; label: string; text: string; bar: string }> = {
  green: { dot: "🟢", label: "Excelente", text: "text-emerald-400", bar: "from-emerald-400 to-emerald-500" },
  yellow: { dot: "🟡", label: "Pendiente", text: "text-amber-300", bar: "from-amber-300 to-amber-400" },
  red: { dot: "🔴", label: "Crítico", text: "text-red-400", bar: "from-red-400 to-red-500" },
};

export type AreaProgress = {
  pct: number;
  done: number; // completados
  applicable: number; // total - no_aplica
  total: number;
  pendientes: number; // pendiente + en_proceso
  level: Level;
};

export function areaProgress(a: HubArea, statuses: Record<string, HubStatus>): AreaProgress {
  let sum = 0;
  let applicable = 0;
  let done = 0;
  let pendientes = 0;
  for (const item of a.items) {
    const st = statuses[item.key] ?? "pendiente";
    if (st === "no_aplica") continue;
    applicable += 1;
    sum += WEIGHT[st];
    if (st === "completado") done += 1;
    else pendientes += 1;
  }
  const pct = applicable === 0 ? 100 : Math.round((sum / applicable) * 100);
  return { pct, done, applicable, total: a.items.length, pendientes, level: levelOf(pct) };
}

/** Score general 0-100 ponderando todos los ítems aplicables. */
export function overallScore(statuses: Record<string, HubStatus>): number {
  let sum = 0;
  let applicable = 0;
  for (const a of HUB_AREAS) {
    for (const item of a.items) {
      const st = statuses[item.key] ?? "pendiente";
      if (st === "no_aplica") continue;
      applicable += 1;
      sum += WEIGHT[st];
    }
  }
  return applicable === 0 ? 0 : Math.round((sum / applicable) * 100);
}
