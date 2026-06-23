import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import type { Faq } from "@/lib/types";

export const dynamic = "force-dynamic";

/** FAQs activas para la pantalla pública. */
export async function GET() {
  if (!isSupabaseConfigured()) return NextResponse.json({ faqs: [] });
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("faqs")
      .select("id, question, answer, sort_order, active")
      .eq("active", true)
      .order("sort_order", { ascending: true });
    return NextResponse.json({ faqs: (data ?? []) as Faq[] });
  } catch {
    return NextResponse.json({ faqs: [] });
  }
}
