import type { Metadata } from "next";
import { LegalShell, LegalSection } from "@/components/LegalShell";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Términos y condiciones del servicio de RUN.",
  robots: { index: true, follow: true },
};

export default function TerminosPage() {
  return (
    <LegalShell title="Términos y Condiciones" updated="Octubre 2026">
      <p className="text-sm leading-relaxed text-muted">
        Estos Términos y Condiciones regulan la contratación de los servicios de RUN.
        Al contratar y abonar el anticipo, aceptás lo aquí descripto.
      </p>
      <p className="mt-3 rounded-2xl border border-line bg-surface/40 p-4 text-sm leading-relaxed text-muted">
        <strong className="text-fg">Dos recorridos.</strong> Las condiciones de pago, anticipo y plazo
        descriptas a continuación aplican a <strong className="text-fg">RUN Express</strong>, la
        contratación online por el cotizador. Para desarrollos a medida (software, agentes de IA e
        integraciones), el alcance, los plazos, los pagos, la propiedad y el soporte se definen en la
        propuesta y el contrato de cada proyecto. Enviar una consulta no inicia producción ni confirma
        una contratación.
      </p>

      <LegalSection heading="1. Alcance del servicio">
        <p>
          RUN Express comprende productos digitales estandarizados, como landing pages, sitios web
          corporativos, ecommerce de alcance cerrado, branding e identidad y otros servicios
          expresamente disponibles en el cotizador. El alcance de cada contratación es el que el
          cliente selecciona y queda reflejado en el resumen y el presupuesto.
        </p>
        <p>
          Los proyectos de software a medida, plataformas, CRM, sistemas internos, agentes de
          inteligencia artificial e integraciones o automatizaciones que requieran diagnóstico no se
          contratan mediante RUN Express. Su alcance, plazo, precio, propiedad intelectual, soporte y
          condiciones se definen mediante una propuesta y un contrato específicos.
        </p>
        <p>
          Solo se incluyen los servicios, funcionalidades y microservicios efectivamente
          seleccionados y abonados. Todo lo no detallado en el presupuesto no forma parte del alcance.
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
          el comprobante y RUN lo valida antes de iniciar.
        </p>
      </LegalSection>

      <LegalSection heading="4. RUN Express: validación y plazo">
        <p>
          Esta sección aplica solo a proyectos contratados por RUN Express. Los plazos de RUN Express
          dependen del producto seleccionado, del alcance confirmado y de la recepción completa de la
          información, los materiales y los accesos necesarios. El plazo aplicable se informa antes del
          inicio de la producción. Las demoras en la entrega de materiales o accesos por parte del
          cliente extienden el plazo en la misma medida.
        </p>
        <p>
          Si luego de revisar el proyecto determinamos que no puede ejecutarse dentro del
          alcance de RUN, te informaremos esta situación antes de comenzar y te
          devolveremos el 100% del anticipo abonado.
        </p>
      </LegalSection>

      <LegalSection heading="5. Propiedad intelectual">
        <p>
          Al completarse el pago total, el producto entregado es 100% propiedad del cliente.
          Entregamos lo que corresponda a cada producto (por ejemplo, el código fuente y los accesos
          en los desarrollos web, y los archivos editables y manuales en identidad y branding), junto
          con la documentación necesaria para que el cliente administre el producto con independencia y
          pueda continuarlo con cualquier proveedor en el futuro.
        </p>
        <p>
          RUN puede utilizar componentes, librerías y herramientas de terceros sujetas a
          sus propias licencias. RUN podrá mencionar el proyecto como caso de referencia,
          salvo solicitud expresa del cliente en contrario.
        </p>
      </LegalSection>

      <LegalSection heading="6. Entrega final">
        <p>
          La entrega es digital e incluye exclusivamente los entregables correspondientes al producto
          y al alcance detallados en el presupuesto. En desarrollos web puede incluir la versión
          funcional, el código fuente, los accesos acordados y la documentación técnica aplicable. En
          identidad y branding puede incluir los archivos editables, exportaciones y manuales definidos
          en el alcance. En servicios de contenidos, redes o campañas se entregan las piezas, documentos
          y materiales expresamente contratados. Las cuentas, licencias y credenciales de servicios de
          terceros se rigen por sus propias condiciones y por lo acordado en cada contratación.
        </p>
      </LegalSection>

      <LegalSection heading="7. Limitaciones de responsabilidad">
        <p>
          RUN entrega el proyecto según el alcance contratado. No nos responsabilizamos
          por: contenidos, datos o materiales provistos por el cliente; servicios de
          terceros (hosting, dominios, pasarelas de pago, APIs externas) y sus eventuales
          fallas o costos; usos del proyecto distintos a los previstos; ni por resultados
          comerciales, ventas o métricas, que dependen de múltiples factores ajenos al
          desarrollo.
        </p>
        <p>
          En todos los casos, la responsabilidad de RUN se limita al monto efectivamente
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
          no puede ejecutarse dentro del alcance de RUN y lo informamos antes de comenzar.
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
