-- ============================================================
-- RUN72 — Cotización por chat (Project Concierge)
-- Distingue el origen del lead y guarda el resumen conversacional.
-- El sistema funciona aunque no se corra (insert resiliente), pero esto
-- deja los datos consistentes para el admin y las métricas.
-- Ejecutar en Supabase → SQL Editor → Run.
-- ============================================================

alter table public.leads add column if not exists source_type text not null default 'form';
alter table public.leads add column if not exists conversation_summary text;
