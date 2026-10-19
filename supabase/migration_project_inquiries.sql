-- Consultas de proyectos a medida (captación consultiva RUN).
-- Migración aditiva: no toca leads Express, pricing, ni contratos existentes.
-- El acceso es solo vía servidor (service role) y admin validado; sin RLS para
-- anónimos ni authenticated.

create table if not exists public.project_inquiries (
  id                   uuid primary key default gen_random_uuid(),
  idempotency_key      uuid unique not null,
  name                 text not null,
  email                text not null,
  company              text,
  interest             text not null check (interest in ('software','agentes','automatizacion','orientacion')),
  problem              text not null,
  systems              text,
  budget               text check (budget in ('unsure','3000_7500','7500_15000','15000_30000','over_30000')),
  status               text not null default 'nuevo' check (status in ('nuevo','revisando','contactado','cerrado')),
  privacy_version      text not null,
  privacy_accepted_at  timestamptz not null default now(),
  source_path          text,
  created_at           timestamptz not null default now(),
  notified_at          timestamptz
);

-- Atribución, segmentación y pipeline comercial (Part C · 2026-10-19).
-- Aditivo: todas las columnas son opcionales y no alteran filas existentes.
alter table public.project_inquiries add column if not exists phone                text;
alter table public.project_inquiries add column if not exists timeline             text check (timeline in ('asap','month','1_3m','later','exploring'));
alter table public.project_inquiries add column if not exists source               text;      -- contact | quote | runit | runit_scan | express | direct_email | manual
alter table public.project_inquiries add column if not exists entry_path           text;
alter table public.project_inquiries add column if not exists landing_page         text;
alter table public.project_inquiries add column if not exists referrer             text;
alter table public.project_inquiries add column if not exists utm_source           text;
alter table public.project_inquiries add column if not exists utm_medium           text;
alter table public.project_inquiries add column if not exists utm_campaign         text;
alter table public.project_inquiries add column if not exists utm_content          text;
alter table public.project_inquiries add column if not exists utm_term             text;
alter table public.project_inquiries add column if not exists channel              text;      -- google_ads | google | meta_ads | linkedin | paid | referral | direct | organic
alter table public.project_inquiries add column if not exists priority             text default 'media' check (priority in ('alta','media','baja','spam'));
alter table public.project_inquiries add column if not exists consent_marketing_at timestamptz;
alter table public.project_inquiries add column if not exists owner                text;
alter table public.project_inquiries add column if not exists last_contact_at      timestamptz;
alter table public.project_inquiries add column if not exists notes                text;
alter table public.project_inquiries add column if not exists updated_at           timestamptz not null default now();

create index if not exists project_inquiries_created_idx on public.project_inquiries (created_at desc);
create index if not exists project_inquiries_status_idx on public.project_inquiries (status);
create index if not exists project_inquiries_priority_idx on public.project_inquiries (priority);
create index if not exists project_inquiries_source_idx on public.project_inquiries (source);

-- Sin acceso directo del cliente: la lectura/escritura pasa por la API con
-- service role y el admin validado con la allowlist existente.
alter table public.project_inquiries enable row level security;
