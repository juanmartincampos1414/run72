-- ============================================================
-- RUN72 — Documento Final de Entrega
-- Ejecutar en Supabase → SQL Editor → Run
-- ============================================================

alter table public.leads add column if not exists delivery_doc jsonb not null default '{}'::jsonb;
