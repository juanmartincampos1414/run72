-- ============================================================
-- RUN72 — Alineación comercial de FAQ (contenido)
-- Actualiza garantía, revisión y hosting + agrega FAQ de soporte.
-- Ejecutar en Supabase → SQL Editor → Run. (También editable en /admin/faqs.)
-- ============================================================

-- Garantía: reflejar la garantía real (condicionada, en positivo).
update public.faqs set answer =
  'El plazo de 72 horas comienza cuando confirmás el anticipo y nos enviás la información, materiales y accesos necesarios. Si tras revisar tu proyecto determinamos que no puede ejecutarse dentro del alcance de RUN72, te avisamos antes de empezar y te devolvemos el 100% del anticipo abonado.'
where question = '¿Qué garantía tengo?';

-- Revisión: aclarar una (1) ronda.
update public.faqs set answer =
  'Incluís una (1) ronda de revisión sobre el resultado, para ajustar detalles antes del cierre del proyecto.'
where question = '¿Qué pasa si necesito cambios?';

-- Hosting y dominio: depende del proyecto.
update public.faqs set answer =
  'Puede estar incluido o no según el proyecto contratado. Lo vas a ver detallado en tu cotización antes de pagar.'
where question = '¿El hosting y dominio están incluidos?';

-- Soporte: agregar FAQ si no existe.
insert into public.faqs (question, answer, sort_order)
select
  '¿Qué incluye el soporte de 30 días?',
  'Incluye la corrección de errores sobre lo entregado durante 30 días corridos posteriores a la entrega. No incluye nuevas funcionalidades ni cambios de alcance, que se cotizan por separado.',
  11
where not exists (
  select 1 from public.faqs where question = '¿Qué incluye el soporte de 30 días?'
);
