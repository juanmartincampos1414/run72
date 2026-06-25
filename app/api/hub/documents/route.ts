import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { requireActiveHub } from "@/lib/hub-guard";
import { BUCKET, signMany, extractPath } from "@/lib/storage";
import { HUB_FOLDERS, HUB_DOC_EXT } from "@/lib/hub";

export const dynamic = "force-dynamic";

const MAX = 20 * 1024 * 1024; // 20 MB
const ALLOWED = new Set<string>(HUB_DOC_EXT);
const FOLDERS = new Set<string>(HUB_FOLDERS);

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

/** Lista los documentos del usuario con signed URLs. */
export async function GET() {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "No configurado." }, { status: 503 });
  const auth = await requireActiveHub();
  if ("response" in auth) return auth.response;
  const user = auth.user;

  const { data } = await getSupabaseAdmin()
    .from("hub_documents")
    .select("id, name, path, type, size, folder, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const docs = data ?? [];
  const signed = await signMany(docs.map((d) => d.path));
  const out = docs.map((d) => ({ ...d, url: signed.get(extractPath(d.path) ?? "") ?? null }));
  return NextResponse.json({ documents: out });
}

/** Sube un documento al bucket privado (prefijo hub/{userId}/) y guarda metadatos. */
export async function POST(req: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "No configurado." }, { status: 503 });
  const auth = await requireActiveHub();
  if ("response" in auth) return auth.response;
  const user = auth.user;

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Form inválido." }, { status: 400 });

  const file = form.get("file");
  const folder = String(form.get("folder") ?? "General");
  if (!(file instanceof File)) return NextResponse.json({ error: "Falta el archivo." }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: "Archivo demasiado grande (máx 20MB)." }, { status: 400 });
  if (!ALLOWED.has(extOf(file.name))) {
    return NextResponse.json({ error: "Formato no permitido (PDF, DOCX, XLSX, PNG, JPG)." }, { status: 400 });
  }
  const safeFolder = FOLDERS.has(folder) ? folder : "General";

  const admin = getSupabaseAdmin();
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
  const path = `hub/${user.id}/${crypto.randomUUID()}-${safe}`;
  const { error: upErr } = await admin.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || "application/octet-stream", upsert: false });
  if (upErr) return NextResponse.json({ error: "No se pudo subir el archivo." }, { status: 502 });

  const { error } = await admin.from("hub_documents").insert({
    user_id: user.id,
    name: file.name,
    path,
    type: file.type || null,
    size: file.size,
    folder: safeFolder,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

/** Elimina un documento del usuario (storage + metadatos). */
export async function DELETE(req: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "No configurado." }, { status: 503 });
  const auth = await requireActiveHub();
  if ("response" in auth) return auth.response;
  const user = auth.user;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta id." }, { status: 400 });

  const admin = getSupabaseAdmin();
  const { data: doc } = await admin
    .from("hub_documents")
    .select("id, path, user_id")
    .eq("id", id)
    .maybeSingle();
  if (!doc || doc.user_id !== user.id) {
    return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  }

  await admin.storage.from(BUCKET).remove([doc.path]);
  await admin.from("hub_documents").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
