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
