import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { logEvent } from "@/lib/audit";
import { sendEmail } from "@/lib/email";
import { enforceRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

type Dim = { name?: string; level?: number };
type Move = { name?: string; from?: number; service?: string };
type Body = {
  contact?: { name?: string; email?: string; whatsapp?: string };
  stage?: string;
  stageLevel?: number;
  dims?: Dim[];
  moves?: Move[];
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
  const stage = (body.stage ?? "").trim();
  const dims = Array.isArray(body.dims) ? body.dims : [];
  const moves = Array.isArray(body.moves) ? body.moves : [];

  if (!name) return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Email inválido." }, { status: 400 });

  let saved = false;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const limited = await enforceRateLimit({ req, supabase, endpoint: "/api/radar", limit: 10 });
    if (limited) return limited;

    try {
      const { error } = await supabase.from("radar_submissions").insert({
        name,
        email,
        whatsapp: whatsapp || null,
        stage: stage || null,
        stage_level: body.stageLevel ?? null,
        dims,
        moves,
      });
      saved = !error;
    } catch {
      saved = false;
    }
    await logEvent(supabase, "radar_submitted", null, { email, stage });
  }

  // --- Email del diagnóstico a RUN72 ---
  const to = process.env.ADMIN_EMAILS?.split(",")[0]?.trim() || "hola@run72.app";
  const dimRows = dims
    .map(
      (d) =>
        `<tr><td style="padding:6px 12px;color:#9aa0ad;font-size:13px">${escapeHtml(d.name ?? "")}</td><td style="padding:6px 12px;color:#f5f6f8;font-size:14px;text-align:right">N${d.level ?? "-"}</td></tr>`,
    )
    .join("");
  const moveRows = moves
    .map((m) => `<li style="margin:0 0 6px">${escapeHtml(m.name ?? "")} → ${escapeHtml(m.service ?? "")}</li>`)
    .join("");

  const html = `
  <div style="font-family:system-ui,sans-serif;background:#050505;color:#f5f6f8;padding:32px;border-radius:16px;max-width:600px;margin:auto">
    <h1 style="font-size:22px;margin:0 0 4px">Nuevo diagnóstico — Radar de IA</h1>
    <p style="color:#9aa0ad;margin:0 0 16px;font-size:14px">Estadio: <strong style="color:#a855f7">${escapeHtml(stage)}</strong></p>
    <table style="width:100%;border-collapse:collapse;background:#0d0d11;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden">
      <tr><td style="padding:6px 12px;color:#9aa0ad;font-size:13px">Nombre</td><td style="padding:6px 12px;color:#f5f6f8;font-size:14px;text-align:right">${escapeHtml(name)}</td></tr>
      <tr><td style="padding:6px 12px;color:#9aa0ad;font-size:13px">Email</td><td style="padding:6px 12px;color:#f5f6f8;font-size:14px;text-align:right">${escapeHtml(email)}</td></tr>
      ${whatsapp ? `<tr><td style="padding:6px 12px;color:#9aa0ad;font-size:13px">WhatsApp</td><td style="padding:6px 12px;color:#f5f6f8;font-size:14px;text-align:right">${escapeHtml(whatsapp)}</td></tr>` : ""}
      ${dimRows}
    </table>
    <div style="margin-top:16px;background:#0d0d11;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px">
      <p style="margin:0 0 8px;color:#9aa0ad;font-size:13px">3 primeras movidas (dimensión → servicio RUN72)</p>
      <ul style="margin:0;padding-left:18px;font-size:14px;line-height:1.6">${moveRows}</ul>
    </div>
    <p style="color:#6b7180;font-size:12px;margin-top:20px">Respondé este mail para contactar directamente a ${escapeHtml(name)}.</p>
  </div>`;

  const text = [
    "Nuevo diagnóstico — Radar de IA (run72.app)",
    `Estadio: ${stage}`,
    "",
    `Nombre: ${name}`,
    `Email: ${email}`,
    whatsapp ? `WhatsApp: ${whatsapp}` : "",
    "",
    "Perfil por dimensión:",
    ...dims.map((d) => `- ${d.name}: N${d.level}`),
    "",
    "3 primeras movidas:",
    ...moves.map((m) => `- ${m.name} → ${m.service}`),
  ]
    .filter((l) => l !== "")
    .join("\n");

  const emailed = await sendEmail({
    from: process.env.RESEND_FROM_NOTIFY || "RUN72 Radar <notificaciones@run72.app>",
    to,
    replyTo: email,
    subject: `Radar de IA — ${name} (${stage})`,
    html,
    text,
  });

  if (!emailed && !saved) {
    return NextResponse.json(
      { error: "No pudimos registrar tu diagnóstico. Escribinos a hola@run72.app." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
