import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

/**
 * Allowlist de emails con acceso al admin. Configurable con `ADMIN_EMAILS`
 * (separados por coma). Default: el admin conocido de RUN72.
 * Pura (sin deps de server) para poder usarse también en el middleware edge.
 */
export function adminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS;
  const list = raw
    ? raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)
    : ["hola@run72.app"];
  return list;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}

/** Devuelve el usuario admin autenticado (y en la allowlist), o null. */
export async function getAdminUser() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}

/**
 * Para route handlers: corta con 401 si no hay sesión admin válida.
 * Devuelve { user } o { response } (la respuesta de error).
 */
export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) {
    return { response: NextResponse.json({ error: "No autorizado." }, { status: 401 }) };
  }
  return { user };
}
