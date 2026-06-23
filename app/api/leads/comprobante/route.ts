import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { logEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

const BUCKET = "lead-files";
const MAX = 20 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "application/pdf"];

/** Recibe el comprobante de transferencia, lo asocia al lead y marca "Comprobante recibido". */
export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 503 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Form inválido." }, { status: 400 });

  const leadId = String(form.get("leadId") ?? "");
  const file = form.get("file");
  if (!leadId) return NextResponse.json({ error: "Falta leadId." }, { status: 400 });
  if (!(file instanceof File)) return NextResponse.json({ error: "Falta el archivo." }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: "Archivo demasiado grande (máx 20MB)." }, { status: 400 });
  if (file.type && !ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Formato no permitido (JPG, PNG o PDF)." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: lead } = await supabase.from("leads").select("id").eq("id", leadId).maybeSingle();
  if (!lead) return NextResponse.json({ error: "Lead no encontrado." }, { status: 404 });

  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
  const path = `comprobantes/${crypto.randomUUID()}-${safe}`;
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || "application/octet-stream", upsert: false });
  if (upErr) return NextResponse.json({ error: "No se pudo subir el archivo." }, { status: 502 });

  const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

  const { error: updErr } = await supabase
    .from("leads")
    .update({
      comprobante_url: url,
      comprobante_name: file.name,
      comprobante_uploaded_at: new Date().toISOString(),
      comprobante_status: "recibido",
      status: "comprobante_recibido",
    })
    .eq("id", leadId);

  if (updErr) {
    return NextResponse.json(
      { error: "La carga de comprobantes aún no está habilitada (falta migración)." },
      { status: 503 },
    );
  }

  await logEvent(supabase, "comprobante_uploaded", leadId, { name: file.name });

  return NextResponse.json({ ok: true, url });
}
