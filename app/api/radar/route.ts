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

type Area = { name?: string; level?: number };
type Step = { name?: string; service?: string };
type Body = {
  contact?: { name?: string; email?: string; whatsapp?: string };
  stage?: string;
  stageLevel?: number;
  areas?: Area[];
  steps?: Step[];
  privacy?: boolean;
  attribution?: Record<string, unknown>;
};

const NIVEL = ["", "En el arranque", "Agarrando ritmo", "En velocidad", "A la cabeza"];
const PRIVACY_VERSION = "2026-10-18";

function deriveChannel(a: Record<string, string>, host: string | null): string {
  const src = (a.utm_source || "").toLowerCase();
  const med = (a.utm_medium || "").toLowerCase();
  const ref = (a.referrer || "").toLowerCase();
  if (a.gclid || src.includes("google")) return med.includes("cpc") || med.includes("paid") || a.gclid ? "google_ads" : "google";
  if (a.fbclid || src.includes("facebook") || src.includes("meta") || src.includes("instagram")) return "meta_ads";
  if (src.includes("linkedin")) return "linkedin";
  if (med.includes("cpc") || med.includes("paid") || med.includes("ads")) return "paid";
  if (ref && (!host || !ref.includes(host))) return "referral";
  if (!ref && !src) return "direct";
  return "organic";
}

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
  const areas = Array.isArray(body.areas) ? body.areas : [];
  const steps = Array.isArray(body.steps) ? body.steps : [];

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
        dims: areas,
        moves: steps,
      });
      saved = !error;
    } catch {
      saved = false;
    }
    await logEvent(supabase, "radar_submitted", null, { email, stage });

    // --- Alimentar el pipeline unificado SOLO con consentimiento explícito ---
    // (Runit Scan ya es una acción explícita; sumamos la conformidad de privacidad.)
    if (body.privacy === true) {
      const attr: Record<string, string> = {};
      const attrIn = (body.attribution && typeof body.attribution === "object" ? body.attribution : {}) as Record<string, unknown>;
      for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid", "referrer", "landing_page"]) {
        const v = attrIn[k];
        if (typeof v === "string" && v.trim()) attr[k] = v.trim().slice(0, 300);
      }
      const channel = deriveChannel(attr, req.headers.get("host"));
      const problem = [
        `Autodiagnóstico Runit Scan — etapa: ${stage || "s/d"}.`,
        areas.length ? "Áreas: " + areas.map((a) => `${a.name} (${NIVEL[a.level ?? 0] ?? ""})`).join(", ") : "",
        steps.length ? "Próximos pasos sugeridos: " + steps.map((s) => `${s.name} → ${s.service}`).join("; ") : "",
      ].filter(Boolean).join("\n");
      try {
        await supabase.from("project_inquiries").insert({
          idempotency_key: crypto.randomUUID(),
          name,
          email,
          phone: whatsapp || null,
          interest: "orientacion",
          problem: problem.slice(0, 3000),
          privacy_version: PRIVACY_VERSION,
          privacy_accepted_at: new Date().toISOString(),
          source: "runit_scan",
          entry_path: "/runit-scan",
          landing_page: attr.landing_page || null,
          referrer: attr.referrer || null,
          utm_source: attr.utm_source || null,
          utm_medium: attr.utm_medium || null,
          utm_campaign: attr.utm_campaign || null,
          utm_content: attr.utm_content || null,
          utm_term: attr.utm_term || null,
          channel,
          priority: "media",
        });
      } catch {
        /* el radar_submission ya quedó guardado; el espejo no bloquea */
      }
    }
  }

  const from = process.env.RESEND_FROM_NOTIFY || "RUN Radar <notificaciones@run72.app>";
  const admin = process.env.ADMIN_EMAILS?.split(",")[0]?.trim() || "hola@run72.app";

  const areaRows = areas
    .map(
      (a) =>
        `<tr><td style="padding:6px 12px;color:#9aa0ad;font-size:13px">${escapeHtml(a.name ?? "")}</td><td style="padding:6px 12px;color:#f5f6f8;font-size:13px;text-align:right">${escapeHtml(NIVEL[a.level ?? 0] ?? "")}</td></tr>`,
    )
    .join("");
  const stepRows = steps
    .map((s) => `<li style="margin:0 0 6px">${escapeHtml(s.name ?? "")} → <strong>${escapeHtml(s.service ?? "")}</strong></li>`)
    .join("");

  // --- 1) Aviso interno a RUN (pide videollamada) ---
  const adminHtml = `
  <div style="font-family:system-ui,sans-serif;background:#050505;color:#f5f6f8;padding:32px;border-radius:16px;max-width:600px;margin:auto">
    <h1 style="font-size:22px;margin:0 0 4px">Nuevo diagnóstico · pide videollamada</h1>
    <p style="color:#9aa0ad;margin:0 0 16px;font-size:14px">Nivel general: <strong style="color:#a855f7">${escapeHtml(stage)}</strong></p>
    <table style="width:100%;border-collapse:collapse;background:#0d0d11;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden">
      <tr><td style="padding:6px 12px;color:#9aa0ad;font-size:13px">Nombre</td><td style="padding:6px 12px;color:#f5f6f8;font-size:14px;text-align:right">${escapeHtml(name)}</td></tr>
      <tr><td style="padding:6px 12px;color:#9aa0ad;font-size:13px">Email</td><td style="padding:6px 12px;color:#f5f6f8;font-size:14px;text-align:right">${escapeHtml(email)}</td></tr>
      ${whatsapp ? `<tr><td style="padding:6px 12px;color:#9aa0ad;font-size:13px">WhatsApp</td><td style="padding:6px 12px;color:#f5f6f8;font-size:14px;text-align:right">${escapeHtml(whatsapp)}</td></tr>` : ""}
      ${areaRows}
    </table>
    <div style="margin-top:16px;background:#0d0d11;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px">
      <p style="margin:0 0 8px;color:#9aa0ad;font-size:13px">Por dónde empezar (área → servicio)</p>
      <ul style="margin:0;padding-left:18px;font-size:14px;line-height:1.6">${stepRows}</ul>
    </div>
    <p style="color:#6b7180;font-size:12px;margin-top:20px">Respondé este mail para coordinar la videollamada con ${escapeHtml(name)}.</p>
  </div>`;

  const adminText = [
    "Nuevo diagnóstico · pide videollamada (run72.app/radar)",
    `Nivel general: ${stage}`,
    "",
    `Nombre: ${name}`,
    `Email: ${email}`,
    whatsapp ? `WhatsApp: ${whatsapp}` : "",
    "",
    "Mapa por área:",
    ...areas.map((a) => `- ${a.name}: ${NIVEL[a.level ?? 0] ?? ""}`),
    "",
    "Por dónde empezar:",
    ...steps.map((s) => `- ${s.name} → ${s.service}`),
  ]
    .filter((l) => l !== "")
    .join("\n");

  const emailedAdmin = await sendEmail({
    from,
    to: admin,
    replyTo: email,
    subject: `Runit Scan · videollamada — ${name} (${stage})`,
    html: adminHtml,
    text: adminText,
  });

  // --- 2) Copia al cliente con su diagnóstico ---
  const clientHtml = `
  <div style="font-family:system-ui,sans-serif;background:#050505;color:#f5f6f8;padding:32px;border-radius:16px;max-width:600px;margin:auto">
    <h1 style="font-size:24px;margin:0 0 6px">Tu diagnóstico de IA</h1>
    <p style="color:#9aa0ad;margin:0 0 18px;font-size:15px">${escapeHtml(name)}, tu negocio está <strong style="color:#a855f7">${escapeHtml(stage)}</strong> con IA. Este es tu mapa.</p>
    <table style="width:100%;border-collapse:collapse;background:#0d0d11;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden">
      ${areaRows}
    </table>
    <div style="margin-top:16px;background:#0d0d11;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px">
      <p style="margin:0 0 8px;color:#9aa0ad;font-size:13px">Por dónde empezar</p>
      <ul style="margin:0;padding-left:18px;font-size:14px;line-height:1.6">${stepRows}</ul>
    </div>
    <p style="margin:20px 0 0;font-size:14px;line-height:1.6">En breve te escribimos para coordinar una <strong>videollamada</strong>, profundizar en tu caso y armarte un presupuesto a medida. Si querés, respondé este mail con tu disponibilidad.</p>
    <p style="color:#6b7180;font-size:12px;margin-top:18px">RUN · Software a medida y agentes de IA · run72.app</p>
  </div>`;

  const clientText = [
    `Tu diagnóstico de IA — RUN`,
    `${name}, tu negocio está ${stage} con IA. Este es tu mapa.`,
    "",
    ...areas.map((a) => `- ${a.name}: ${NIVEL[a.level ?? 0] ?? ""}`),
    "",
    "Por dónde empezar:",
    ...steps.map((s) => `- ${s.name} → ${s.service}`),
    "",
    "En breve te escribimos para coordinar una videollamada, profundizar en tu caso y armarte un presupuesto a medida.",
    "RUN · run72.app",
  ].join("\n");

  await sendEmail({
    from,
    to: email,
    replyTo: admin,
    subject: "Tu diagnóstico de IA — RUN",
    html: clientHtml,
    text: clientText,
  });

  if (!emailedAdmin && !saved) {
    return NextResponse.json(
      { error: "No pudimos registrar tu diagnóstico. Escribinos a hola@run72.app." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
