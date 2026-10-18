import type { Metadata } from "next";
import Link from "next/link";
import "./como.css";
import { GradientButton } from "@/components/marketing/GradientButton";

export const metadata: Metadata = {
  title: "Cómo trabajamos",
  description:
    "Cada proyecto necesita un alcance verificable y una forma de comprobar que funciona en la operación. Así trabajamos en RUN.",
  alternates: { canonical: "/como-trabajamos" },
};

const STEPS = [
  { n: "01", title: "Entender", in: "Contexto, herramientas actuales y un ejemplo de tarea.", out: "Problema y objetivo." },
  { n: "02", title: "Delimitar", in: "Las restricciones del proyecto.", out: "Recorridos, prioridades, dependencias y criterios de aceptación." },
  { n: "03", title: "Construir y validar", in: "El alcance acordado.", out: "Versiones y evidencia de pruebas." },
  { n: "04", title: "Operar y evolucionar", in: "Una versión aceptada.", out: "Documentación, responsables y condiciones de continuidad." },
];

const BEFORE = [
  "Qué incluye la primera etapa.",
  "Qué queda fuera.",
  "Qué sistemas se integran.",
  "Qué acceso necesita el equipo.",
  "Cómo se valida la entrega.",
  "Qué costos y condiciones corresponden al proyecto.",
];

export default function ComoTrabajamosPage() {
  return (
    <section className="m-section cw-page">
      <div className="m-container cw-inner">
        <header className="cw-head">
          <p className="m-eyebrow">CÓMO TRABAJAMOS</p>
          <h1 className="cw-h1">Primero entendemos el trabajo. Después construimos la solución.</h1>
          <p className="cw-lead">
            Cada proyecto necesita un alcance verificable y una forma de comprobar que funciona en la
            operación.
          </p>
        </header>

        <ol className="cw-steps">
          {STEPS.map((s) => (
            <li key={s.n} className="cw-step">
              <span className="m-mono cw-n">{s.n}</span>
              <h2 className="cw-steptitle">{s.title}</h2>
              <p className="cw-io"><span className="cw-iolabel m-mono">Recibe</span> {s.in}</p>
              <p className="cw-io"><span className="cw-iolabel m-mono">Produce</span> {s.out}</p>
            </li>
          ))}
        </ol>

        <div className="cw-block">
          <h2 className="cw-h2">Qué queda definido antes de comenzar.</h2>
          <ul className="cw-list">
            {BEFORE.map((b) => <li key={b}>{b}</li>)}
          </ul>
          <p className="cw-note">No presentamos una semana ni un precio universal.</p>
        </div>

        <div className="cw-block">
          <h2 className="cw-h2">Continuidad después de la entrega.</h2>
          <p>
            El mantenimiento, el soporte y la evolución se acuerdan según el sistema. La propuesta
            identifica responsabilidades, dependencias de terceros y condiciones para ampliar el
            alcance.
          </p>
        </div>

        <div className="cw-block">
          <h2 className="cw-h2">Si ya tenés algo construido.</h2>
          <p>
            Podemos evaluar la base existente antes de decidir qué conviene conservar. El diagnóstico
            puede terminar en una integración, una mejora puntual o un desarrollo nuevo.
          </p>
        </div>

        <div className="cw-cta">
          <p className="cw-ctatext">Empecemos por el proceso que querés mejorar.</p>
          <div className="cw-ctabtns">
            <GradientButton href="/contacto">Hablemos de tu proyecto</GradientButton>
            <Link href="/runit-scan" className="m-btn-ghost">Ordenar prioridades con Runit Scan</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
