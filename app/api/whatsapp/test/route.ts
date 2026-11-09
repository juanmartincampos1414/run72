import { NextResponse } from "next/server";
import { enviarPlantilla, estadoNumero, normalizarTelefono, whatsappConfigurado } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Endpoint de diagnóstico: manda una plantilla de prueba a un número, para verificar
 * token + phone_id sin depender de la aprobación de `recordatorio_meet`.
 * Protegido con CRON_SECRET. Por defecto usa `hello_world` (aprobada por defecto, sin variables).
 *
 *   GET /api/whatsapp/test?to=5491163564944
 *   GET /api/whatsapp/test?to=...&template=recordatorio_meet&lang=es&v1=Juan&v2=jueves%2010:00
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("unauthorized", { status: 401 });
  }
  if (!whatsappConfigurado()) {
    return NextResponse.json({ error: "whatsapp no configurado (faltan token/phone_id)" }, { status: 503 });
  }

  const url = new URL(req.url);

  // Diagnóstico: ?status=1 devuelve el estado del número (calidad, límites, etc.)
  if (url.searchParams.get("status")) {
    try {
      return NextResponse.json({ ok: true, numero: await estadoNumero() });
    } catch (e) {
      return NextResponse.json({ ok: false, error: String(e) }, { status: 502 });
    }
  }

  // ?raw=1 envía al número tal cual (solo dígitos), sin agregar el "9" argentino.
  const rawTo = url.searchParams.get("to");
  const to = url.searchParams.get("raw")
    ? (rawTo || "").replace(/[^\d]/g, "") || null
    : normalizarTelefono(rawTo);
  if (!to) return NextResponse.json({ error: "falta ?to= con un número válido" }, { status: 400 });

  const template = url.searchParams.get("template") || "hello_world";
  const lang = url.searchParams.get("lang") || (template === "hello_world" ? "en_US" : "es");
  const vars = [url.searchParams.get("v1"), url.searchParams.get("v2")].filter(Boolean) as string[];

  try {
    const wamid = await enviarPlantilla(to, template, lang, vars);
    return NextResponse.json({ ok: true, to, template, wamid });
  } catch (e) {
    return NextResponse.json({ ok: false, to, template, error: String(e) }, { status: 502 });
  }
}
