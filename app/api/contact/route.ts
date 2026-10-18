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
const BUDGETS = ["unsure", "under_3000", "3000_10000", "over_10000"] as const;
const PRIVACY_VERSION = "2026-10-18";
const MAX_BODY = 16 * 1024;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutos (8.2)

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

type Interest = (typeof INTERESTS)[number];
type Budget = (typeof BUDGETS)[number];

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
  const interest = String(body.interest ?? "").trim() as Interest;
  const problem = String(body.problem ?? "").trim();
  const systems = String(body.systems ?? "").trim();
  const budgetRaw = String(body.budget ?? "").trim();
  const privacy = body.privacy === true || body.privacy === "true";
  const idempotencyKey = String(body.idempotencyKey ?? "").trim();
  const sourcePath = String(body.sourcePath ?? "").trim().slice(0, 300);

  if (name.length < 2 || name.length > 120) errors.name = "Ingresá tu nombre (2 a 120 caracteres).";
  if (!EMAIL_RE.test(email) || email.length > 254) errors.email = "Ingresá un email válido.";
  if (company.length > 160) errors.company = "Máximo 160 caracteres.";
  if (!INTERESTS.includes(interest)) errors.interest = "Elegí qué querés mejorar.";
  if (problem.length < 20 || problem.length > 3000) errors.problem = "Contanos el proceso y el resultado (20 a 3000 caracteres).";
  if (systems.length > 500) errors.systems = "Máximo 500 caracteres.";
  const budget: Budget | null = BUDGETS.includes(budgetRaw as Budget) ? (budgetRaw as Budget) : null;
  if (budgetRaw && !budget) errors.budget = "Opción de inversión inválida.";
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
        interest,
        problem,
        systems: systems || null,
        budget,
        privacy_version: PRIVACY_VERSION,
        source_path: sourcePath || null,
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

  await logEvent(supabase, "inquiry_submitted", null, { interest, source_path: sourcePath || null });

  // --- Notificación (su fallo NO invalida la consulta ya guardada) ---
  const admin = process.env.ADMIN_EMAILS?.split(",")[0]?.trim() || "hola@run72.app";
  const from = process.env.RESEND_FROM_NOTIFY || "RUN <notificaciones@run72.app>";
  const sent = await sendEmail({
    to: admin,
    from,
    replyTo: email,
    subject: "Consulta a medida RUN",
    html: `<h2>Nueva consulta a medida</h2>
<p><strong>Nombre:</strong> ${escapeHtml(name)}</p>
<p><strong>Email:</strong> ${escapeHtml(email)}</p>
${company ? `<p><strong>Empresa:</strong> ${escapeHtml(company)}</p>` : ""}
<p><strong>Interés:</strong> ${escapeHtml(interest)}</p>
${budget ? `<p><strong>Inversión estimada:</strong> ${escapeHtml(budget)}</p>` : ""}
${systems ? `<p><strong>Herramientas:</strong> ${escapeHtml(systems)}</p>` : ""}
<p><strong>Proceso y resultado:</strong></p>
<p>${escapeHtml(problem).replace(/\n/g, "<br>")}</p>
<hr><p>ID: ${inquiryId}</p>`,
  });

  if (sent) {
    try {
      await supabase.from("project_inquiries").update({ notified_at: new Date().toISOString() }).eq("id", inquiryId);
    } catch {
      /* el aviso se envió; no bloquea */
    }
  }

  return NextResponse.json({ ok: true, inquiryId }, { status: created ? 201 : 200 });
}
