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
