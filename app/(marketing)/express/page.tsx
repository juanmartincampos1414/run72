import type { Metadata } from "next";
import Link from "next/link";
import "./express.css";
import { GradientButton } from "@/components/marketing/GradientButton";

export const metadata: Metadata = {
  title: "RUN Express",
  description:
    "Webs, ecommerce e identidad digital con alcance y precio definidos, mediante un proceso simplificado. Una modalidad de RUN.",
  alternates: { canonical: "/express" },
};

const PRODUCTOS = [
  "Landing pages",
  "Webs corporativas",
  "Branding e identidad",
  "Ecommerce de alcance cerrado",
  "Redes y campañas",
];

const INCLUYE = [
  { t: "Alcance cerrado", d: "Definís el producto y las funcionalidades desde un catálogo; lo que ves es lo que se construye." },
  { t: "Precio definido", d: "Obtenés el precio en el cotizador, con IVA, anticipo del 30% y saldo del 70%." },
  { t: "Proceso simplificado", d: "Menos discovery y menos complejidad contractual: contratás y arrancamos." },
  { t: "Plazo por producto", d: "Cada producto informa su plazo una vez confirmado el alcance y recibidos los materiales. No es un plazo universal." },
];

export default function ExpressPage() {
  return (
    <>
      <section className="m-section ex-hero">
        <div className="m-container">
          <p className="m-eyebrow">UNA MODALIDAD DE RUN</p>
          <h1 className="ex-h1">RUN Express</h1>
          <p className="ex-lead">
            Webs, ecommerce e identidad digital con alcance y precio definidos, mediante un proceso
            simplificado.
          </p>
          <div className="ex-ctas">
            <GradientButton href="/cotizar">Cotizar mi proyecto</GradientButton>
            <Link href="/contacto" className="m-btn-ghost">Necesito una solución a medida</Link>
          </div>
        </div>
      </section>

      <section className="m-section ex-block">
        <div className="m-container ex-grid">
          <div>
            <h2 className="ex-h2">Qué es</h2>
            <p>
              RUN Express es la vía rápida de RUN para productos digitales estandarizados. Sirve cuando
              ya sabés qué necesitás y el alcance puede definirse de antemano, sin un desarrollo a medida.
            </p>
            <h2 className="ex-h2 ex-h2--mt">Para quién</h2>
            <p>
              Para quien necesita salir rápido con una web, un ecommerce acotado o una identidad, con un
              precio claro y un proceso simple.
            </p>
          </div>
          <div>
            <h2 className="ex-h2">Qué productos están disponibles</h2>
            <ul className="ex-list">
              {PRODUCTOS.map((p) => <li key={p}>{p}</li>)}
            </ul>
            <p className="ex-note">
              ¿Tu proyecto es software a medida, un agente de IA o integraciones? Eso necesita
              diagnóstico y alcance personalizado. <Link href="/contacto" className="ex-link">Contanos qué necesitás resolver →</Link>
            </p>
          </div>
        </div>
      </section>

      <section className="m-section ex-block">
        <div className="m-container">
          <h2 className="ex-h2">Qué incluye y cómo funciona</h2>
          <div className="ex-cards">
            {INCLUYE.map((c) => (
              <div key={c.t} className="ex-card">
                <h3 className="ex-cardt">{c.t}</h3>
                <p>{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="m-section ex-closing">
        <div className="m-container ex-closing-in">
          <p className="ex-closing-text">Armá tu producto y obtené el precio al instante.</p>
          <div className="ex-ctas">
            <GradientButton href="/cotizar">Cotizar mi proyecto</GradientButton>
            <Link href="/contacto" className="m-btn-ghost">Necesito una solución a medida</Link>
          </div>
        </div>
      </section>
    </>
  );
}
