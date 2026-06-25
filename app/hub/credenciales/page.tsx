import type { Metadata } from "next";
import { HubCredentials } from "@/components/hub/HubCredentials";

export const metadata: Metadata = {
  title: "Business Hub — Credenciales",
  description: "Tu bóveda privada de accesos.",
  robots: { index: false, follow: false },
};

export default function HubCredencialesPage() {
  return <HubCredentials />;
}
