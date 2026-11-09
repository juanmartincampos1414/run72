import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getPlaybook, upsertPlaybook } from "@/lib/playbooks";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** GET ?vertical= → devuelve el playbook del rubro. */
export async function GET(req: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  const vertical = new URL(req.url).searchParams.get("vertical") ?? "";
  const pb = await getPlaybook(getSupabaseAdmin(), vertical);
  return NextResponse.json({ playbook: pb });
}

/** PATCH { vertical, label?, playbook } → edición manual del playbook. */
export async function PATCH(req: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  const body = await req.json().catch(() => ({}));
  const vertical = String(body.vertical ?? "").trim();
  if (!vertical) return NextResponse.json({ error: "Falta vertical." }, { status: 400 });
  const pb = await upsertPlaybook(getSupabaseAdmin(), vertical, {
    label: body.label,
    playbook: String(body.playbook ?? ""),
  });
  return NextResponse.json({ playbook: pb });
}

/**
 * POST { leadId } → "Capturar aprendizaje": resume este proyecto (transcripción +
 * propuesta) y lo SUMA al playbook del rubro del lead, para que el próximo cliente
 * del mismo rubro salga mejor. Incrementa el contador de proyectos.
 */
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  const actor = auth.user?.email ?? "admin";

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Falta ANTHROPIC_API_KEY." }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const leadId = String(body.leadId ?? "");
  if (!leadId) return NextResponse.json({ error: "Falta leadId." }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: lead } = await supabase.from("leads").select("*").eq("id", leadId).maybeSingle();
  if (!lead) return NextResponse.json({ error: "Lead no encontrado." }, { status: 404 });

  const vertical = String(lead.vertical ?? "").trim();
  if (!vertical) {
    return NextResponse.json({ error: "Cargá el rubro (vertical) del lead en el CRM primero." }, { status: 400 });
  }

  const existing = await getPlaybook(supabase, vertical);
  const transcript = String(lead.transcript ?? "").slice(0, 30000);
  const proposal = lead.proposal ? JSON.stringify(lead.proposal).slice(0, 8000) : "";

  const system = `Sos el que mantiene el PLAYBOOK de RUN para cada rubro: un documento vivo que hace que el próximo cliente del mismo rubro salga mejor, más rápido y más barato de producir. Te paso el playbook actual del rubro "${vertical}" y un proyecto nuevo. Devolvé el playbook ACTUALIZADO (markdown), integrando los aprendizajes nuevos sin perder los anteriores. Secciones sugeridas: Qué suele necesitar este rubro · Qué construimos (módulos/fases que funcionan) · Precios de referencia · Qué mockups/pantallas gustan · Objeciones y cómo cerrarlas · Errores a evitar. Conciso y accionable, en español rioplatense. Devolvé SOLO el markdown del playbook, sin texto extra.`;

  let updated = "";
  try {
    const client = new Anthropic({ apiKey });
    const r = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 4000,
      output_config: { effort: "medium" },
      system,
      messages: [
        {
          role: "user",
          content: `PLAYBOOK ACTUAL del rubro "${vertical}":\n${existing?.playbook || "(vacío, es el primer proyecto de este rubro)"}\n\n=== PROYECTO NUEVO (${lead.name ?? "cliente"}) ===\nPropuesta: ${proposal || "(sin propuesta)"}\n\nTranscripción:\n${transcript || "(sin transcripción)"}\n\nDevolvé el playbook actualizado.`,
        },
      ],
    });
    const b = r.content.find((x) => x.type === "text");
    updated = b && "text" in b ? b.text.trim() : "";
  } catch {
    return NextResponse.json({ error: "No pude capturar el aprendizaje. Probá de nuevo." }, { status: 502 });
  }
  if (updated.length < 20) {
    return NextResponse.json({ error: "No se generó contenido. Probá de nuevo." }, { status: 502 });
  }

  const pb = await upsertPlaybook(supabase, vertical, {
    label: lead.vertical,
    playbook: updated,
    incrementProjects: true,
  });
  await supabase.from("events").insert({
    lead_id: leadId,
    event_type: "playbook_updated",
    metadata: { actor, vertical },
  }).then(() => {}, () => {});

  return NextResponse.json({ playbook: pb });
}
