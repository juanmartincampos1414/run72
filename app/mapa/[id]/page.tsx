import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../../marketing.css";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { MapaView, type MapData } from "@/components/mapa/MapaView";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mapa de IA",
  description: "Tu roadmap de adopción de IA por fases, armado por RUN.",
  robots: { index: false, follow: false },
};

export default async function MapaPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isSupabaseConfigured()) notFound();

  const { data, error } = await getSupabaseAdmin()
    .from("ia_maps")
    .select("negocio, resumen, equipo, fases, areas, conexiones")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) notFound();

  return (
    <MarketingShell withSmooth={false} theme="warm">
      <div className="run-warm-tool relative overflow-hidden pt-28 pb-24 md:pt-36">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-10%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,106,42,0.16),transparent_60%)] blur-2xl" />
        </div>
        <div className="container-x">
          <div className="mx-auto max-w-6xl">
            <MapaView data={data as unknown as MapData} print cta />
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
