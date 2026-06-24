import type { Metadata } from "next";
import { QuoteEntry } from "@/components/quote/QuoteEntry";

export const metadata: Metadata = {
  title: "Cotizá tu proyecto",
  description:
    "Armá tu negocio digital y obtené un presupuesto en tiempo real, por formulario o hablando con nuestro asistente. RUN72 lo deja listo en 72 horas.",
  robots: { index: false, follow: true },
};

export default function CotizarPage() {
  return <QuoteEntry />;
}
