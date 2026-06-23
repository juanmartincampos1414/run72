import { getSupabaseAdmin } from "./supabase/admin";

export type AppConfig = {
  bank_cbu: string | null;
  bank_alias: string | null;
  bank_holder: string | null;
  mp_access_token: string | null;
  mp_public_key: string | null;
  deposit_percent: number;
};

/** Config completa (server-only — incluye el access token de MP). */
export async function getConfig(): Promise<AppConfig> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("config")
    .select(
      "bank_cbu, bank_alias, bank_holder, mp_access_token, mp_public_key, deposit_percent",
    )
    .eq("id", 1)
    .maybeSingle();

  return {
    bank_cbu: data?.bank_cbu ?? null,
    bank_alias: data?.bank_alias ?? null,
    bank_holder: data?.bank_holder ?? null,
    mp_access_token: data?.mp_access_token ?? process.env.MP_ACCESS_TOKEN ?? null,
    mp_public_key:
      data?.mp_public_key ?? process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ?? null,
    deposit_percent: data?.deposit_percent ?? 30,
  };
}

/** Subconjunto público (sin secretos) para el cliente. */
export type PublicConfig = {
  bank_cbu: string | null;
  bank_alias: string | null;
  bank_holder: string | null;
  mp_public_key: string | null;
  mp_enabled: boolean;
};

export function toPublicConfig(c: AppConfig): PublicConfig {
  return {
    bank_cbu: c.bank_cbu,
    bank_alias: c.bank_alias,
    bank_holder: c.bank_holder,
    mp_public_key: c.mp_public_key,
    mp_enabled: Boolean(c.mp_access_token),
  };
}
