import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { logEvent } from "@/lib/audit";

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

async function logAdminDenied(email: string | null, reason: string) {
  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0].trim() ?? h.get("x-real-ip") ?? "unknown";
    await logEvent(getSupabaseAdmin(), "admin_access_denied", null, {
      ip,
      endpoint: h.get("x-invoke-path") ?? h.get("referer") ?? "admin-api",
      reason,
      email,
    });
    console.warn(`[admin] acceso rechazado (${reason}) ip=${ip} email=${email ?? "—"}`);
  } catch {
    /* logging best-effort */
  }
}

/**
 * Para route handlers: corta con 401 si no hay sesión admin válida.
 * Registra el intento rechazado y devuelve { user } o { response }.
 */
export async function requireAdmin() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    await logAdminDenied(user?.email ?? null, user ? "not_allowlisted" : "no_session");
    return { response: NextResponse.json({ error: "No autorizado." }, { status: 401 }) };
  }
  return { user };
}
