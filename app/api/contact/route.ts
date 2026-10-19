import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { logEvent } from "@/lib/audit";
import { sendEmail } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Captación consultiva a medida. NO llama a /api/leads, createPreference,
// activateProduction ni al generador de propuestas; no toca precios ni estados
// de contratos Express (sección 8.2).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const INTERESTS = ["software", "agentes", "automatizacion", "orientacion"] as const;
const BUDGETS = ["unsure", "3000_7500", "7500_15000", "15000_30000", "over_30000"] as const;
const TIMELINES = ["asap", "month", "1_3m", "later", "exploring"] as const;
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const PRIVACY_VERSION = "2026-10-18";
const MAX_BODY = 16 * 1024;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutos (8.2)

// Correo de notificación de leads. Identidad de marca = RUN; se centraliza en
// variables de entorno (Part B). Mientras no exista casilla propia de RUN,
// hola@run72.app queda como alias/forward temporal (bloqueante de producción).
const LEADS_TO = process.env.LEADS_NOTIFICATION_EMAIL || process.env.ADMIN_EMAILS?.split(",")[0]?.trim() || "hola@run72.app";
const LEADS_FROM = process.env.CONTACT_FROM_EMAIL || process.env.RESEND_FROM_NOTIFY || "RUN <notificaciones@run72.app>";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

type Interest = (typeof INTERESTS)[number];
type Budget = (typeof BUDGETS)[number];
type Timeline = (typeof TIMELINES)[number];
type Attribution = Record<string, string | undefined>;

const INTEREST_LABEL: Record<Interest, string> = {
  software: "Software a medida",
  agentes: "Agente de IA",
  automatizacion: "Integración y automatización",
  orientacion: "Orientación",
};
const BUDGET_LABEL: Record<Budget, string> = {
  unsure: "A dimensionar",
  "3000_7500": "USD 3k–7,5k",
  "7500_15000": "USD 7,5k–15k",
  "15000_30000": "USD 15k–30k",
  over_30000: "USD 30k+",
};
const TIMELINE_LABEL: Record<Timeline, string> = {
  asap: "Lo antes posible",
  month: "Este mes",
  "1_3m": "En 1–3 meses",
  later: "Más adelante",
  exploring: "Explorando",
};
const CHANNEL_LABEL: Record<string, string> = {
  google_ads: "Google Ads",
  google: "Google (orgánico)",
  meta_ads: "Meta Ads",
  linkedin: "LinkedIn",
  paid: "Pago",
  referral: "Referral",
  direct: "Directo",
  organic: "Orgánico",
};

