import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

/** Devuelve el usuario admin autenticado, o null. */
export async function getAdminUser() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Para route handlers: corta con 401 si no hay sesión.
 * Devuelve { user } o { response } (la respuesta de error).
 */
export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) {
    return { response: NextResponse.json({ error: "No autorizado." }, { status: 401 }) };
  }
  return { user };
}
