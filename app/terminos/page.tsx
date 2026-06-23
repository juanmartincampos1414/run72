import type { Metadata } from "next";
import { LegalShell, LegalSection } from "@/components/LegalShell";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Términos y Condiciones — RUN72",
  description: "Términos y condiciones del servicio de RUN72.",
  robots: { index: true, follow: true },
};

export default function TerminosPage() {
  return (
    <LegalShell title="Términos y Condiciones" updated="Junio 2026">
      <p className="text-sm leading-relaxed text-muted">
        Estos Términos y Condiciones regulan la contratación de los servicios de RUN72.
        Al contratar y abonar el anticipo, aceptás lo aquí descripto.
      </p>

      <LegalSection heading="1. Alcance del servicio">
        <p>
          RUN72 desarrolla y entrega proyectos digitales (sitios web, landing pages,
          ecommerce, plataformas, CRM, branding, redes y automatizaciones) con un modelo
          de ejecución rápida. El alcance de cada proyecto es exactamente el que el cliente
          selecciona en el cotizador y queda reflejado en el resumen y el presupuesto.
        </p>
        <p>
          Solo se incluyen los servicios, funcionalidades y microservicios efectivamente
          seleccionados y abonados. Todo lo no detallado en el presupuesto no forma parte
          del alcance.
        </p>
      </LegalSection>

      <LegalSection heading="2. Modalidad de contratación">
        <p>
          La contratación se realiza de forma online a través del cotizador. El cliente
          arma su proyecto, obtiene el precio y confirma la contratación abonando el
          anticipo. Los precios mostrados se expresan en pesos argentinos (ARS) y, salvo
          indicación de “precio final”, no incluyen IVA, que se detalla por separado en el
          checkout.
        </p>
      </LegalSection>

      <LegalSection heading="3. Pago de anticipo">
        <p>
          Para iniciar la producción se abona un anticipo del 30% del total. El 70%
          restante se abona al finalizar la entrega. El anticipo puede abonarse por
          MercadoPago o por transferencia bancaria; en este último caso, el cliente envía
          el comprobante y RUN72 lo valida antes de iniciar.
        </p>
      </LegalSection>

      <LegalSection heading="4. Validación de proyectos y plazo de 72 horas">
        <p>
          El plazo de 72 horas comienza una vez confirmado el anticipo y recibida toda la
          información, materiales y accesos necesarios por parte del cliente. Las demoras en
          la entrega de materiales o accesos por parte del cliente extienden el plazo en la
          misma medida.
        </p>
        <p>
          Si luego de revisar el proyecto determinamos que no puede ejecutarse dentro del
          alcance de RUN72, te informaremos esta situación antes de comenzar y te
          devolveremos el 100% del anticipo abonado.
        </p>
      </LegalSection>

      <LegalSection heading="5. Propiedad intelectual">
        <p>
          Al completarse el pago total, el proyecto entregado es 100% propiedad del cliente.
          Entregamos el código fuente, los accesos y la documentación necesarios para que el
          cliente administre el proyecto con total independencia y pueda continuarlo con
          cualquier proveedor en el futuro.
        </p>
        <p>
          RUN72 puede utilizar componentes, librerías y herramientas de terceros sujetas a
          sus propias licencias. RUN72 podrá mencionar el proyecto como caso de referencia,
          salvo solicitud expresa del cliente en contrario.
        </p>
      </LegalSection>

      <LegalSection heading="6. Entrega final">
        <p>
          La entrega es digital e incluye: el proyecto funcional listo para operar, el
          código fuente completo, los accesos y credenciales organizados, un documento
          maestro con las configuraciones y una entrega preparada para su continuidad con
          cualquier proveedor.
        </p>
      </LegalSection>

      <LegalSection heading="7. Limitaciones de responsabilidad">
        <p>
          RUN72 entrega el proyecto según el alcance contratado. No nos responsabilizamos
          por: contenidos, datos o materiales provistos por el cliente; servicios de
          terceros (hosting, dominios, pasarelas de pago, APIs externas) y sus eventuales
          fallas o costos; usos del proyecto distintos a los previstos; ni por resultados
          comerciales, ventas o métricas, que dependen de múltiples factores ajenos al
          desarrollo.
        </p>
        <p>
          En todos los casos, la responsabilidad de RUN72 se limita al monto efectivamente
          abonado por el cliente por el proyecto en cuestión.
        </p>
      </LegalSection>

      <LegalSection heading="8. Soporte de 30 días">
        <p>
          El proyecto incluye 30 días corridos de soporte posteriores a la entrega. El
          soporte cubre la <strong>corrección de errores</strong> sobre lo entregado. No
          incluye nuevas funcionalidades, cambios de alcance ni rediseños, que se cotizan
          por separado.
        </p>
        <p>El proyecto incluye además una (1) instancia de revisión sobre el resultado.</p>
      </LegalSection>

      <LegalSection heading="9. Política de cancelación">
        <p>
          El cliente puede cancelar antes del inicio de la producción y recibir el reintegro
          del anticipo. Una vez iniciada la producción, el anticipo cubre el trabajo ya en
          curso y no es reintegrable, salvo lo previsto en la política de reembolso.
        </p>
      </LegalSection>

      <LegalSection heading="10. Política de reembolso">
        <p>
          Reintegramos el 100% del anticipo si, tras revisar el proyecto, determinamos que
          no puede ejecutarse dentro del alcance de RUN72 y lo informamos antes de comenzar.
          Los reintegros se realizan por el mismo medio de pago utilizado, dentro de los
          plazos operativos del proveedor de pago correspondiente.
        </p>
      </LegalSection>

      <LegalSection heading="Contacto">
        <p>
          Ante cualquier consulta sobre estos términos, escribinos a{" "}
          <a href={`mailto:${SITE.email}`} className="text-brand-cyan hover:underline">
            {SITE.email}
          </a>
          .
        </p>
      </LegalSection>
    </LegalShell>
  );
}
