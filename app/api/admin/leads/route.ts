import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { extractPath, signMany } from "@/lib/storage";

export const dynamic = "force-dynamic";

/** Lista los leads (más nuevos primero) para el CRM. */
export async function GET() {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const leads = data ?? [];

  // Bucket privado: firmamos comprobantes y adjuntos en un solo batch.
  const allStored: string[] = [];
  for (const l of leads) {
    if (l.comprobante_url) allStored.push(l.comprobante_url);
    if (Array.isArray(l.files)) for (const f of l.files) if (f?.url) allStored.push(f.url);
  }
  if (allStored.length > 0) {
    const signed = await signMany(allStored);
    const lookup = (stored: string | null) => {
      if (!stored) return stored;
      const p = extractPath(stored);
      return (p && signed.get(p)) || stored;
    };
    for (const l of leads) {
      if (l.comprobante_url) l.comprobante_url = lookup(l.comprobante_url);
      if (Array.isArray(l.files)) {
        l.files = l.files.map((f: { url: string }) => ({ ...f, url: lookup(f.url) }));
      }
    }
  }

  return NextResponse.json({ leads });
}
