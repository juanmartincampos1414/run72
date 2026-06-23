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
