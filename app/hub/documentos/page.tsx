import type { Metadata } from "next";
import { HubDocuments } from "@/components/hub/HubDocuments";

export const metadata: Metadata = {
  title: "Business Hub — Documentos",
  description: "Centro de documentos de tu negocio.",
  robots: { index: false, follow: false },
};

export default function HubDocumentosPage() {
  return <HubDocuments />;
}
