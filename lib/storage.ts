import { getSupabaseAdmin } from "./supabase/admin";

/**
 * Helpers de Storage para el bucket privado `lead-files`.
 * Guardamos el PATH del objeto en la DB y generamos signed URLs temporales
 * al momento de mostrarlos en el admin. Compatible hacia atrás: si una fila
 * vieja guardó la URL pública completa, igual extraemos el path y la firmamos.
 */

export const BUCKET = "lead-files";
const DEFAULT_TTL = 60 * 60; // 1 hora

/** Extrae el path del objeto dentro del bucket, sea un path ya guardado o una URL pública/firmada. */
export function extractPath(stored: string | null | undefined): string | null {
  if (!stored) return null;
  const marker = `/${BUCKET}/`;
  const idx = stored.indexOf(marker);
  if (idx === -1) return stored.split("?")[0]; // ya es un path
  return stored.slice(idx + marker.length).split("?")[0];
}

/** Firma un único path (o URL legacy). Devuelve el original si falla. */
export async function signOne(
  stored: string | null | undefined,
  ttl = DEFAULT_TTL,
): Promise<string | null> {
  if (!stored) return null;
  const path = extractPath(stored);
  if (!path) return stored;
  try {
    const { data } = await getSupabaseAdmin().storage.from(BUCKET).createSignedUrl(path, ttl);
    return data?.signedUrl ?? stored;
  } catch {
    return stored;
  }
}

/** Firma varios paths en una sola llamada (batch). Devuelve un Map path→signedUrl. */
export async function signMany(
  stored: Array<string | null | undefined>,
  ttl = DEFAULT_TTL,
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const paths = Array.from(
    new Set(stored.map((s) => extractPath(s)).filter((p): p is string => Boolean(p))),
  );
  if (paths.length === 0) return out;
  try {
    const { data } = await getSupabaseAdmin().storage.from(BUCKET).createSignedUrls(paths, ttl);
    for (const item of data ?? []) {
      if (item.path && item.signedUrl) out.set(item.path, item.signedUrl);
    }
  } catch {
    /* si falla, devolvemos el map vacío y el caller usa el valor original */
  }
  return out;
}
