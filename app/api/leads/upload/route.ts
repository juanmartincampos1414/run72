import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import type { LeadFile } from "@/lib/types";

export const dynamic = "force-dynamic";

const BUCKET = "lead-files";
const MAX = 20 * 1024 * 1024; // 20 MB

/** Sube archivos adjuntos del cotizador al bucket y devuelve sus URLs públicas. */
export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 503 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Form inválido." }, { status: 400 });

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) return NextResponse.json({ files: [] });

  const supabase = getSupabaseAdmin();
  const uploaded: LeadFile[] = [];

  for (const file of files.slice(0, 10)) {
    if (file.size > MAX) continue;
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
    const path = `${crypto.randomUUID()}-${safe}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    if (error) continue;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    uploaded.push({ name: file.name, url: data.publicUrl, type: file.type });
  }

  return NextResponse.json({ files: uploaded });
}
