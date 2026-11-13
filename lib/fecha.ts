/**
 * Formateo de fechas SIEMPRE en hora Argentina (GMT-3), sin depender de la zona
 * de quien renderiza (navegador del usuario, o el server de Vercel que corre en
 * UTC). Usar estos helpers en vez de `new Date().toLocaleString()` suelto, para
 * que lo que se ve siempre coincida con el reloj de Argentina.
 */

export const TZ_AR = "America/Argentina/Buenos_Aires";

const defDia: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit" };
const defDiaHora: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
};

/** Fecha (por defecto dd/mm) en GMT-3. Acepta ISO string o Date. */
export function fechaAR(input: string | Date, opts: Intl.DateTimeFormatOptions = defDia): string {
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("es-AR", { timeZone: TZ_AR, ...opts }).format(d);
}

/** Fecha + hora (por defecto dd/mm/aa hh:mm) en GMT-3. */
export function fechaHoraAR(input: string | Date, opts: Intl.DateTimeFormatOptions = defDiaHora): string {
  return fechaAR(input, opts);
}
