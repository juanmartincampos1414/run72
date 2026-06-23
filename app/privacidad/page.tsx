import type { Metadata } from "next";
import { LegalShell, LegalSection } from "@/components/LegalShell";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Política de Privacidad — RUN72",
  description: "Cómo RUN72 recopila, usa y protege tus datos.",
  robots: { index: true, follow: true },
};

export default function PrivacidadPage() {
  return (
    <LegalShell title="Política de Privacidad" updated="Junio 2026">
      <p className="text-sm leading-relaxed text-muted">
        En RUN72 cuidamos tus datos. Esta política explica qué información recopilamos,
        cómo la usamos y qué derechos tenés sobre ella.
      </p>

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
          por el equipo de RUN72 mediante enlaces temporales. Se utilizan exclusivamente para
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
