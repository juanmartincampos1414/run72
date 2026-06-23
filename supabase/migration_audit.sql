-- Auditoría técnica: optimizaciones de base de datos.
-- Seguro de correr varias veces (if not exists).

-- El detalle de lead y la auditoría consultan events por lead_id; faltaba el índice.
create index if not exists events_lead_idx on public.events (lead_id);

-- El listado y dashboard ordenan/filtran por estado de pago y comprobante.
create index if not exists leads_comprobante_status_idx on public.leads (comprobante_status);
create index if not exists leads_payment_status_idx on public.leads (payment_status);
