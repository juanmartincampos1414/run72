-- ============================================================
-- RUN72 — RECONSTRUCCIÓN COMPLETA del proyecto Supabase
-- Generado 2026-10-11. Pegar TODO en: Dashboard → SQL Editor → New query → Run
-- Todo es idempotente (create if not exists / add column if not exists):
-- se puede correr más de una vez sin romper nada.
-- ============================================================


-- ============================================================
-- >>> schema.sql
-- ============================================================
-- ============================================================
-- RUN72 — Esquema del sistema comercial (Supabase / Postgres)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Extensión para UUIDs
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- SERVICIOS (precios editables desde /admin — NUNCA hardcodeados)
--   type = 'project'  -> opciones del Paso 1 (Landing, Sitio, etc.)
--   type = 'addon'    -> servicios adicionales del Paso 3
-- ------------------------------------------------------------
create table if not exists public.services (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  category    text not null default 'General',
  description text,
  price_ars   bigint not null default 0,
  type        text not null default 'addon' check (type in ('project', 'addon')),
  active      boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- LEADS (cada finalización del cotizador genera uno)
-- ------------------------------------------------------------
create table if not exists public.leads (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  -- contacto
  name           text not null,
  company        text,
  email          text not null,
  phone          text,
  -- selección del configurador
  project_type   text,            -- slug del servicio 'project' o 'unsure'
  project_label  text,            -- nombre legible
  brand_status   text,
  objective      text,
  timing         text,
  addons         jsonb not null default '[]'::jsonb,   -- [{slug,name,price_ars}]
  line_items     jsonb not null default '[]'::jsonb,   -- snapshot {name, price_ars}
  -- montos (calculados en el server contra la DB)
  total_ars      bigint not null default 0,
  deposit_ars    bigint not null default 0,
  balance_ars    bigint not null default 0,
  deposit_percent int not null default 30,
  -- scoring
  score          int not null default 0,
  hot            boolean not null default false,
  -- pipeline
  status         text not null default 'nuevo'
                 check (status in ('nuevo','adelanto_pagado','en_produccion','entregado','cobrado_completo')),
  -- pago (Fase 2)
  preference_id  text,
  payment_id     text,
  payment_status text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);

-- ------------------------------------------------------------
-- CONFIG (fila única — datos bancarios, MP, parámetros)
-- ------------------------------------------------------------
create table if not exists public.config (
  id              int primary key default 1,
  bank_cbu        text,
  bank_alias      text,
  bank_holder     text,
  mp_access_token text,
  mp_public_key   text,
  deposit_percent int not null default 30,
  updated_at      timestamptz not null default now(),
  constraint config_singleton check (id = 1)
);

insert into public.config (id) values (1) on conflict (id) do nothing;

-- ------------------------------------------------------------
-- RLS: todo el acceso pasa por las API routes con SERVICE ROLE
-- (que bypassea RLS). Bloqueamos el acceso anónimo directo.
-- ------------------------------------------------------------
alter table public.services enable row level security;
alter table public.leads    enable row level security;
alter table public.config   enable row level security;
-- Sin policies => deniega anon/auth por defecto. El service role ignora RLS.

-- updated_at automático en services
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists services_touch on public.services;
create trigger services_touch before update on public.services
  for each row execute function public.touch_updated_at();


-- ============================================================
-- >>> seed.sql
-- ============================================================
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
  ('branding',    'Branding',             'Branding',   'Identidad visual completa: logo, sistema y manual de marca.',        350000,  'project', 5),
  ('estrategia-comercial','Estrategia Comercial','Estrategia','Propuesta de valor, posicionamiento y plan comercial.',         250000,  'project', 6),

  -- Paso 3: servicios adicionales
  ('logo',        'Logo',                 'Branding',   'Diseño de logotipo e isologo profesional.',                          150000,  'addon', 10),
  ('manual',      'Manual de marca',      'Branding',   'Sistema visual completo: colores, tipografías y usos.',              200000,  'addon', 11),
  ('estrategia',  'Estrategia comercial', 'Estrategia', 'Propuesta de valor, posicionamiento y mensaje de venta.',           200000,  'addon', 12),
  ('redes',       'Redes sociales',       'Marketing',  'Preparación de perfiles y kit inicial de contenidos.',               180000,  'addon', 13),
  ('campanas',    'Campañas publicitarias','Marketing', 'Setup de campañas y creatividades para captar clientes.',           250000,  'addon', 14),
  ('automatizaciones','Automatizaciones', 'Tecnología', 'Flujos automáticos que ahorran trabajo manual.',                     400000,  'addon', 15),
  ('crm',         'CRM',                  'Tecnología', 'Sistema para gestionar y dar seguimiento a tus clientes.',           500000,  'addon', 16)
on conflict (slug) do nothing;


-- ============================================================
-- >>> migration_phaseA.sql
-- ============================================================
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


-- ============================================================
-- >>> migration_phaseB.sql
-- ============================================================
-- ============================================================
-- RUN72 — Fase B: Cobro y operación
-- Ejecutar en Supabase → SQL Editor → Run
-- ============================================================

-- Nuevos campos del lead
alter table public.leads add column if not exists comprobante_url text;
alter table public.leads add column if not exists comprobante_name text;
alter table public.leads add column if not exists comprobante_status text;          -- recibido | aprobado | rechazado
alter table public.leads add column if not exists comprobante_uploaded_at timestamptz;
alter table public.leads add column if not exists complexity_score int not null default 0;
alter table public.leads add column if not exists requires_manual_review boolean not null default false;
alter table public.leads add column if not exists scope_accepted boolean not null default false;
alter table public.leads add column if not exists rejection_reason text;
alter table public.leads add column if not exists estimated_delivery_at timestamptz;

-- Ampliar los estados permitidos del pipeline
alter table public.leads drop constraint if exists leads_status_check;
alter table public.leads add constraint leads_status_check check (status in (
  'nuevo',
  'pendiente_validacion',
  'validado',
  'rechazado_alcance',
  'esperando_pago',
  'comprobante_recibido',
  'adelanto_pagado',
  'en_produccion',
  'entregado',
  'cobrado_completo'
));


-- ============================================================
-- >>> migration_phaseC.sql
-- ============================================================
-- ============================================================
-- RUN72 — Fase C: Analytics (event tracking + CRM)
-- Ejecutar en Supabase → SQL Editor → Run
-- ============================================================

-- Eventos del funnel / tracking
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  event_type  text not null,
  session_id  text,
  lead_id     uuid,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists events_type_idx on public.events (event_type);
create index if not exists events_session_idx on public.events (session_id);
create index if not exists events_created_idx on public.events (created_at desc);
alter table public.events enable row level security;

-- Vincular leads con su sesión + paso alcanzado
alter table public.leads add column if not exists session_id text;
alter table public.leads add column if not exists funnel_step_reached int not null default 0;


-- ============================================================
-- >>> migration_phaseD.sql
-- ============================================================
-- ============================================================
-- RUN72 — Fase D: FAQ administrable
-- Ejecutar en Supabase → SQL Editor → Run
-- ============================================================

create table if not exists public.faqs (
  id          uuid primary key default gen_random_uuid(),
  question    text not null,
  answer      text not null,
  sort_order  int not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists faqs_sort_idx on public.faqs (sort_order);
alter table public.faqs enable row level security;

drop trigger if exists faqs_touch on public.faqs;
create trigger faqs_touch before update on public.faqs
  for each row execute function public.touch_updated_at();

-- Seed (FAQs iniciales)
insert into public.faqs (question, answer, sort_order) values
  ('¿Realmente entregan en 72 horas?', 'Sí. Una vez confirmado el adelanto comienza oficialmente la cuenta regresiva.', 1),
  ('¿Qué incluye exactamente el presupuesto?', 'Incluye únicamente los servicios y microservicios seleccionados.', 2),
  ('¿Qué pasa si necesito cambios?', 'Incluimos una instancia de revisión para validar el resultado final.', 3),
  ('¿Necesito tener todo definido?', 'No. Muchos proyectos comienzan únicamente con una idea.', 4),
  ('¿Qué ocurre después del pago?', 'Se crea el proyecto, inicia producción y comienza la cuenta regresiva.', 5),
  ('¿Cómo recibo el trabajo?', 'Digitalmente con accesos, credenciales, archivos y documentación.', 6),
  ('¿El hosting y dominio están incluidos?', 'Depende del alcance seleccionado.', 7),
  ('¿Pueden desarrollar proyectos complejos?', 'Sí, siempre que sean compatibles con el modelo RUN72.', 8),
  ('¿Qué garantía tengo?', 'Todo el proyecto queda registrado y trazado dentro de RUN72.', 9),
  ('¿Qué pasa si todavía tengo dudas?', 'Podés completar el proceso igualmente y evaluar la propuesta.', 10)
on conflict do nothing;


-- ============================================================
-- >>> migration_intake.sql
-- ============================================================
-- ============================================================
-- RUN72 — Cotizador: recolección inteligente (intake)
-- Ejecutar en Supabase → SQL Editor → Run
-- ============================================================

alter table public.leads add column if not exists intake jsonb not null default '{}'::jsonb;
alter table public.leads add column if not exists preparation_level text;


-- ============================================================
-- >>> migration_v2.sql
-- ============================================================
-- ============================================================
-- RUN72 — Migración v2 (cotizador potenciado). Ejecutar en SQL Editor.
-- ============================================================

-- Nuevos campos del lead
alter table public.leads add column if not exists whatsapp text;
alter table public.leads add column if not exists urgency_note text;
alter table public.leads add column if not exists files jsonb not null default '[]'::jsonb;
alter table public.leads add column if not exists subtotal_ars bigint not null default 0;
alter table public.leads add column if not exists iva_ars bigint not null default 0;
alter table public.leads add column if not exists preview_text text;
alter table public.leads add column if not exists preview_rating int;
alter table public.leads add column if not exists preview_comments text;
alter table public.leads add column if not exists production_started_at timestamptz;

-- (los servicios Branding y Estrategia Comercial y el bucket "lead-files"
--  ya fueron creados vía API; no hace falta hacer nada más acá)


-- ============================================================
-- >>> migration_cotizador_v2.sql
-- ============================================================
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


-- ============================================================
-- >>> migration_delivery.sql
-- ============================================================
-- ============================================================
-- RUN72 — Documento Final de Entrega
-- Ejecutar en Supabase → SQL Editor → Run
-- ============================================================

alter table public.leads add column if not exists delivery_doc jsonb not null default '{}'::jsonb;


-- ============================================================
-- >>> migration_hub.sql
-- ============================================================
-- ============================================================
-- RUN72 Business Hub — Fase 1: núcleo (perfiles + checklist + score)
-- Portal privado por cliente. Auth = Supabase Auth (mismo proyecto, los
-- clientes NO están en la allowlist de admin, así que solo acceden al Hub).
-- Ejecutar en Supabase → SQL Editor → Run.
--
-- IMPORTANTE: habilitar el registro por email en Supabase
-- (Authentication → Providers → Email → Enable signups) para que los
-- clientes puedan crear su cuenta. El admin sigue protegido por allowlist.
-- ============================================================

-- Perfil de empresa por usuario del Hub.
create table if not exists public.hub_profiles (
  user_id             uuid primary key,
  company_name        text,
  email               text,
  -- 'active' | 'suspended' | 'cancelled'. Default 'suspended' = suscripción
  -- obligatoria: el cliente nuevo debe activar la suscripción de MP para entrar.
  subscription_status text not null default 'suspended',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Estado de cada ítem del checklist por usuario.
-- status: 'pendiente' | 'en_proceso' | 'completado' | 'no_aplica'
create table if not exists public.hub_checklist (
  user_id    uuid not null,
  item_key   text not null,
  status     text not null default 'pendiente',
  updated_at timestamptz not null default now(),
  primary key (user_id, item_key)
);

create index if not exists hub_checklist_user_idx on public.hub_checklist (user_id);

alter table public.hub_profiles enable row level security;
alter table public.hub_checklist enable row level security;
-- Sin policies: todo el acceso pasa por API routes con service role (igual que el resto).

-- Trigger updated_at (la función public.touch_updated_at ya existe en el esquema).
drop trigger if exists hub_profiles_touch on public.hub_profiles;
create trigger hub_profiles_touch before update on public.hub_profiles
  for each row execute function public.touch_updated_at();


-- ============================================================
-- >>> migration_hub_partners.sql
-- ============================================================
-- ============================================================
-- RUN72 Business Hub — Partners recomendados (global, admin-gestionado)
-- Ejecutar en Supabase → SQL Editor → Run.
-- ============================================================

create table if not exists public.hub_partners (
  id          uuid primary key default gen_random_uuid(),
  category    text not null,
  name        text not null,
  description text,
  contact     text,
  website     text,
  whatsapp    text,
  notes       text,
  active      boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists hub_partners_category_idx on public.hub_partners (category);
alter table public.hub_partners enable row level security;


-- ============================================================
-- >>> migration_hub_docs.sql
-- ============================================================
-- ============================================================
-- RUN72 Business Hub — Centro de Documentos
-- Metadatos de los archivos del cliente (los archivos viven en el bucket
-- privado lead-files bajo el prefijo hub/{user_id}/...).
-- Ejecutar en Supabase → SQL Editor → Run.
-- ============================================================

create table if not exists public.hub_documents (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null,
  name       text not null,
  path       text not null,
  type       text,
  size       bigint,
  folder     text not null default 'General',
  created_at timestamptz not null default now()
);

create index if not exists hub_documents_user_idx on public.hub_documents (user_id);
alter table public.hub_documents enable row level security;


-- ============================================================
-- >>> migration_hub_vault.sql
-- ============================================================
-- ============================================================
-- RUN72 Business Hub — Bóveda de Credenciales
-- La contraseña y las notas se guardan CIFRADAS (AES-256-GCM, clave en env
-- HUB_VAULT_KEY, fuera de la DB). El resto de campos en claro para poder listar.
-- Requiere setear HUB_VAULT_KEY en Vercel (32+ chars aleatorios).
-- Ejecutar en Supabase → SQL Editor → Run.
-- ============================================================

create table if not exists public.hub_credentials (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null,
  service_name  text not null,
  username      text,
  email         text,
  url           text,
  password_enc  text,            -- cifrado (iv:tag:ciphertext en base64)
  notes_enc     text,            -- cifrado
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists hub_credentials_user_idx on public.hub_credentials (user_id);
alter table public.hub_credentials enable row level security;

drop trigger if exists hub_credentials_touch on public.hub_credentials;
create trigger hub_credentials_touch before update on public.hub_credentials
  for each row execute function public.touch_updated_at();


-- ============================================================
-- >>> migration_audit.sql
-- ============================================================
-- Auditoría técnica: optimizaciones de base de datos.
-- Seguro de correr varias veces (if not exists).

-- El detalle de lead y la auditoría consultan events por lead_id; faltaba el índice.
create index if not exists events_lead_idx on public.events (lead_id);

-- El listado y dashboard ordenan/filtran por estado de pago y comprobante.
create index if not exists leads_comprobante_status_idx on public.leads (comprobante_status);
create index if not exists leads_payment_status_idx on public.leads (payment_status);


-- ============================================================
-- >>> migration_chat.sql
-- ============================================================
-- ============================================================
-- RUN72 — Cotización por chat (Project Concierge)
-- Distingue el origen del lead y guarda el resumen conversacional.
-- El sistema funciona aunque no se corra (insert resiliente), pero esto
-- deja los datos consistentes para el admin y las métricas.
-- Ejecutar en Supabase → SQL Editor → Run.
-- ============================================================

alter table public.leads add column if not exists source_type text not null default 'form';
alter table public.leads add column if not exists conversation_summary text;


-- ============================================================
-- >>> migration_faqs_v2.sql
-- ============================================================
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


-- ============================================================
-- >>> migration_tanda2.sql
-- ============================================================
-- ============================================================
-- RUN72 — Admin Tanda 2: historial de Preview IA + observaciones
-- Ejecutar en Supabase → SQL Editor → Run
-- ============================================================

-- Historial de previews generados (no se sobrescribe)
create table if not exists public.preview_versions (
  id            uuid primary key default gen_random_uuid(),
  lead_id       uuid not null,
  prompt        text,
  response      text,                              -- interpretación / texto
  preview       jsonb,                             -- ProjectPreview completo (mockups, etc.)
  files_context jsonb not null default '[]'::jsonb,
  form_snapshot jsonb not null default '{}'::jsonb,
  created_by    text,                              -- 'Sistema (post-pago)' o email del admin
  created_at    timestamptz not null default now()
);

create index if not exists preview_versions_lead_idx on public.preview_versions (lead_id, created_at desc);
alter table public.preview_versions enable row level security;

-- Observaciones del comprobante (revisión del admin)
alter table public.leads add column if not exists comprobante_observaciones text;

-- (la auditoría reutiliza la tabla public.events de la Fase C)


-- ============================================================
-- >>> migration_service_names.sql
-- ============================================================
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


-- ============================================================
-- >>> migration_storage_private.sql
-- ============================================================
-- Hardening: bucket de archivos PRIVADO.
-- Correr DESPUÉS de desplegar el código que firma URLs (las signed URLs ya
-- funcionan sobre buckets públicos, así que nada se rompe en el orden correcto).
--
-- Los comprobantes y adjuntos dejan de ser accesibles por URL pública;
-- el panel admin genera signed URLs temporales (1 h) al mostrarlos.

update storage.buckets set public = false where id = 'lead-files';

-- Verificación:
-- select id, public from storage.buckets where id = 'lead-files';  -- public debe ser false


-- ============================================================
-- >>> migration_meeting_requests.sql
-- ============================================================
-- Solicitudes de reunión desde el cotizador (3er cuadro).
-- Aplicar en Supabase (SQL Editor). Hasta aplicarla, las solicitudes igual llegan
-- por mail y quedan en la tabla `events` (audit). Con la tabla, son registro de primera clase.

create table if not exists public.meeting_requests (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  whatsapp      text,
  company       text,
  needs         text[] default '{}',
  business_what text,
  stage         text,
  objective     text,
  explain       text not null,
  availability  text,
  created_at    timestamptz not null default now()
);

-- Solo el service role (backend) escribe/lee. Sin acceso anónimo.
alter table public.meeting_requests enable row level security;

