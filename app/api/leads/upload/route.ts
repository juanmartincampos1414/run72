import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { enforceRateLimit, clientIp } from "@/lib/rate-limit";
import { logEvent } from "@/lib/audit";
import { BUCKET, signOne } from "@/lib/storage";
import type { LeadFile } from "@/lib/types";

export const dynamic = "force-dynamic";

const MAX = 20 * 1024 * 1024; // 20 MB

/** Extensiones permitidas (en paridad con el `accept` del cotizador). Validamos por
 *  extensión —no por MIME— porque archivos como .fig llegan con type "" / octet-stream.
 *  Nunca permitimos HTML/SVG/JS/ejecutables: un archivo servido desde Storage con ese
 *  content-type podría ejecutar scripts (XSS / phishing). */
const ALLOWED_EXT = new Set([
  "pdf", "doc", "docx", "png", "jpg", "jpeg", "webp", "gif",
  "txt", "fig", "ppt", "pptx", "xls", "xlsx",
]);

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

/** Sube archivos adjuntos del cotizador al bucket privado y devuelve signed URLs + path. */
export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 503 });
  }

  const supabase = getSupabaseAdmin();

  const limited = await enforceRateLimit({ req, supabase, endpoint: "/api/leads/upload", limit: 20 });
  if (limited) return limited;

  const ip = clientIp(req);
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Form inválido." }, { status: 400 });

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) return NextResponse.json({ files: [] });

  const uploaded: LeadFile[] = [];

  for (const file of files.slice(0, 10)) {
    if (file.size > MAX) {
      await logEvent(supabase, "upload_rejected", null, {
        ip, endpoint: "/api/leads/upload", reason: "too_large", name: file.name, size: file.size,
      });
      continue;
    }
    if (!ALLOWED_EXT.has(extOf(file.name))) {
      await logEvent(supabase, "upload_rejected", null, {
        ip, endpoint: "/api/leads/upload", reason: "ext_not_allowed", name: file.name,
      });
      continue;
    }
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
    const path = `${crypto.randomUUID()}-${safe}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    if (error) {
      await logEvent(supabase, "upload_rejected", null, {
        ip, endpoint: "/api/leads/upload", reason: "storage_error", name: file.name,
      });
      continue;
    }
    // url = signed (para mostrar en la sesión) · path = lo que se persiste en la DB.
    const url = (await signOne(path)) ?? path;
    uploaded.push({ name: file.name, url, type: file.type, path });
  }

  return NextResponse.json({ files: uploaded });
}
