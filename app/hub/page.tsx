import type { Metadata } from "next";
import { HubDashboard } from "@/components/hub/HubDashboard";

export const metadata: Metadata = {
  title: "Business Hub — Tu negocio",
  description: "El centro de control de tu negocio.",
  robots: { index: false, follow: false },
};

export default function HubPage() {
  return <HubDashboard />;
}
