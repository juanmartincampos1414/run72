-- ============================================================
-- RUN72 — Seed de servicios (precios iniciales, editables en /admin)
-- Ejecutar DESPUÉS de schema.sql
-- ============================================================

insert into public.services (slug, name, category, description, price_ars, type, sort_order)
values
  -- Paso 1: tipo de proyecto
  ('landing',     'Landing Page',         'Desarrollo', 'Página única de alta conversión lista para vender.',                350000,  'project', 1),
  ('sitio',       'Sitio Web',            'Desarrollo', 'Sitio institucional multipágina, rápido y optimizado.',              600000,  'project', 2),
  ('ecommerce',   'Ecommerce',            'Desarrollo', 'Tienda online con catálogo, carrito y medios de pago.',              1200000, 'project', 3),
  ('plataforma',  'Plataforma Web',       'Desarrollo', 'Aplicación web a medida con lógica de negocio y usuarios.',          2500000, 'project', 4),

  -- Paso 3: servicios adicionales
  ('logo',        'Logo',                 'Branding',   'Diseño de logotipo e isologo profesional.',                          150000,  'addon', 10),
  ('manual',      'Manual de marca',      'Branding',   'Sistema visual completo: colores, tipografías y usos.',              200000,  'addon', 11),
  ('estrategia',  'Estrategia comercial', 'Estrategia', 'Propuesta de valor, posicionamiento y mensaje de venta.',           200000,  'addon', 12),
  ('redes',       'Redes sociales',       'Marketing',  'Preparación de perfiles y kit inicial de contenidos.',               180000,  'addon', 13),
  ('campanas',    'Campañas publicitarias','Marketing', 'Setup de campañas y creatividades para captar clientes.',           250000,  'addon', 14),
  ('automatizaciones','Automatizaciones', 'Tecnología', 'Flujos automáticos que ahorran trabajo manual.',                     400000,  'addon', 15),
  ('crm',         'CRM',                  'Tecnología', 'Sistema para gestionar y dar seguimiento a tus clientes.',           500000,  'addon', 16)
on conflict (slug) do nothing;
