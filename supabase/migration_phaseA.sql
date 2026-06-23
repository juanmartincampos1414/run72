-- ============================================================
-- RUN72 — Fase A: Configurador granular (microservicios)
-- Ejecutar en Supabase → SQL Editor → Run
-- ============================================================

-- Cada servicio puede tener microservicios configurables (toggle on/off).
create table if not exists public.microservices (
  id           uuid primary key default gen_random_uuid(),
  service_slug text not null,                 -- referencia a services.slug
  group_name   text not null default 'General',
  slug         text not null,
  name         text not null,
  description  text,
  price_ars    bigint not null default 0,
  active       boolean not null default true,
  default_on   boolean not null default false,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (service_slug, slug)
);

create index if not exists microservices_service_idx on public.microservices (service_slug);
alter table public.microservices enable row level security;

drop trigger if exists microservices_touch on public.microservices;
create trigger microservices_touch before update on public.microservices
  for each row execute function public.touch_updated_at();

-- Microservicios seleccionados por el lead (snapshot)
alter table public.leads add column if not exists microservices_selected jsonb not null default '[]'::jsonb;

-- ------------------------------------------------------------
-- SEED de microservicios
-- ------------------------------------------------------------
insert into public.microservices (service_slug, group_name, slug, name, description, price_ars, sort_order) values
  -- REDES SOCIALES (ejemplo completo de la spec)
  ('redes','Estrategia','pilares','Definición de pilares de contenido','Ejes temáticos que guían toda la comunicación.',60000,1),
  ('redes','Estrategia','calendario','Calendario de contenidos','Planificación mensual de publicaciones.',70000,2),
  ('redes','Estrategia','tono','Tono de comunicación','Guía de voz y estilo de la marca.',40000,3),
  ('redes','Producción','piezas','Diseño de piezas gráficas','Set de creatividades para feed y stories.',120000,4),
  ('redes','Producción','formatos','Adaptación de formatos','Versiones para cada red y formato.',60000,5),
  ('redes','Producción','animaciones','Animaciones básicas','Motion simple para piezas clave.',90000,6),
  ('redes','Community','mensajes','Gestión de mensajes','Respuesta a consultas y mensajes.',80000,7),
  ('redes','Community','comunidad','Gestión de comunidad','Moderación e interacción con seguidores.',90000,8),
  ('redes','Community','engagement','Optimización de engagement','Acciones para aumentar interacción.',70000,9),
  ('redes','Growth','audiencia','Investigación de audiencia','Análisis de público objetivo.',60000,10),
  ('redes','Growth','competencia','Análisis de competencia','Benchmark de cuentas referentes.',60000,11),
  ('redes','Growth','organico','Optimización de crecimiento orgánico','Tácticas de alcance sin pauta.',80000,12),
  ('redes','Automatizaciones','auto-respuestas','Automatización de respuestas','Respuestas automáticas a consultas frecuentes.',90000,13),
  ('redes','Automatizaciones','flujos-dm','Flujos de DM','Secuencias automáticas de mensajes directos.',100000,14),
  ('redes','Automatizaciones','crm-integracion','Integración con CRM','Conexión de redes con tu CRM.',120000,15),

  -- LANDING PAGE
  ('landing','Estructura','copy','Copywriting de conversión','Textos persuasivos orientados a venta.',60000,1),
  ('landing','Estructura','secciones-extra','Secciones adicionales','Bloques extra (FAQ, testimonios, pricing).',50000,2),
  ('landing','Captación','formulario','Formulario + captura de leads','Conexión a tu CRM o planilla.',50000,3),
  ('landing','Captación','analytics','Analítica y píxeles','GA4 + píxeles de campañas.',40000,4),
  ('landing','Performance','seo-onpage','SEO on-page','Optimización técnica y de contenido.',60000,5),
  ('landing','Performance','animaciones','Animaciones premium','Micro-interacciones y transiciones.',70000,6),

  -- SITIO WEB
  ('sitio','Contenido','copy-paginas','Copywriting de páginas','Redacción de todas las secciones.',90000,1),
  ('sitio','Contenido','blog','Blog / sección de novedades','Estructura de blog con primeras notas.',80000,2),
  ('sitio','Funcional','multilenguaje','Multilenguaje','Sitio en 2 idiomas.',120000,3),
  ('sitio','Funcional','formularios','Formularios avanzados','Múltiples formularios con lógica.',70000,4),
  ('sitio','Performance','seo','SEO técnico','Sitemap, schema y optimización.',90000,5),

  -- ECOMMERCE
  ('ecommerce','Catálogo','carga-productos','Carga inicial de productos','Hasta 50 productos cargados.',120000,1),
  ('ecommerce','Pagos','pasarela','Integración de medios de pago','MercadoPago / Stripe.',100000,2),
  ('ecommerce','Logística','envios','Cálculo de envíos','Integración con correo/transporte.',90000,3),
  ('ecommerce','Marketing','cupones','Cupones y promociones','Sistema de descuentos.',70000,4),
  ('ecommerce','Operación','panel-ventas','Panel de gestión de ventas','Dashboard de pedidos y stock.',120000,5),

  -- PLATAFORMA WEB
  ('plataforma','Core','auth','Autenticación y roles','Login, registro y permisos.',150000,1),
  ('plataforma','Core','dashboard','Dashboard principal','Panel con métricas y módulos.',180000,2),
  ('plataforma','Integraciones','api-externa','Integración con API externa','Conexión a un servicio de terceros.',150000,3),
  ('plataforma','Pagos','suscripciones','Suscripciones / pagos recurrentes','Cobros automáticos.',160000,4),
  ('plataforma','Operación','panel-admin','Panel de administración','Gestión interna de la plataforma.',150000,5),

  -- BRANDING
  ('branding','Identidad','logo','Logo e isologo','Diseño de logotipo principal.',120000,1),
  ('branding','Identidad','paleta','Paleta y tipografías','Sistema visual base.',60000,2),
  ('branding','Sistema','manual','Manual de marca','Guía de uso completa.',100000,3),
  ('branding','Aplicaciones','papeleria','Papelería y aplicaciones','Tarjetas, firmas, plantillas.',70000,4),

  -- ESTRATEGIA COMERCIAL
  ('estrategia-comercial','Definición','propuesta','Propuesta de valor','Mensaje central diferenciador.',80000,1),
  ('estrategia-comercial','Definición','posicionamiento','Posicionamiento','Cómo te ubicás en el mercado.',70000,2),
  ('estrategia-comercial','Audiencia','buyer','Definición de audiencia','Perfiles de cliente ideal.',60000,3),
  ('estrategia-comercial','Comercial','plan','Plan comercial','Acciones para captar y cerrar.',90000,4),

  -- AUTOMATIZACIONES (addon)
  ('automatizaciones','Flujos','onboarding','Flujo de onboarding','Secuencia de bienvenida automática.',90000,1),
  ('automatizaciones','Flujos','nurturing','Flujo de nurturing','Seguimiento automático de leads.',100000,2),
  ('automatizaciones','Integración','crm-sync','Sincronización con CRM','Conexión bidireccional.',120000,3),
  ('automatizaciones','Integración','notificaciones','Notificaciones automáticas','Email/WhatsApp/Slack.',80000,4),

  -- CRM (addon)
  ('crm','Setup','pipeline','Pipeline de ventas','Etapas y tablero de oportunidades.',120000,1),
  ('crm','Setup','importacion','Importación de contactos','Carga inicial de tu base.',60000,2),
  ('crm','Automatización','recordatorios','Recordatorios automáticos','Tareas y follow-ups.',70000,3),
  ('crm','Reporting','reportes','Reportes y métricas','Dashboard de performance.',90000,4),

  -- PUBLICIDAD (campanas)
  ('campanas','Setup','cuentas','Setup de cuentas publicitarias','Configuración de Meta/Google Ads.',70000,1),
  ('campanas','Creatividad','creatividades','Creatividades iniciales','Set de anuncios para lanzar.',120000,2),
  ('campanas','Segmentación','audiencias','Investigación de audiencias','Públicos y segmentaciones.',60000,3),
  ('campanas','Optimización','tracking','Tracking y conversiones','Píxel y eventos de conversión.',80000,4)
on conflict (service_slug, slug) do nothing;
