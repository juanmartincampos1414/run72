import type { Metadata } from "next";
import { LegalShell, LegalSection } from "@/components/LegalShell";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Política de Privacidad — RUN",
  description: "Cómo RUN recopila, usa y protege tus datos.",
  robots: { index: true, follow: true },
};

export default function PrivacidadPage() {
  return (
    <LegalShell title="Política de Privacidad" updated="Octubre 2026">
      <p className="text-sm leading-relaxed text-muted">
        En RUN cuidamos tus datos. Esta política explica qué información recopilamos,
        cómo la usamos y qué derechos tenés sobre ella.
      </p>
      <p className="mt-3 rounded-2xl border border-line bg-surface/40 p-4 text-xs leading-relaxed text-faint">
        Esta versión incorpora las consultas de proyectos a medida, el asistente Runit y las
        preferencias de privacidad. Su redacción final está sujeta a revisión de los responsables de RUN.
      </p>

      <LegalSection heading="Consultas de proyectos a medida">
        <p>
          Si nos escribís por el formulario de Contacto, recopilamos el nombre, el email y,
          opcionalmente, la empresa, junto con la descripción del proceso que querés mejorar y las
          herramientas que usás. Usamos esa información para evaluar el alcance y responderte. Enviar
          una consulta no inicia una contratación.
        </p>
      </LegalSection>

      <LegalSection heading="Asistente Runit">
        <p>
          Runit es un asistente de orientación. Lo que escribís o dictás por voz se procesa para
          generar una respuesta mediante un proveedor de modelos de IA (Anthropic). No le pidas claves
          ni datos sensibles. No guardamos la conversación completa de forma persistente ni la usamos
          para otra cosa que responderte en el momento; podés trasladar un resumen al formulario si lo
          elegís. El reconocimiento de voz, cuando lo activás, usa las capacidades de tu navegador.
        </p>
      </LegalSection>

      <LegalSection heading="Preferencias de privacidad">
        <p>
          Las cookies necesarias permiten que el sitio funcione. La analítica y el marketing (incluido
          el píxel de Meta) solo se activan si das tu consentimiento, que podés cambiar cuando quieras
          desde “Ajustes de privacidad” en el pie de página.
        </p>
      </LegalSection>

      <LegalSection heading="Datos que recopilamos">
        <p>Cuando usás el cotizador o nos contactás, podemos recopilar:</p>
        <ul className="ml-5 list-disc space-y-1">
          <li>Datos de contacto: nombre, email y, opcionalmente, WhatsApp y empresa.</li>
          <li>Información del proyecto: tipo, funcionalidades, objetivos y contexto que ingresás.</li>
          <li>Archivos que adjuntes (referencias, materiales, comprobantes de pago).</li>
          <li>Datos técnicos básicos de uso del sitio.</li>
        </ul>
        <p>No solicitamos ni almacenamos datos de tarjetas: los pagos se procesan en MercadoPago.</p>
      </LegalSection>

      <LegalSection heading="Cómo usamos tus datos">
        <p>Usamos tu información únicamente para:</p>
        <ul className="ml-5 list-disc space-y-1">
          <li>Generar tu presupuesto y gestionar la contratación.</li>
          <li>Ejecutar y entregar tu proyecto.</li>
          <li>Contactarte por temas relacionados con tu proyecto.</li>
          <li>Mejorar nuestro servicio.</li>
        </ul>
        <p>No vendemos ni cedemos tus datos a terceros con fines comerciales.</p>
      </LegalSection>

      <LegalSection heading="Conservación">
        <p>
          Conservamos tus datos mientras dure la relación comercial y por el tiempo
          necesario para cumplir obligaciones legales, contables y de soporte. Luego se
          eliminan o anonimizan.
        </p>
      </LegalSection>

      <LegalSection heading="Archivos adjuntos">
        <p>
          Los archivos que subís se almacenan en un repositorio privado y solo son accesibles
          por el equipo de RUN mediante enlaces temporales. Se utilizan exclusivamente para
          ejecutar tu proyecto.
        </p>
      </LegalSection>

      <LegalSection heading="Servicios de terceros">
        <p>
          Para operar usamos proveedores como MercadoPago (pagos) y servicios de
          infraestructura y correo. Cada uno trata los datos según sus propias políticas de
          privacidad.
        </p>
      </LegalSection>

      <LegalSection heading="Tus derechos">
        <p>
          De acuerdo con la Ley 25.326 de Protección de Datos Personales, tenés derecho a
          acceder, rectificar, actualizar y solicitar la supresión de tus datos. Para
          ejercerlos, escribinos a{" "}
          <a href={`mailto:${SITE.email}`} className="text-brand-cyan hover:underline">
            {SITE.email}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection heading="Contacto">
        <p>
          Por cualquier consulta sobre el tratamiento de tus datos, escribinos a{" "}
          <a href={`mailto:${SITE.email}`} className="text-brand-cyan hover:underline">
            {SITE.email}
          </a>
          .
        </p>
      </LegalSection>
    </LegalShell>
  );
}
