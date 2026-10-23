import "server-only";

// Guardas del recorrido comercial (RUN-24 / QA sandbox). El objetivo es que
// Preview y local NUNCA usen credenciales productivas de MercadoPago ni toquen
// pagos reales: fuera de producción sólo se admite sandbox, y nunca se lee el
// token productivo de la tabla `config`.

export type DeployEnv = "production" | "preview" | "development";

/** Entorno de deploy real. En Vercel: VERCEL_ENV. Local: development. */
export function deployEnv(): DeployEnv {
  const v = process.env.VERCEL_ENV;
  if (v === "production" || v === "preview" || v === "development") return v;
  return process.env.NODE_ENV === "production" ? "production" : "development";
}

export const isProductionEnv = (): boolean => deployEnv() === "production";

/** Token productivo de MercadoPago (credencial de aplicación). Los de prueba empiezan con TEST-. */
export function isProdMpToken(token: string | null | undefined): boolean {
  return !!token && token.startsWith("APP_USR-");
}

export type MpTokenResult = { token: string; env: DeployEnv } | { error: string };

/**
 * Resuelve el access token de MercadoPago a usar, con guarda por entorno:
 *  - producción: usa el token de `config` (el productivo).
 *  - preview / local: usa MP_SANDBOX_ACCESS_TOKEN (sandbox) y RECHAZA cualquier
 *    token productivo. Nunca se lee el token productivo de `config`.
 */
export function resolveMpToken(configToken: string | null | undefined): MpTokenResult {
  const env = deployEnv();
  if (env === "production") {
    if (!configToken) return { error: "MercadoPago no está configurado." };
    return { token: configToken, env };
  }
  const sandbox = process.env.MP_SANDBOX_ACCESS_TOKEN;
  if (!sandbox) {
    return { error: `Pagos deshabilitados en ${env}: falta MP_SANDBOX_ACCESS_TOKEN (credencial sandbox de MercadoPago).` };
  }
  if (isProdMpToken(sandbox)) {
    return { error: `MP_SANDBOX_ACCESS_TOKEN parece una credencial productiva; en ${env} sólo se admite sandbox.` };
  }
  return { token: sandbox, env };
}
