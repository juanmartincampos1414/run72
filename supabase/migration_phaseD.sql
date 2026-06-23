-- ============================================================
-- RUN72 — Fase D: FAQ administrable
-- Ejecutar en Supabase → SQL Editor → Run
-- ============================================================

create table if not exists public.faqs (
  id          uuid primary key default gen_random_uuid(),
  question    text not null,
  answer      text not null,
  sort_order  int not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists faqs_sort_idx on public.faqs (sort_order);
alter table public.faqs enable row level security;

drop trigger if exists faqs_touch on public.faqs;
create trigger faqs_touch before update on public.faqs
  for each row execute function public.touch_updated_at();

-- Seed (FAQs iniciales)
insert into public.faqs (question, answer, sort_order) values
  ('¿Realmente entregan en 72 horas?', 'Sí. Una vez confirmado el adelanto comienza oficialmente la cuenta regresiva.', 1),
  ('¿Qué incluye exactamente el presupuesto?', 'Incluye únicamente los servicios y microservicios seleccionados.', 2),
  ('¿Qué pasa si necesito cambios?', 'Incluimos una instancia de revisión para validar el resultado final.', 3),
  ('¿Necesito tener todo definido?', 'No. Muchos proyectos comienzan únicamente con una idea.', 4),
  ('¿Qué ocurre después del pago?', 'Se crea el proyecto, inicia producción y comienza la cuenta regresiva.', 5),
  ('¿Cómo recibo el trabajo?', 'Digitalmente con accesos, credenciales, archivos y documentación.', 6),
  ('¿El hosting y dominio están incluidos?', 'Depende del alcance seleccionado.', 7),
  ('¿Pueden desarrollar proyectos complejos?', 'Sí, siempre que sean compatibles con el modelo RUN72.', 8),
  ('¿Qué garantía tengo?', 'Todo el proyecto queda registrado y trazado dentro de RUN72.', 9),
  ('¿Qué pasa si todavía tengo dudas?', 'Podés completar el proceso igualmente y evaluar la propuesta.', 10)
on conflict do nothing;
