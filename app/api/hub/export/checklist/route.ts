import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { requireActiveHub } from "@/lib/hub-guard";
import { HUB_AREAS, STATUS_LABEL, overallScore, type HubStatus } from "@/lib/hub";

export const dynamic = "force-dynamic";

function csvCell(s: string): string {
  return `"${String(s).replace(/"/g, '""')}"`;
}

/** Exporta el checklist + estado del negocio en CSV (abre en Excel). */
export async function GET() {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "No configurado." }, { status: 503 });
  const auth = await requireActiveHub();
  if ("response" in auth) return auth.response;
  const user = auth.user;

  const { data } = await getSupabaseAdmin()
    .from("hub_checklist")
    .select("item_key, status")
    .eq("user_id", user.id);

  const statuses: Record<string, HubStatus> = {};
  for (const r of data ?? []) statuses[r.item_key as string] = r.status as HubStatus;

  const rows: string[] = [["Área", "Ítem", "Estado"].map(csvCell).join(",")];
  for (const a of HUB_AREAS) {
    for (const item of a.items) {
      const st = statuses[item.key] ?? "pendiente";
      rows.push([a.label, item.label, STATUS_LABEL[st]].map(csvCell).join(","));
    }
  }
  rows.push("");
  rows.push([csvCell("Score general"), csvCell(""), csvCell(`${overallScore(statuses)}/100`)].join(","));

  const csv = "﻿" + rows.join("\r\n"); // BOM para acentos en Excel
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="run72-checklist.csv"`,
    },
  });
}
