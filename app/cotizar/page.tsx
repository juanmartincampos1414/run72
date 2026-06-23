import type { Metadata } from "next";
import { QuoteConfigurator } from "@/components/quote/QuoteConfigurator";

export const metadata: Metadata = {
  title: "Cotizá tu proyecto",
  description:
    "Armá tu negocio digital paso a paso y obtené un presupuesto en tiempo real. RUN72 lo deja listo en 72 horas.",
  robots: { index: false, follow: true },
};

export default function CotizarPage() {
  return <QuoteConfigurator />;
}
