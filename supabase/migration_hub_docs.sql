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
