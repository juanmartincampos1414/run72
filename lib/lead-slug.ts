import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * URL legible para la propuesta del cliente: `/proyecto/emiliano-cocilobo`
 * en vez de un UUID. El slug se guarda una sola vez al crear el lead (estable
 * aunque después cambie el nombre) y se resuelve slug-o-id para no romper links
 * viejos que ya se enviaron con el UUID.
 */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(s: string): boolean {
  return UUID_RE.test(s);
}

/** "Emiliano Cocilobo" -> "emiliano-cocilobo" (sin tildes, seguro para URL). */
export function slugify(input: string): string {
  return (input || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // saca tildes/diacríticos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Genera un slug ÚNICO para un lead nuevo. Si "emiliano-cocilobo" ya existe,
 * prueba "-2", "-3"… Resiliente: si la columna slug todavía no existe (pre
 * migración), devuelve el base igual (termina en `extra` y se descarta solo).
 */
export async function uniqueLeadSlug(
  supabase: SupabaseClient,
  name: string | null | undefined,
  fallback?: string | null,
): Promise<string> {
  const base =
    slugify(name || "") || slugify((fallback || "").split("@")[0]) || "cliente";
  let candidate = base;
  for (let n = 2; n <= 60; n++) {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("id")
        .eq("slug", candidate)
        .maybeSingle();
      if (error) return base; // columna inexistente u otro error: no bloqueamos la creación
      if (!data) return candidate;
    } catch {
      return base;
    }
    candidate = `${base}-${n}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/**
 * Resuelve un "handle" de la URL (slug o UUID) al lead real.
 * Devuelve la fila seleccionada con `columns`, o null.
 */
export async function findLeadByHandle(
  supabase: SupabaseClient,
  handle: string,
  columns = "*",
): Promise<Record<string, unknown> | null> {
  const h = (handle || "").trim();
  if (!h) return null;
  // UUID => link viejo: match directo por id.
  if (isUuid(h)) {
    const { data } = await supabase
      .from("leads")
      .select(columns)
      .eq("id", h)
      .maybeSingle();
    return (data as unknown as Record<string, unknown>) ?? null;
  }
  // Slug legible (lo normal).
  const { data } = await supabase
    .from("leads")
    .select(columns)
    .eq("slug", h)
    .maybeSingle();
  return (data as unknown as Record<string, unknown>) ?? null;
}
