-- ============================================================
-- RUN72 — Cotizador: recolección inteligente (intake)
-- Ejecutar en Supabase → SQL Editor → Run
-- ============================================================

alter table public.leads add column if not exists intake jsonb not null default '{}'::jsonb;
alter table public.leads add column if not exists preparation_level text;
