-- Enfoque / recomendación de RUN para el lead (ej: "Fase 1 — ecommerce completo").
-- Guía la propuesta por etapas y el preview visual que ve el cliente.
alter table public.leads add column if not exists focus text;
