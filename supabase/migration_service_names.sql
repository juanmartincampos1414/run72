-- ============================================================
-- RUN72 — Alinear nombres de servicios con el formulario v2
-- Renombra los servicios en la DB para que coincidan con las cards del
-- cotizador (y con el checkout). No cambia precios ni slugs.
-- Ejecutar en Supabase → SQL Editor → Run.
-- ============================================================

update public.services set name = 'Web corporativa'                  where slug = 'sitio';
update public.services set name = 'Plataforma / SaaS'                 where slug = 'plataforma';
update public.services set name = 'CRM / Sistema interno'            where slug = 'crm';
update public.services set name = 'Branding / Identidad'             where slug = 'branding';
update public.services set name = 'Automatización / Integraciones'   where slug = 'automatizaciones';
update public.services set name = 'Landing page'                      where slug = 'landing';

-- Verificación:
-- select slug, name, type, price_ars from public.services where type = 'project' order by sort_order;
