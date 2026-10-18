import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { logEvent } from "@/lib/audit";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const STATUSES = ["nuevo", "revisando", "contactado", "cerrado"] as const;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

type Ctx = { params: Promise<{ id: string }> };

/** Detalle completo de una consulta. */
export async function GET(_req: Request, { params }: Ctx) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 503 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("project_inquiries")
    .select(
      "id, name, email, company, interest, problem, systems, budget, status, source_path, privacy_version, privacy_accepted_at, created_at, notified_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: "No se pudo cargar la consulta." }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Consulta no encontrada." }, { status: 404 });
  return NextResponse.json({ inquiry: data });
}

/** Cambia el estado o reenvía el aviso de una consulta YA guardada. */
export async function PATCH(req: Request, { params }: Ctx) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // --- Reenviar aviso (sin insertar filas nuevas) ---
  if (body.action === "resend") {
    const { data: q, error } = await supabase
      .from("project_inquiries")
      .select("id, name, email, company, interest, problem, systems, budget")
      .eq("id", id)
      .maybeSingle();
    if (error) return NextResponse.json({ error: "No se pudo cargar la consulta." }, { status: 500 });
    if (!q) return NextResponse.json({ error: "Consulta no encontrada." }, { status: 404 });

    const to = process.env.ADMIN_EMAILS?.split(",")[0]?.trim() || "hola@run72.app";
    const from = process.env.RESEND_FROM_NOTIFY || "RUN <notificaciones@run72.app>";
    const sent = await sendEmail({
      to,
      from,
      replyTo: q.email,
      subject: "Consulta a medida RUN",
      html: `<h2>Nueva consulta a medida</h2>
<p><strong>Nombre:</strong> ${escapeHtml(q.name)}</p>
<p><strong>Email:</strong> ${escapeHtml(q.email)}</p>
${q.company ? `<p><strong>Empresa:</strong> ${escapeHtml(q.company)}</p>` : ""}
<p><strong>Interés:</strong> ${escapeHtml(q.interest)}</p>
${q.budget ? `<p><strong>Inversión estimada:</strong> ${escapeHtml(q.budget)}</p>` : ""}
${q.systems ? `<p><strong>Herramientas:</strong> ${escapeHtml(q.systems)}</p>` : ""}
<p><strong>Proceso y resultado:</strong></p>
<p>${escapeHtml(q.problem).replace(/\n/g, "<br>")}</p>
<hr><p>ID: ${q.id}</p>`,
    });

    await logEvent(supabase, "inquiry_resend", null, { inquiry_id: id, sent, by: auth.user.email ?? null });

    if (!sent) {
      return NextResponse.json({ error: "No se pudo enviar el aviso (¿Resend configurado?)." }, { status: 502 });
    }

    const notifiedAt = new Date().toISOString();
    const { error: upErr } = await supabase
      .from("project_inquiries")
      .update({ notified_at: notifiedAt })
      .eq("id", id);
    if (upErr) {
      // El mail salió; solo falló marcar notified_at.
      return NextResponse.json({ ok: true, warning: "Aviso enviado, pero no se pudo marcar como notificado." });
    }
    return NextResponse.json({ ok: true, notified_at: notifiedAt });
  }

  // --- Cambio de estado ---
  if (typeof body.status === "string") {
    const status = body.status;
    if (!(STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("project_inquiries")
      .update({ status })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) return NextResponse.json({ error: "No se pudo actualizar el estado." }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Consulta no encontrada." }, { status: 404 });

    await logEvent(supabase, "inquiry_status_changed", null, {
      inquiry_id: id,
      status,
      by: auth.user.email ?? null,
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Acción inválida." }, { status: 400 });
}
