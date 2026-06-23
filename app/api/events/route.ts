import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** Registra un evento del funnel. Fire-and-forget: siempre responde ok. */
export async function POST(req: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ ok: true });

  let body: {
    eventType?: string;
    sessionId?: string;
    leadId?: string | null;
    metadata?: Record<string, unknown>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  if (!body.eventType) return NextResponse.json({ ok: true });

  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("events").insert({
      event_type: body.eventType,
      session_id: body.sessionId ?? null,
      lead_id: body.leadId ?? null,
      metadata: body.metadata ?? {},
    });
  } catch {
    /* tabla puede no existir aún; ignoramos */
  }

  return NextResponse.json({ ok: true });
}
