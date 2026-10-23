import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { getConfig } from "@/lib/config";
import { baseUrlFrom, createPreference } from "@/lib/mercadopago";
import { resolveMpToken } from "@/lib/commerce-guard";
import { logEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

/** Crea una preferencia de MercadoPago por el adelanto (30%) de un lead. */
export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 503 });
  }

  let leadId: string | undefined;
  try {
    ({ leadId } = await req.json());
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  if (!leadId) {
    return NextResponse.json({ error: "Falta leadId." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: lead, error } = await supabase
    .from("leads")
    .select("id, email, deposit_ars, project_label")
    .eq("id", leadId)
    .maybeSingle();

  if (error || !lead) {
    return NextResponse.json({ error: "Lead no encontrado." }, { status: 404 });
  }
  if (!lead.deposit_ars || lead.deposit_ars <= 0) {
    return NextResponse.json(
      { error: "El monto del adelanto aún no está definido." },
      { status: 400 },
    );
  }

  const config = await getConfig();
  // Guarda por entorno: fuera de producción sólo sandbox, nunca el token prod de config.
  const mp = resolveMpToken(config.mp_access_token);
  if ("error" in mp) {
    return NextResponse.json({ error: mp.error }, { status: 503 });
  }

  try {
    const pref = await createPreference({
      accessToken: mp.token,
      title: `Adelanto 30% — ${lead.project_label ?? "Proyecto RUN"}`,
      amount: lead.deposit_ars,
      externalReference: lead.id,
      baseUrl: baseUrlFrom(req),
      payerEmail: lead.email ?? undefined,
    });

    await supabase
      .from("leads")
      .update({ preference_id: pref.id })
      .eq("id", lead.id);
    // Registra el entorno que procesó el pago.
    await logEvent(supabase, "payment_preference_created", lead.id, { env: mp.env, preference_id: pref.id });

    return NextResponse.json({ init_point: pref.init_point, preference_id: pref.id });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error creando el pago." },
      { status: 502 },
    );
  }
}
