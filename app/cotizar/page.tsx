import type { Metadata } from "next";
import { QuoteEntry } from "@/components/quote/QuoteEntry";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import type { Service, Microservice } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cotizá tu proyecto",
  description:
    "Armá tu producto RUN Express y obtené una estimación con las reglas de RUN, por formulario o hablando con nuestro asistente.",
  robots: { index: false, follow: true },
};

// Pre-carga el catálogo en el servidor para que el cotizador no muestre un paso
// vacío mientras hace fetch (auditoría).
async function loadCatalog(): Promise<{ services: Service[]; microservices: Microservice[] }> {
  if (!isSupabaseConfigured()) return { services: [], microservices: [] };
  try {
    const supabase = getSupabaseAdmin();
    const { data: services } = await supabase
      .from("services")
      .select("id, slug, name, category, description, price_ars, type, active, sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true });
    const { data: micros } = await supabase
      .from("microservices")
      .select("id, service_slug, group_name, slug, name, description, price_ars, active, default_on, sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true });
    return { services: (services ?? []) as Service[], microservices: (micros ?? []) as Microservice[] };
  } catch {
    return { services: [], microservices: [] };
  }
}

export default async function CotizarPage() {
  const { services, microservices } = await loadCatalog();
  return <QuoteEntry initialServices={services} initialMicros={microservices} />;
}
