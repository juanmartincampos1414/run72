import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { logEvent } from "@/lib/audit";
import { normalizarTelefono } from "@/lib/whatsapp";
import { deployEnv, writeGuard } from "@/lib/commerce-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Recibe los leads de pauta de GoHighLevel ("Centralize", form de info.run72.app)
 * y los crea en la tabla `leads` del admin.
 *
 * Seguridad: header `x-run-secret` (o ?secret=) == GHL_WEBHOOK_SECRET. Falla cerrado.
 *
 * Payload esperado (configurable desde el Workflow → Webhook de GHL):
 *   { name, email, whatsapp, idea, budget, meeting_at }
 * También acepta campos estándar de GHL (firstName/lastName/phone/full_name).
 */
const pick = (o: Record<string, unknown>, ...keys: string[]): string => {
  for (const k of keys) {
    const v = o?.[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number") return String(v);
  }
  return "";
};

export async function POST(req: Request) {
  const secret = process.env.GHL_WEBHOOK_SECRET;
  const given = req.headers.get("x-run-secret") || new URL(req.url).searchParams.get("secret");
  if (!secret || given !== secret) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  // Guarda de entorno (igual que /api/leads): no escribe a prod desde un entorno que no es prod.
  const guard = writeGuard();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: 503 });

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "db no configurada" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "body inválido" }, { status: 400 });
  }

  const nombre =
    pick(body, "name", "full_name", "fullName", "contact_name") ||
    `${pick(body, "firstName", "first_name")} ${pick(body, "lastName", "last_name")}`.trim();
  const email = pick(body, "email", "correo", "contact_email").toLowerCase();
  const telRaw = pick(body, "whatsapp", "phone", "telefono", "contact_phone");
  const whatsapp = normalizarTelefono(telRaw) || telRaw || null;
  const idea = pick(body, "idea", "mensaje", "message", "cuentanos", "descripcion", "notes");
  const budget = pick(body, "budget", "presupuesto", "rango");
  const meetingAt = pick(body, "meeting_at", "meetingAt", "appointment", "start_time", "startTime", "calendar");

  if (!nombre && !email && !whatsapp) {
    return NextResponse.json({ error: "faltan datos del lead (nombre/email/whatsapp)" }, { status: 400 });
  }

  // Bloque legible que se muestra en la ficha del lead (conversation_summary).
  const resumen = [
    idea ? `💡 Idea: ${idea}` : null,
    budget ? `💰 Presupuesto: ${budget}` : null,
    meetingAt ? `📅 Meet: ${meetingAt}` : null,
    "📣 Origen: pauta (info.run72.app)",
  ]
    .filter(Boolean)
    .join("\n");

  // Lead "caliente" si el presupuesto es alto.
  const hot = /8\.?000|más de 8|mas de 8|\+\s*8/i.test(budget);

  const supabase = getSupabaseAdmin();

  const base: Record<string, unknown> = {
    name: nombre || "Lead de pauta",
    email: email || "",
    whatsapp,
    phone: whatsapp,
    project_label: "Software / IA a medida (pauta)",
    status: "nuevo",
    hot,
    total_ars: 0,
    deposit_ars: 0,
  };
  const extra: Record<string, unknown> = {
    source_type: "pauta",
    conversation_summary: resumen,
    intake: { origen: "info.run72.app", idea, budget, meeting_at: meetingAt, raw: body },
  };

  let lead: { id: string } | null = null;
  let err: { message: string } | null = null;
  {
    const res = await supabase.from("leads").insert({ ...base, ...extra }).select("id").single();
    if (res.error && /column|does not exist|schema cache/i.test(res.error.message)) {
      const retry = await supabase.from("leads").insert(base).select("id").single();
      lead = retry.data;
      err = retry.error;
    } else {
      lead = res.data;
      err = res.error;
    }
  }

  if (err || !lead) {
    return NextResponse.json({ error: err?.message ?? "No se pudo crear el lead." }, { status: 500 });
  }

  await logEvent(supabase, "lead_created", lead.id, { source: "pauta", budget, env: deployEnv() });
  return NextResponse.json({ ok: true, id: lead.id });
}
