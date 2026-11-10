-- ============================================================
-- RUN72 — URL legible para la propuesta del cliente
-- Agrega leads.slug (ej "emiliano-cocilobo") para que el link del cliente
-- sea /proyecto/emiliano-cocilobo en vez de /proyecto/<uuid>.
-- Los links viejos (uuid) siguen funcionando: el server resuelve slug-o-id.
-- Ejecutar en el SQL Editor de Supabase.
-- ============================================================

alter table public.leads add column if not exists slug text;

-- Backfill de leads existentes: slug a partir del nombre (sin tildes, seguro para URL),
-- con sufijo -2, -3… si dos leads comparten el mismo slug base.
with base as (
  select
    id,
    created_at,
    nullif(
      trim(both '-' from
        regexp_replace(
          lower(translate(
            coalesce(nullif(trim(name), ''), split_part(coalesce(email,''), '@', 1), 'cliente'),
            'áàäâãéèëêíìïîóòöôõúùüûñçÁÀÄÂÃÉÈËÊÍÌÏÎÓÒÖÔÕÚÙÜÛÑÇ',
            'aaaaaeeeeiiiiooooouuuuncAAAAAEEEEIIIIOOOOOUUUUNC'
          )),
          '[^a-z0-9]+', '-', 'g'
        )
      ),
      ''
    ) as base_slug
  from public.leads
  where slug is null
),
numbered as (
  select
    id,
    coalesce(base_slug, 'cliente') as base_slug,
    row_number() over (partition by coalesce(base_slug, 'cliente') order by created_at) as rn
  from base
)
update public.leads l
set slug = case when n.rn = 1 then n.base_slug else n.base_slug || '-' || n.rn end
from numbered n
where l.id = n.id;

-- Unicidad (permite múltiples NULL, que no debería haber tras el backfill).
create unique index if not exists leads_slug_key on public.leads (slug);
