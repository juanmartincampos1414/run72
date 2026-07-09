import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { logEvent } from "@/lib/audit";
import { sendEmail } from "@/lib/email";
import { enforceRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type Body = {
  needs?: string[];
  businessWhat?: string;
  stage?: string | null;
  objective?: string | null;
  explain?: string;
  availability?: string;
  contact?: { name?: string; email?: string; whatsapp?: string; company?: string };
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const contact = body.contact ?? {};
  const name = (contact.name ?? "").trim();
  const email = (contact.email ?? "").trim().toLowerCase();
  const whatsapp = (contact.whatsapp ?? "").trim();
  const company = (contact.company ?? "").trim();
  const explain = (body.explain ?? "").trim();
  const businessWhat = (body.businessWhat ?? "").trim();
  const availability = (body.availability ?? "").trim();
  const needs = Array.isArray(body.needs) ? body.needs.filter((n) => typeof n === "string") : [];

  if (!name) return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Email inválido." }, { status: 400 });
  if (explain.length < 3)
    return NextResponse.json({ error: "Contanos qué querés explicar en la reunión." }, { status: 400 });

  let saved = false;

  // --- Guardado (best-effort). No bloquea el email si Supabase no está disponible. ---
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();

    const limited = await enforceRateLimit({ req, supabase, endpoint: "/api/meeting", limit: 10 });
    if (limited) return limited;

    // Tabla dedicada si existe (aplicar supabase/migration_meeting_requests.sql).
    try {
      const { error } = await supabase.from("meeting_requests").insert({
        name,
        email,
        whatsapp: whatsapp || null,
        company: company || null,
        needs,
        business_what: businessWhat || null,
        stage: body.stage ?? null,
        objective: body.objective ?? null,
        explain,
        availability: availability || null,
      });
      saved = !error;
    } catch {
      /* la tabla puede no existir todavía */
    }

    // Auditoría (tabla events): queda guardado aunque no exista la tabla dedicada.
    await logEvent(supabase, "meeting_requested", null, {
      name,
      email,
      whatsapp,
      company,
      needs,
      businessWhat,
      stage: body.stage ?? null,
      objective: body.objective ?? null,
      explain,
      availability,
    });
  }

  // --- Email automático a RUN72 ---
  const to = process.env.ADMIN_EMAILS?.split(",")[0]?.trim() || "hola@run72.app";
  const row = (label: string, value: string) =>
    value
      ? `<tr><td style="padding:6px 12px;color:#9aa0ad;font-size:13px;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:6px 12px;color:#f5f6f8;font-size:14px">${escapeHtml(value)}</td></tr>`
      : "";
  const html = `
  <div style="font-family:system-ui,sans-serif;background:#050505;color:#f5f6f8;padding:32px;border-radius:16px;max-width:600px;margin:auto">
    <h1 style="font-size:22px;margin:0 0 4px">Nueva solicitud de reunión</h1>
    <p style="color:#9aa0ad;margin:0 0 16px;font-size:14px">Desde el cotizador de run72.app</p>
    <table style="width:100%;border-collapse:collapse;background:#0d0d11;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden">
      ${row("Nombre", name)}
      ${row("Email", email)}
      ${row("WhatsApp", whatsapp)}
      ${row("Empresa", company)}
      ${row("Qué necesita", needs.join(", "))}
      ${row("Negocio", businessWhat)}
      ${row("Etapa", body.stage ?? "")}
      ${row("Objetivo", body.objective ?? "")}
      ${row("Disponibilidad", availability)}
    </table>
    <div style="margin-top:16px;background:#0d0d11;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px">
      <p style="margin:0 0 6px;color:#9aa0ad;font-size:13px">Qué quiere explicar en la reunión</p>
      <p style="margin:0;font-size:14px;line-height:1.6;white-space:pre-wrap">${escapeHtml(explain)}</p>
    </div>
    <p style="color:#6b7180;font-size:12px;margin-top:20px">Respondé este mail para contactar directamente a ${escapeHtml(name)}.</p>
  </div>`;

  const emailed = await sendEmail({
    to,
    replyTo: email,
    subject: `Solicitud de reunión — ${name}`,
    html,
  });

  if (!emailed && !saved) {
    return NextResponse.json(
      { error: "No pudimos registrar tu solicitud. Escribinos a hola@run72.app." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
