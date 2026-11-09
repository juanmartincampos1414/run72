import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { enforceRateLimit } from "@/lib/rate-limit";
import type { ProjectPreview } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 503 });
  }

  // 60/h: la página post-pago hace polling cada 8s esperando la acreditación.
  // El costo real (generación con Claude) está acotado aparte por el check de
  // pago + el cache (se genera una sola vez por lead), así que el límite acá
  // es anti-abuso, no anti-costo.
  const limited = await enforceRateLimit({
    req,
    supabase: getSupabaseAdmin(),
    endpoint: "/api/preview/generate",
    limit: 60,
  });
  if (limited) return limited;

  let leadId: string | undefined;
  try {
    ({ leadId } = await req.json());
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  if (!leadId) return NextResponse.json({ error: "Falta leadId." }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: lead } = await supabase.from("leads").select("*").eq("id", leadId).maybeSingle();
  if (!lead) return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });

  // La propuesta es visible SIN pago: es la página que el cliente ve para
  // decidir. Devolvemos SIEMPRE la propuesta (narrativa) al instante, y el
  // preview visual SOLO si ya está cacheado (lo genera el admin desde el panel).
  // No generamos en caliente acá: es un endpoint público, la generación con
  // Claude tarda ~1 min (riesgo de timeout) y cuesta plata por cada visita.
  const meta = {
    proposal: (lead.proposal as Record<string, unknown>) ?? null,
    name: (lead.name as string) ?? null,
    projectLabel: (lead.project_label as string) ?? null,
  };

  let preview: ProjectPreview | null = null;
  if (typeof lead.preview_text === "string" && lead.preview_text) {
    try {
      const cached = JSON.parse(lead.preview_text) as ProjectPreview;
      if (Array.isArray(cached.mockups) && cached.mockups.length > 0) preview = cached;
    } catch {
      /* formato viejo; lo regenera el admin */
    }
  }

  return NextResponse.json({ preview, ...meta });
}
