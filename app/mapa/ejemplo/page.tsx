import type { Metadata } from "next";
import "../../marketing.css";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { MapaView, type MapData } from "@/components/mapa/MapaView";

export const metadata: Metadata = {
  title: "Mapa de IA — Ejemplo",
  description:
    "Un ejemplo del Mapa de IA que te entregamos: tu roadmap de adopción de IA por fases y áreas, con herramientas y responsables, listo para ejecutar.",
};

const EJEMPLO: MapData = {
  negocio: "Cadena de cafeterías",
  resumen:
    "Un ejemplo de lo que te entregamos: de usar IA en cosas sueltas a tenerla en el corazón de la operación, en 4 fases.",
  equipo: [
    { nombre: "Carla Ríos", rol: "Dirección" },
    { nombre: "Martín Herrera", rol: "Operaciones" },
    { nombre: "Lucía Benítez", rol: "Atención al cliente" },
    { nombre: "Sofía Giménez", rol: "Marketing" },
    { nombre: "Diego Ponce", rol: "Sistemas" },
  ],
  fases: [
    { nombre: "Fase 1 · Primeros pasos", objetivo: "Quick wins con IA en lo que ya hacés." },
    { nombre: "Fase 2 · Integración", objetivo: "La IA entra a los procesos clave." },
    { nombre: "Fase 3 · Escala", objetivo: "Medir, escalar y llevarla a tus clientes." },
    { nombre: "Nativo IA", objetivo: "Agentes y decisiones asistidas en el núcleo." },
  ],
  areas: [
    {
      area: "Tu operación", short: "Operación", service: "Automatizaciones y agentes de IA",
      resultado: "Menos tareas manuales y mejor seguimiento de faltantes y reposición.",
      celdas: [
        { accion: "Resúmenes del día y pedidos a proveedores con IA.", responsable: "Martín Herrera", herramienta: "ChatGPT", tipo: "contenido" },
        { accion: "Control de stock automático con alertas de faltantes.", responsable: "Diego Ponce", herramienta: "Sheets + n8n", tipo: "automatizacion" },
        { accion: "Agente que arma la reposición y las compras.", responsable: "Martín Herrera", herramienta: "n8n", tipo: "agente" },
        { accion: "Operación coordinada por agentes, con supervisión.", responsable: "Carla Ríos", herramienta: "Agentes IA", tipo: "agente" },
      ],
    },
    {
      area: "Tus clientes", short: "Clientes", service: "Web + marketing con IA",
      resultado: "Seguimiento de consultas y acciones de atención.",
      celdas: [
        { accion: "Respuestas automáticas por WhatsApp e Instagram.", responsable: "Lucía Benítez", herramienta: "WhatsApp Business", tipo: "chatbot" },
        { accion: "Contenido y promos con IA, medidos por sucursal.", responsable: "Sofía Giménez", herramienta: "ChatGPT", tipo: "contenido" },
        { accion: "Fidelización personalizada según lo que consume.", responsable: "Sofía Giménez", herramienta: "CRM", tipo: "datos" },
        { accion: "Ofertas predictivas por horario, clima y demanda.", responsable: "Diego Ponce", herramienta: "Modelo predictivo", tipo: "analitica" },
      ],
    },
    {
      area: "Tus datos y herramientas", short: "Herramientas", service: "Plataforma, datos y CRM a medida",
      resultado: "Decisiones con datos reales, no a ojo.",
      celdas: [
        { accion: "Centralizar ventas y stock en un solo lugar.", responsable: "Diego Ponce", herramienta: "Google Sheets", tipo: "datos" },
        { accion: "CRM con historial de cada cliente y accesos por rol.", responsable: "Diego Ponce", herramienta: "CRM", tipo: "integracion" },
        { accion: "Tablero con métricas por sucursal en tiempo real.", responsable: "Carla Ríos", herramienta: "Looker Studio", tipo: "analitica" },
        { accion: "Datos que alimentan decisiones de menú y precios.", responsable: "Carla Ríos", herramienta: "BI + IA", tipo: "analitica" },
      ],
    },
    {
      area: "Tu equipo", short: "Equipo", service: "Formación e implementación con tu gente",
      resultado: "Un equipo que usa IA todos los días, sin miedo.",
      celdas: [
        { accion: "Capacitación práctica de IA para encargados.", responsable: "Carla Ríos", herramienta: "Capacitación acordada", tipo: "capacitacion" },
        { accion: "Un referente de IA por sucursal.", responsable: "Martín Herrera", herramienta: "Playbook", tipo: "capacitacion" },
        { accion: "Playbooks de uso para cada puesto.", responsable: "Lucía Benítez", herramienta: "Notion", tipo: "contenido" },
        { accion: "Cultura IA-first: el equipo propone mejoras.", responsable: "Carla Ríos", herramienta: "", tipo: "capacitacion" },
      ],
    },
    {
      area: "Tu estrategia", short: "Estrategia", service: "Estrategia y hoja de ruta de IA",
      resultado: "La IA empuja el crecimiento, medido en plata.",
      celdas: [
        { accion: "Definir 3 prioridades de IA para el año.", responsable: "Carla Ríos", herramienta: "RUN", tipo: "analitica" },
        { accion: "Medir el impacto en costos y ventas.", responsable: "Diego Ponce", herramienta: "Looker Studio", tipo: "analitica" },
        { accion: "Revisión trimestral de iniciativas.", responsable: "Carla Ríos", herramienta: "OKRs", tipo: "gobernanza" },
        { accion: "La IA guía la expansión y la apertura de locales.", responsable: "Carla Ríos", herramienta: "IA + BI", tipo: "analitica" },
      ],
    },
    {
      area: "Tus reglas", short: "Reglas", service: "Buenas prácticas y uso responsable",
      resultado: "Usás IA con tranquilidad y confianza del cliente.",
      celdas: [
        { accion: "Reglas básicas de qué se puede cargar y qué no.", responsable: "Diego Ponce", herramienta: "Política interna", tipo: "gobernanza" },
        { accion: "Protección de datos de clientes y empleados.", responsable: "Diego Ponce", herramienta: "Accesos + 2FA", tipo: "gobernanza" },
        { accion: "Política de uso vigente y conocida por todos.", responsable: "Carla Ríos", herramienta: "Documento", tipo: "contenido" },
        { accion: "Gobernanza demostrable ante proveedores y socios.", responsable: "Carla Ríos", herramienta: "Auditoría", tipo: "gobernanza" },
      ],
    },
  ],
  conexiones: [
    { desde: "Tus datos y herramientas", hasta: "Tus clientes", etiqueta: "Datos de consumo" },
    { desde: "Tu operación", hasta: "Tus datos y herramientas", etiqueta: "Ventas y stock" },
    { desde: "Tus clientes", hasta: "Tu estrategia", etiqueta: "Feedback y demanda" },
    { desde: "Tu equipo", hasta: "Tu operación", etiqueta: "Ejecución diaria" },
    { desde: "Tus reglas", hasta: "Tus datos y herramientas", etiqueta: "Qué se puede usar" },
  ],
};

export default function MapaEjemploPage() {
  return (
    <MarketingShell withSmooth={false} theme="warm">
      <div className="run-warm-tool relative overflow-hidden pt-28 pb-24 md:pt-36">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-10%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,106,42,0.16),transparent_60%)] blur-2xl" />
        </div>
        <div className="container-x">
          <div className="mx-auto max-w-6xl">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-violet" />
              Ejemplo de entrega
            </span>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Ejemplo de un mapa de implementación de IA
            </h1>
            <p className="mt-3 max-w-2xl text-muted">
              Empresa, personas y acciones ficticias para mostrar el formato de trabajo. Es una
              propuesta ilustrativa, no resultados ya logrados.
            </p>
            <div className="mt-8">
              <MapaView data={EJEMPLO} print cta />
            </div>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
