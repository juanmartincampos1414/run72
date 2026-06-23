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
  await supabase
    .from("leads")
    .update({
      status: "en_produccion",
      production_started_at: startedAt.toISOString(),
    })
    .eq("id", leadId);

  await sendProjectStartedEmail({ ...typed, status: "en_produccion" }, startedAt);
}
