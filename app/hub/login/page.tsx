import type { Metadata } from "next";
import { HubLogin } from "@/components/hub/HubLogin";

export const metadata: Metadata = {
  title: "Business Hub — Ingresar",
  description: "Accedé al centro de control de tu negocio.",
  robots: { index: false, follow: false },
};

export default function HubLoginPage() {
  return <HubLogin />;
}
