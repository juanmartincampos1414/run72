import type { Metadata } from "next";
import { HubPartners } from "@/components/hub/HubPartners";

export const metadata: Metadata = {
  title: "Business Hub — Partners",
  description: "Proveedores recomendados por RUN72.",
  robots: { index: false, follow: false },
};

export default function HubPartnersPage() {
  return <HubPartners />;
}
