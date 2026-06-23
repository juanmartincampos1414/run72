import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { getConfig, toPublicConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

/** Datos públicos para la pantalla de pago (datos bancarios + public key MP). */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { bank_cbu: null, bank_alias: null, bank_holder: null, mp_public_key: null, mp_enabled: false },
    );
  }
  const config = await getConfig();
  return NextResponse.json(toPublicConfig(config));
}
