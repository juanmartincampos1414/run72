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
