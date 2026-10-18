import type { Metadata } from "next";
import Link from "next/link";
import "./contact.css";
import { SITE } from "@/lib/marketing/content";
import { ContactForm } from "./ContactForm";
import { OpenRunitButton } from "@/components/marketing/OpenRunitButton";

export const metadata: Metadata = {
  title: "Hablemos de tu proyecto",
  description:
    "Contanos qué proceso querés mejorar, las herramientas que usás y el resultado que buscás. Evaluamos el alcance y el siguiente paso.",
  alternates: { canonical: "/contacto" },
};

type Interest = "software" | "agentes" | "automatizacion" | "orientacion";
const VALID: Interest[] = ["software", "agentes", "automatizacion", "orientacion"];

export default async function ContactoPage({
  searchParams,
}: {
  searchParams: Promise<{ interes?: string }>;
}) {
  const { interes } = await searchParams;
  const initialInterest = VALID.includes(interes as Interest) ? (interes as Interest) : undefined;

  return (
    <section className="m-section ct-page">
      <div className="m-container ct-grid">
        <div className="ct-aside">
          <h1 className="ct-h1">Contanos qué necesitás resolver.</h1>
          <p className="ct-lead">
            Compartí el proceso que querés mejorar, las herramientas que usás y el resultado que
            buscás. Vamos a usar esa información para evaluar el alcance y el siguiente paso.
          </p>
          <p className="ct-alt">
            También podés escribir a <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
          </p>
          <div className="ct-secondary">
            <Link href="/cotizar" className="m-btn-ghost">Ya sé qué necesito: abrir cotizador</Link>
            <OpenRunitButton className="m-btn-ghost">Hablar con Runit</OpenRunitButton>
          </div>
        </div>

        <div className="ct-formwrap">
          <ContactForm initialInterest={initialInterest} />
        </div>
      </div>
    </section>
  );
}
