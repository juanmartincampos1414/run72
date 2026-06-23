import type { SupabaseClient } from "@supabase/supabase-js";
import type { Lead } from "./types";
import { sendProjectStartedEmail } from "./email";

/**
 * Activa un lead a "En Producción" tras confirmarse el pago
 * (MercadoPago aprobado o transferencia validada por el admin).
 * Idempotente: si ya tiene production_started_at, no reenvía el email.
 */
export async function activateProduction(
  supabase: SupabaseClient,
  leadId: string,
): Promise<void> {
  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .maybeSingle();

  if (!lead) return;
  const typed = lead as Lead;
  if (typed.production_started_at) return; // ya activado

  const startedAt = new Date();
  const deliveryAt = new Date(startedAt.getTime() + 72 * 60 * 60 * 1000);

  // Update resiliente: si estimated_delivery_at no existe aún, actualiza sin ese campo.
  const full = {
    status: "en_produccion",
    production_started_at: startedAt.toISOString(),
    estimated_delivery_at: deliveryAt.toISOString(),
    comprobante_status: typed.comprobante_url ? "aprobado" : typed.comprobante_status,
  };
  const res = await supabase.from("leads").update(full).eq("id", leadId);
  if (res.error && /column|does not exist|schema cache/i.test(res.error.message)) {
    await supabase
      .from("leads")
      .update({ status: "en_produccion", production_started_at: startedAt.toISOString() })
      .eq("id", leadId);
  }

  // Evento de funnel: pago completado (para el dashboard)
  try {
    await supabase.from("events").insert({
      event_type: "payment_completed",
      session_id: (typed as { session_id?: string }).session_id ?? null,
      lead_id: leadId,
      metadata: { deposit_ars: typed.deposit_ars, total_ars: typed.total_ars },
    });
  } catch {
    /* tabla events puede no existir aún */
  }

  await sendProjectStartedEmail({ ...typed, status: "en_produccion" }, startedAt, deliveryAt);
}
