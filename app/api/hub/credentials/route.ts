import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { encrypt, vaultReady } from "@/lib/crypto";
import { logEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

async function currentUser() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Lista las credenciales del usuario SIN datos sensibles descifrados. */
export async function GET() {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "No configurado." }, { status: 503 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { data } = await getSupabaseAdmin()
    .from("hub_credentials")
    .select("id, service_name, username, email, url, password_enc, notes_enc, updated_at")
    .eq("user_id", user.id)
    .order("service_name", { ascending: true });

  const items = (data ?? []).map((c) => ({
    id: c.id,
    service_name: c.service_name,
    username: c.username,
    email: c.email,
    url: c.url,
    updated_at: c.updated_at,
    hasPassword: Boolean(c.password_enc),
    hasNotes: Boolean(c.notes_enc),
  }));
  return NextResponse.json({ credentials: items, vaultReady: vaultReady() });
}

/** Crea una credencial (cifra password y notas). */
export async function POST(req: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "No configurado." }, { status: 503 });
  if (!vaultReady()) return NextResponse.json({ error: "La bóveda no está configurada (falta HUB_VAULT_KEY)." }, { status: 503 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const b = await req.json().catch(() => ({}));
  if (!b.service_name?.trim()) return NextResponse.json({ error: "El nombre del servicio es obligatorio." }, { status: 400 });

  const admin = getSupabaseAdmin();
  const { error } = await admin.from("hub_credentials").insert({
    user_id: user.id,
    service_name: b.service_name.trim(),
    username: b.username?.trim() || null,
    email: b.email?.trim() || null,
    url: b.url?.trim() || null,
    password_enc: b.password ? encrypt(String(b.password)) : null,
    notes_enc: b.notes ? encrypt(String(b.notes)) : null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await logEvent(admin, "hub_credential_created", null, { user_id: user.id, service: b.service_name.trim() });
  return NextResponse.json({ ok: true });
}

/** Elimina una credencial del usuario. */
export async function DELETE(req: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "No configurado." }, { status: 503 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta id." }, { status: 400 });

  const admin = getSupabaseAdmin();
  const { data: row } = await admin.from("hub_credentials").select("id, user_id").eq("id", id).maybeSingle();
  if (!row || row.user_id !== user.id) return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  await admin.from("hub_credentials").delete().eq("id", id);
  await logEvent(admin, "hub_credential_deleted", null, { user_id: user.id, id });
  return NextResponse.json({ ok: true });
}
