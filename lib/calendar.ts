// Lectura de Google Calendar con un Service Account (solo lectura).
// Sin dependencias externas: firma el JWT con node:crypto y pide el access token.
//
// Variables de entorno (Vercel, protegidas):
//   GOOGLE_SERVICE_ACCOUNT_JSON  → el JSON completo de la clave del service account
//   GOOGLE_CALENDAR_ID           → id del calendario (normalmente tu email de Google)
//
// El service account necesita permiso de lectura: compartí el calendario con su
// email (xxx@yyy.iam.gserviceaccount.com) con "Ver todos los detalles del evento".

import crypto from "node:crypto";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/calendar.readonly";

type ServiceAccount = { client_email: string; private_key: string };

function cuenta(): ServiceAccount {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("Falta GOOGLE_SERVICE_ACCOUNT_JSON");
  const j = JSON.parse(raw) as ServiceAccount;
  if (!j.client_email || !j.private_key) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON incompleto");
  // Las claves copiadas a env suelen traer los saltos de línea escapados.
  j.private_key = j.private_key.replace(/\\n/g, "\n");
  return j;
}

export function calendarConfigurado(): boolean {
  return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON && process.env.GOOGLE_CALENDAR_ID);
}

const base64url = (b: Buffer | string) =>
  Buffer.from(b).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

async function accessToken(): Promise<string> {
  const sa = cuenta();
  const iat = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({ iss: sa.client_email, scope: SCOPE, aud: TOKEN_URL, iat, exp: iat + 3600 }),
  );
  const firma = base64url(crypto.createSign("RSA-SHA256").update(`${header}.${claims}`).sign(sa.private_key));
  const jwt = `${header}.${claims}.${firma}`;

  const r = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const j = (await r.json().catch(() => ({}))) as { access_token?: string; error_description?: string };
  if (!r.ok || !j.access_token) throw new Error(`Google no dio token: ${j.error_description || r.status}`);
  return j.access_token;
}

export type CalendarEvent = {
  id: string;
  status?: string;
  summary?: string;
  description?: string;
  location?: string;
  created?: string;
  updated?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  attendees?: { email?: string; displayName?: string; comment?: string }[];
};

async function listar(params: Record<string, string>): Promise<CalendarEvent[]> {
  const token = await accessToken();
  const calId = encodeURIComponent(process.env.GOOGLE_CALENDAR_ID as string);
  const qs = new URLSearchParams({ singleEvents: "true", maxResults: "250", ...params });
  const r = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calId}/events?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const j = (await r.json().catch(() => ({}))) as { items?: CalendarEvent[]; error?: { message?: string } };
  if (!r.ok || j.error) throw new Error(`Google Calendar: ${j.error?.message || r.status}`);
  return (j.items ?? []).filter((e) => e.status !== "cancelled");
}

/** Eventos cuyo inicio cae entre dos instantes. Para el recordatorio "30 min antes". */
export async function eventosEntre(desde: Date, hasta: Date): Promise<CalendarEvent[]> {
  return listar({ timeMin: desde.toISOString(), timeMax: hasta.toISOString(), orderBy: "startTime" });
}

/**
 * Eventos creados/actualizados desde un instante (para detectar reservas nuevas).
 * Mira hasta `mesesAdelante` hacia adelante por si la meet se agenda con mucha anticipación.
 */
export async function eventosNuevosDesde(desde: Date, mesesAdelante = 6): Promise<CalendarEvent[]> {
  const hasta = new Date();
  hasta.setMonth(hasta.getMonth() + mesesAdelante);
  return listar({ updatedMin: desde.toISOString(), timeMax: hasta.toISOString(), orderBy: "updated" });
}

export function creacionDelEvento(ev: CalendarEvent): Date | null {
  if (!ev.created) return null;
  const d = new Date(ev.created);
  return Number.isNaN(d.getTime()) ? null : d;
}

function textoDelEvento(ev: CalendarEvent): string {
  return [
    ev.description,
    ev.location,
    ev.summary,
    ...(ev.attendees?.map((a) => a.comment) ?? []),
    ...(ev.attendees?.map((a) => a.displayName) ?? []),
  ]
    .filter(Boolean)
    .join("\n");
}

const NUMERO = /\+?\d[\d\s().-]{7,16}\d/;
const esPlausible = (s: string) => {
  const d = s.replace(/[^\d]/g, "");
  return d.length >= 8 && d.length <= 15;
};

/**
 * Busca el teléfono del invitado dentro del evento.
 * Prioriza la línea etiquetada ("Numero de WhatsApp: +54 ..."), como la deja Centrilize;
 * si no hay etiqueta, cae a cualquier número plausible del texto.
 */
export function telefonoDelEvento(ev: CalendarEvent): string | null {
  const texto = textoDelEvento(ev);
  const etiquetado = texto.match(
    /(?:whatsapp|whats\s*app|tel[eé]fono|celular|cel)\s*[:：]?\s*(\+?\d[\d\s().-]{7,16}\d)/i,
  );
  if (etiquetado && esPlausible(etiquetado[1])) return etiquetado[1];
  const m = texto.match(NUMERO);
  if (m && esPlausible(m[0])) return m[0];
  return null;
}

/** Nombre del invitado: etiqueta "Invitado: ...", luego invitado del evento, luego el resumen. */
export function nombreDelEvento(ev: CalendarEvent): string {
  const m = (ev.description || "").match(/invitad[oa]\s*[:：]\s*(.+)/i);
  if (m) return m[1].trim().split(/\s+/)[0];
  const inv = ev.attendees?.find((a) => a.displayName)?.displayName;
  return (inv || ev.summary || "").trim().split(/\s+/)[0] || "Hola";
}

export function inicioDelEvento(ev: CalendarEvent): Date | null {
  const iso = ev.start?.dateTime || ev.start?.date;
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}
