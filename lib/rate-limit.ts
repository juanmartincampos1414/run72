/**
 * Rate limiter simple en memoria (fixed-window por IP).
 * Sin dependencias externas → cero costo operativo y compatible con Vercel.
 *
 * Limitación conocida: en serverless el estado es por-instancia (no compartido
 * entre lambdas frías). Es una primera capa razonable contra spam/abuso; para
 * límites estrictos a escala, migrar a Upstash Redis (ver reporte de hardening).
 */

import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logEvent } from "./audit";

type Bucket = { count: number; reset: number };

const store = new Map<string, Bucket>();

export type RateResult = {
  ok: boolean;
  remaining: number;
  /** epoch ms en que se reinicia la ventana */
  reset: number;
  /** segundos hasta el reset (para Retry-After) */
  retryAfter: number;
};

/**
 * Consume 1 unidad de la ventana `windowMs` para `key`.
 * Devuelve ok=false si se excedió `limit`.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now();

  // Limpieza oportunista para que el Map no crezca sin control.
  if (store.size > 5000) {
    for (const [k, b] of store) if (now > b.reset) store.delete(k);
  }

  const bucket = store.get(key);
  if (!bucket || now > bucket.reset) {
    const reset = now + windowMs;
    store.set(key, { count: 1, reset });
    return { ok: true, remaining: limit - 1, reset, retryAfter: 0 };
  }

  bucket.count += 1;
  const remaining = Math.max(0, limit - bucket.count);
  const retryAfter = Math.ceil((bucket.reset - now) / 1000);
  return { ok: bucket.count <= limit, remaining, reset: bucket.reset, retryAfter };
}

/** Extrae la IP del cliente detrás del proxy de Vercel. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export const HOUR = 60 * 60 * 1000;

/**
 * Aplica rate limit por IP a un endpoint público. Si se excede:
 * registra `rate_limit_exceeded`, y devuelve un 429 amigable (con Retry-After).
 * Devuelve `null` si la solicitud está dentro del límite (seguir adelante).
 */
export async function enforceRateLimit(opts: {
  req: Request;
  supabase: SupabaseClient;
  endpoint: string;
  limit: number;
  message?: string;
}): Promise<NextResponse | null> {
  const ip = clientIp(opts.req);
  const r = rateLimit(`${opts.endpoint}:${ip}`, opts.limit, HOUR);
  if (r.ok) return null;

  await logEvent(opts.supabase, "rate_limit_exceeded", null, {
    ip,
    endpoint: opts.endpoint,
    limit: opts.limit,
  });
  console.warn(`[rate-limit] excedido ip=${ip} endpoint=${opts.endpoint} limit=${opts.limit}/h`);

  return NextResponse.json(
    {
      error:
        opts.message ??
        "Demasiadas solicitudes en poco tiempo. Esperá unos minutos e intentá de nuevo.",
    },
    { status: 429, headers: { "Retry-After": String(r.retryAfter) } },
  );
}