// Deriva el canal de adquisición desde la atribución (misma lógica que el
// cliente, replicada en el servidor para persistir un valor confiable).
function deriveChannel(a: Attribution, host: string | null): string {
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

// Prioriza el lead para la bandeja comercial. No es scoring fino: segmenta por
// necesidad + presupuesto + urgencia para ordenar el trabajo (Part C).
function computePriority(interest: Interest, budget: Budget | null, timeline: Timeline | null): "alta" | "media" | "baja" {
  const strongNeed = interest === "software" || interest === "agentes";
  const strongBudget = budget === "7500_15000" || budget === "15000_30000" || budget === "over_30000";
  const nearTerm = timeline === "asap" || timeline === "month";
  if (strongNeed && strongBudget && nearTerm) return "alta";
  if (interest === "orientacion" && (!budget || budget === "unsure") && (timeline === "exploring" || timeline === "later")) return "baja";
  if ((!budget || budget === "unsure") && timeline === "exploring") return "baja";
  return "media";
}

export async function POST(req: Request) {
  // --- Rechazar origen cross-site (permitir mismo origen / sin Origin) ---
  const origin = req.headers.get("origin");
  if (origin) {
    try {
      const host = req.headers.get("host");
      if (host && new URL(origin).host !== host) {
        return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
    }
  }

  // --- Tamaño máximo 16KB ---
  const raw = await req.text();
  if (raw.length > MAX_BODY) {
    return NextResponse.json({ error: "El cuerpo de la consulta es demasiado grande." }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  // --- Honeypot ---
  if (typeof body.website === "string" && body.website.trim() !== "") {
    // Respuesta de éxito falsa para no informar al bot; no persistir.
    return NextResponse.json({ ok: true, inquiryId: "00000000-0000-0000-0000-000000000000" }, { status: 201 });
  }

  const errors: Record<string, string> = {};
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const company = String(body.company ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const interest = String(body.interest ?? "").trim() as Interest;
  const problem = String(body.problem ?? "").trim();
  const systems = String(body.systems ?? "").trim();
  const budgetRaw = String(body.budget ?? "").trim();
  const timelineRaw = String(body.timeline ?? "").trim();
  const privacy = body.privacy === true || body.privacy === "true";
  const idempotencyKey = String(body.idempotencyKey ?? "").trim();
  const sourcePath = String(body.sourcePath ?? "").trim().slice(0, 300);

  // Atribución first-touch enviada por el cliente (no PII; opcional).
  const attrIn = (body.attribution && typeof body.attribution === "object" ? body.attribution : {}) as Record<string, unknown>;
  const attribution: Attribution = {};
  for (const k of [...UTM_KEYS, "gclid", "fbclid", "referrer", "landing_page"] as const) {
    const v = attrIn[k];
    if (typeof v === "string" && v.trim()) attribution[k] = v.trim().slice(0, 300);
  }

  if (name.length < 2 || name.length > 120) errors.name = "Ingresá tu nombre (2 a 120 caracteres).";
  if (!EMAIL_RE.test(email) || email.length > 254) errors.email = "Ingresá un email válido.";
  if (company.length > 160) errors.company = "Máximo 160 caracteres.";
  if (phone.length > 40) errors.phone = "Máximo 40 caracteres.";
  if (!INTERESTS.includes(interest)) errors.interest = "Elegí qué querés mejorar.";
  if (problem.length < 20 || problem.length > 3000) errors.problem = "Contanos el proceso y el resultado (20 a 3000 caracteres).";
  if (systems.length > 500) errors.systems = "Máximo 500 caracteres.";
  const budget: Budget | null = BUDGETS.includes(budgetRaw as Budget) ? (budgetRaw as Budget) : null;
  if (budgetRaw && !budget) errors.budget = "Opción de inversión inválida.";
  const timeline: Timeline | null = TIMELINES.includes(timelineRaw as Timeline) ? (timelineRaw as Timeline) : null;
  if (timelineRaw && !timeline) errors.timeline = "Opción de plazo inválida.";
  if (!privacy) errors.privacy = "Necesitamos tu conformidad con la política de privacidad.";
  if (!UUID_RE.test(idempotencyKey)) errors.idempotencyKey = "Clave de solicitud inválida.";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Revisá los campos marcados.", errors }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "El servicio no está disponible temporalmente." }, { status: 503 });
  }

  const supabase = getSupabaseAdmin();

  // --- Rate limit 5 / 10 min por IP minimizada ---
  const ip = clientIp(req);
  const rl = rateLimit(`/api/contact:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!rl.ok) {
    await logEvent(supabase, "rate_limit_exceeded", null, { endpoint: "/api/contact", limit: RATE_LIMIT });
    return NextResponse.json(
      { error: "Demasiadas consultas en poco tiempo. Esperá unos minutos e intentá de nuevo." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  // --- Canal, prioridad y entry path derivados ---
  const host = req.headers.get("host");
  const channel = deriveChannel(attribution, host);
  const priority = computePriority(interest, budget, timeline);

  // --- Insertar una vez (idempotente por idempotency_key) ---
  let inquiryId: string | null = null;
  let created = false;
  try {
    const { data, error } = await supabase
      .from("project_inquiries")
      .insert({
        idempotency_key: idempotencyKey,
        name,
        email,
        company: company || null,
        phone: phone || null,
        interest,
        problem,
        systems: systems || null,
        budget,
        timeline,
        privacy_version: PRIVACY_VERSION,
        privacy_accepted_at: new Date().toISOString(),
        source: "contact",
        source_path: sourcePath || null,
        entry_path: sourcePath || null,
        landing_page: attribution.landing_page || null,
        referrer: attribution.referrer || null,
        utm_source: attribution.utm_source || null,
        utm_medium: attribution.utm_medium || null,
        utm_campaign: attribution.utm_campaign || null,
        utm_content: attribution.utm_content || null,
        utm_term: attribution.utm_term || null,
        channel,
        priority,
      })
      .select("id")
      .single();

    if (error) {
      // 23505 = unique_violation sobre idempotency_key → reintento idempotente.
      if ((error as { code?: string }).code === "23505") {
        const { data: existing } = await supabase
          .from("project_inquiries")
          .select("id")
          .eq("idempotency_key", idempotencyKey)
          .maybeSingle();
        if (existing?.id) {
          return NextResponse.json({ ok: true, inquiryId: existing.id }, { status: 200 });
        }
      }
      return NextResponse.json({ error: "No pudimos registrar tu consulta. Probá de nuevo." }, { status: 503 });
    }
    inquiryId = data?.id ?? null;
    created = true;
  } catch {
    return NextResponse.json({ error: "No pudimos registrar tu consulta. Probá de nuevo." }, { status: 503 });
  }

  if (!inquiryId) {
    return NextResponse.json({ error: "No pudimos registrar tu consulta. Probá de nuevo." }, { status: 503 });
  }

  await logEvent(supabase, "inquiry_submitted", null, { interest, channel, priority, source_path: sourcePath || null });

  // --- Notificación enriquecida (su fallo NO invalida la consulta guardada) ---
  const interestLabel = INTEREST_LABEL[interest] ?? interest;
  const budgetLabel = budget ? BUDGET_LABEL[budget] : "Sin especificar";
  const timelineLabel = timeline ? TIMELINE_LABEL[timeline] : "Sin especificar";
  const channelLabel = CHANNEL_LABEL[channel] ?? channel;
  const priorityLabel = priority.toUpperCase();
  const utmRows = UTM_KEYS.filter((k) => attribution[k])
    .map((k) => `<tr><td style="padding:2px 10px 2px 0;color:#666">${k}</td><td>${escapeHtml(attribution[k] as string)}</td></tr>`)
    .join("");

  const subject = `[RUN · Nuevo lead] ${interestLabel} · ${budgetLabel} · ${channelLabel}`;
  const html = `<h2 style="margin:0 0 4px">Nuevo lead · prioridad ${priorityLabel}</h2>
<p style="margin:0 0 16px;color:#666">${interestLabel} · ${budgetLabel} · ${timelineLabel} · ${channelLabel}</p>
<table style="border-collapse:collapse;font-size:14px">
<tr><td style="padding:2px 10px 2px 0;color:#666">Nombre</td><td>${escapeHtml(name)}</td></tr>
<tr><td style="padding:2px 10px 2px 0;color:#666">Email</td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
${phone ? `<tr><td style="padding:2px 10px 2px 0;color:#666">Teléfono</td><td>${escapeHtml(phone)} · <a href="https://wa.me/${phone.replace(/[^0-9]/g, "")}">WhatsApp</a></td></tr>` : ""}
${company ? `<tr><td style="padding:2px 10px 2px 0;color:#666">Empresa</td><td>${escapeHtml(company)}</td></tr>` : ""}
<tr><td style="padding:2px 10px 2px 0;color:#666">Interés</td><td>${escapeHtml(interestLabel)}</td></tr>
<tr><td style="padding:2px 10px 2px 0;color:#666">Inversión</td><td>${escapeHtml(budgetLabel)}</td></tr>
<tr><td style="padding:2px 10px 2px 0;color:#666">Plazo</td><td>${escapeHtml(timelineLabel)}</td></tr>
${systems ? `<tr><td style="padding:2px 10px 2px 0;color:#666">Herramientas</td><td>${escapeHtml(systems)}</td></tr>` : ""}
<tr><td style="padding:2px 10px 2px 0;color:#666">Canal</td><td>${escapeHtml(channelLabel)}</td></tr>
${attribution.referrer ? `<tr><td style="padding:2px 10px 2px 0;color:#666">Referrer</td><td>${escapeHtml(attribution.referrer)}</td></tr>` : ""}
${attribution.landing_page ? `<tr><td style="padding:2px 10px 2px 0;color:#666">Landing</td><td>${escapeHtml(attribution.landing_page)}</td></tr>` : ""}
${sourcePath ? `<tr><td style="padding:2px 10px 2px 0;color:#666">Entry path</td><td>${escapeHtml(sourcePath)}</td></tr>` : ""}
${utmRows}
</table>
<p style="margin:16px 0 4px"><strong>Proceso y resultado:</strong></p>
<p style="font-size:14px">${escapeHtml(problem).replace(/\n/g, "<br>")}</p>
<hr><p style="color:#999;font-size:12px">ID: ${inquiryId} · Enviar una consulta no inicia producción.</p>`;

  const emailArgs = { to: LEADS_TO, from: LEADS_FROM, replyTo: email, subject, html };
  // Un reintento ante fallo transitorio; nunca bloquea ni pierde el lead ya guardado.
  let sent = await sendEmail(emailArgs);
  if (!sent) sent = await sendEmail(emailArgs);

  if (sent) {
    try {
      await supabase.from("project_inquiries").update({ notified_at: new Date().toISOString() }).eq("id", inquiryId);
    } catch {
      /* el aviso se envió; no bloquea */
    }
  } else {
    // El lead está persistido; registramos el fallo para reintento manual.
    await logEvent(supabase, "lead_notification_failed", null, { inquiry_id: inquiryId, channel, priority });
  }

  return NextResponse.json({ ok: true, inquiryId }, { status: created ? 201 : 200 });
}
