-- Hardening: bucket de archivos PRIVADO.
-- Correr DESPUÉS de desplegar el código que firma URLs (las signed URLs ya
-- funcionan sobre buckets públicos, así que nada se rompe en el orden correcto).
--
-- Los comprobantes y adjuntos dejan de ser accesibles por URL pública;
-- el panel admin genera signed URLs temporales (1 h) al mostrarlos.

update storage.buckets set public = false where id = 'lead-files';

-- Verificación:
-- select id, public from storage.buckets where id = 'lead-files';  -- public debe ser false
