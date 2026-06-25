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
