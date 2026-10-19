import type { Metadata } from "next";
import { QuoteEntry } from "@/components/quote/QuoteEntry";

export const metadata: Metadata = {
  title: "Cotizá tu proyecto",
  description:
    "Armá tu proyecto y obtené una estimación con las reglas de RUN, por formulario o hablando con nuestro asistente.",
  robots: { index: false, follow: true },
};

export default function CotizarPage() {
  return <QuoteEntry />;
}
