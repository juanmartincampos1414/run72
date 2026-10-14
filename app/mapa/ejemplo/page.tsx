import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/sections/Footer";
import { MapaView, type MapData } from "@/components/mapa/MapaView";

export const metadata: Metadata = {
  title: "Mapa de IA — Ejemplo · RUN72",
  description:
    "Un ejemplo del Mapa de IA que te entregamos: tu roadmap de adopción de IA por fases y áreas, listo para ejecutar.",
};

const EJEMPLO: MapData = {
  negocio: "Cadena de cafeterías",
  resumen:
    "Un ejemplo de lo que te entregamos: de usar IA en cosas sueltas a tenerla en el corazón de la operación, en 4 fases.",
  fases: [
    { nombre: "Fase 1 · Primeros pasos", objetivo: "Quick wins con IA en lo que ya hacés." },
    { nombre: "Fase 2 · Integración", objetivo: "La IA entra a los procesos clave." },
    { nombre: "Fase 3 · Escala", objetivo: "Medir, escalar y llevarla a tus clientes." },
    { nombre: "Nativo IA", objetivo: "Agentes y decisiones asistidas en el núcleo." },
  ],
  areas: [
    {
      area: "Tu operación", short: "Operación", service: "Automatizaciones y agentes de IA",
      acciones: [
        "IA para resúmenes del día y pedidos a proveedores.",
        "Control de stock automático con alertas de faltantes.",
        "Agente que arma la reposición y las compras sugeridas.",
        "Operación coordinada por agentes, con supervisión del encargado.",
      ],
    },
    {
      area: "Tus clientes", short: "Clientes", service: "Web + marketing con IA",
      acciones: [
        "Respuestas automáticas por WhatsApp e Instagram.",
        "Contenido y promos con IA, medidos por sucursal.",
        "Fidelización personalizada según lo que consume cada cliente.",
        "Ofertas predictivas por horario, clima y demanda.",
      ],
    },
    {
      area: "Tus datos y herramientas", short: "Herramientas", service: "Plataforma, datos y CRM a medida",
      acciones: [
        "Centralizar ventas y stock en un solo lugar.",
        "CRM con historial de cada cliente y accesos por rol.",
        "Tablero con métricas por sucursal en tiempo real.",
        "Datos que alimentan decisiones de menú y precios.",
      ],
    },
    {
      area: "Tu equipo", short: "Equipo", service: "Formación e implementación con tu gente",
      acciones: [
        "Capacitación práctica de IA para encargados.",
        "Un referente de IA por sucursal.",
        "Playbooks de uso para cada puesto.",
        "Cultura IA-first: el equipo propone mejoras.",
      ],
    },
    {
      area: "Tu estrategia", short: "Estrategia", service: "Estrategia y hoja de ruta de IA",
      acciones: [
        "Definir 3 prioridades de IA para el año.",
        "Medir el impacto en costos y ventas.",
        "Revisión trimestral de iniciativas.",
        "La IA guía la expansión y la apertura de locales.",
      ],
    },
    {
      area: "Tus reglas", short: "Reglas", service: "Buenas prácticas y uso responsable",
      acciones: [
        "Reglas básicas de qué se puede cargar y qué no.",
        "Protección de datos de clientes y empleados.",
        "Política de uso vigente y conocida por todos.",
        "Gobernanza demostrable ante proveedores y socios.",
      ],
    },
  ],
};

export default function MapaEjemploPage() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden pt-28 pb-24 md:pt-36">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-10%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.18),transparent_60%)] blur-2xl" />
        </div>
        <div className="container-x">
          <div className="mx-auto max-w-6xl">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-muted print:hidden">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-violet" />
              Ejemplo de entrega
            </span>
            <MapaView data={EJEMPLO} print cta />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
