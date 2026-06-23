-- ============================================================
-- RUN72 — Fase B: Cobro y operación
-- Ejecutar en Supabase → SQL Editor → Run
-- ============================================================

-- Nuevos campos del lead
alter table public.leads add column if not exists comprobante_url text;
alter table public.leads add column if not exists comprobante_name text;
alter table public.leads add column if not exists comprobante_status text;          -- recibido | aprobado | rechazado
alter table public.leads add column if not exists comprobante_uploaded_at timestamptz;
alter table public.leads add column if not exists complexity_score int not null default 0;
alter table public.leads add column if not exists requires_manual_review boolean not null default false;
alter table public.leads add column if not exists scope_accepted boolean not null default false;
alter table public.leads add column if not exists rejection_reason text;
alter table public.leads add column if not exists estimated_delivery_at timestamptz;

-- Ampliar los estados permitidos del pipeline
alter table public.leads drop constraint if exists leads_status_check;
alter table public.leads add constraint leads_status_check check (status in (
  'nuevo',
  'pendiente_validacion',
  'validado',
  'rechazado_alcance',
  'esperando_pago',
  'comprobante_recibido',
  'adelanto_pagado',
  'en_produccion',
  'entregado',
  'cobrado_completo'
));
