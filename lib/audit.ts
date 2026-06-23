import type { SupabaseClient } from "@supabase/supabase-js";

/** Registra un evento de auditoría/funnel en la tabla events. Fire-and-forget. */
export async function logEvent(
  supabase: SupabaseClient,
  eventType: string,
  leadId: string | null,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    await supabase.from("events").insert({
      event_type: eventType,
      lead_id: leadId,
      metadata,
    });
  } catch {
    /* tabla events puede no existir aún */
  }
}
