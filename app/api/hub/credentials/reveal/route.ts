import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { requireActiveHub } from "@/lib/hub-guard";
import { decrypt, vaultReady } from "@/lib/crypto";
import { logEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * Revela una credencial descifrada. Capa de seguridad extra: exige reingreso de
 * la contraseña de la cuenta (re-login) y registra el acceso en la auditoría.
 */
export async function POST(req: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "No configurado." }, { status: 503 });
  if (!vaultReady()) return NextResponse.json({ error: "Bóveda no configurada." }, { status: 503 });

  const auth = await requireActiveHub();
  if ("response" in auth) return auth.response;
  const user = auth.user;
  if (!user.email) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const b = await req.json().catch(() => ({}));
  const id = String(b.id ?? "");
  const password = String(b.password ?? "");
  if (!id || !password) return NextResponse.json({ error: "Faltan datos." }, { status: 400 });

  // Re-login en un cliente aislado (no toca la sesión actual).
  const verifier = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
  const { error: authErr } = await verifier.auth.signInWithPassword({ email: user.email, password });
  if (authErr) {
    await logEvent(getSupabaseAdmin(), "hub_credential_reveal_denied", null, { user_id: user.id, id });
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 403 });
  }

  const admin = getSupabaseAdmin();
  const { data: row } = await admin
    .from("hub_credentials")
    .select("id, user_id, password_enc, notes_enc")
    .eq("id", id)
    .maybeSingle();
  if (!row || row.user_id !== user.id) return NextResponse.json({ error: "No encontrado." }, { status: 404 });

  await logEvent(admin, "hub_credential_viewed", null, { user_id: user.id, id });
  return NextResponse.json({
    password: decrypt(row.password_enc),
    notes: decrypt(row.notes_enc),
  });
}
