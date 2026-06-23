-- ============================================================
-- RUN72 — Cotizador v2: 3 tipos de proyecto nuevos
-- crm / redes / automatizaciones ya existían en la DB como type='addon'
-- (con sus precios reales). Acá los pasamos a type='project' para que
-- aparezcan como tipos seleccionables, PRESERVANDO sus precios actuales.
-- Sus funcionalidades (microservicios) ya están sembradas en migration_phaseA.sql.
--
-- NOTA: el cotizador ya funciona aunque NO corras esto, porque /api/leads
-- resuelve el precio por slug. Esta migración deja el dato consistente para
-- el admin y futuras vistas. Ejecutar en Supabase → SQL Editor → Run.
-- ============================================================

insert into public.services (slug, name, category, description, price_ars, type, active, sort_order)
values
  ('crm',             'CRM / Sistema interno',         'Desarrollo', 'Sistema de gestión interna: pipeline, contactos y reportes.', 900000, 'project', true, 7),
  ('redes',           'Redes sociales',                'Marketing',  'Estrategia, contenido y presencia en redes lista para operar.', 200000, 'project', true, 8),
  ('automatizaciones','Automatización / integraciones','Desarrollo', 'Flujos automáticos e integraciones entre tus herramientas.', 400000, 'project', true, 9)
on conflict (slug) do update
  set type = 'project', active = true;  -- preserva precio/nombre/descr. existentes

-- Verificación:
-- select slug, name, price_ars, type, active from public.services where slug in ('crm','redes','automatizaciones');
