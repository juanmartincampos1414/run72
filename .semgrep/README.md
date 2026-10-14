# Semgrep en RUN72

Reglas de arquitectura propias (`.semgrep/run72.yml`) más los packs de seguridad del registry. Semgrep está
instalado con `pip3 install --user semgrep` (no está en el PATH): los scripts lo llaman por `scripts/semgrep.sh`.

```bash
npm run semgrep:arch   # reglas de RUN72: rápido, sin red
npm run semgrep:sec    # packs de seguridad del registry (p/secrets, p/typescript, p/react, p/nextjs, p/owasp-top-ten); requiere red
npm run semgrep        # las dos cosas
```

Validar el archivo de reglas después de editarlo: `bash scripts/semgrep.sh --validate --config .semgrep/run72.yml`.

## Por qué estas reglas

Todas las tablas tienen RLS sin policies y todo se lee y escribe con service role desde `app/api`. El
middleware sólo protege páginas (`/admin/*`, `/hub/*`), no `/api`. O sea: **cada ruta es la única barrera**.
Las reglas vigilan que ninguna ruta nueva quede abierta y que el código de servidor no llegue al navegador.

Una regla **ERROR** es una invariante. Una **WARNING** es deuda conocida de la auditoría del 13/10/2026: la
lista tiene que bajar, no subir.

## Reglas

| Regla | Severidad | Qué protege |
|---|---|---|
| `run72-servidor-en-cliente` | ERROR | Un `"use client"` no importa clientes de Supabase de servidor, el guard de admin, la bóveda, Mercado Pago, correo ni IA. |
| `run72-env-no-publico-en-cliente` | ERROR | En el navegador sólo se leen variables `NEXT_PUBLIC_*`. |
| `run72-ruta-admin-sin-guard` | ERROR | Todo handler de `/api/admin` llama a `requireAdmin()`. |
| `run72-ruta-hub-sin-guard` | ERROR | Todo handler de `/api/hub` identifica al usuario (`requireActiveHub`, `hubUser`, `currentUser`). |
| `run72-ia-sin-limite` | ERROR | Una ruta que llama a la IA tiene `enforceRateLimit` o `requireAdmin`. |
| `run72-webhook-sin-firma` | ERROR | Un webhook exige la firma con `exigirFirmaDeMP`. |
| `run72-webhook-firma-opcional` | ERROR | La firma no se verifica "sólo si hay secreto". |
| `run72-html-crudo` | ERROR | `dangerouslySetInnerHTML` sólo con `JSON.stringify` de datos propios. |
| `run72-iframe-srcdoc-sin-sandbox` | ERROR | El HTML que escribe la IA se muestra en un iframe con `sandbox`. |
| `run72-escritura-sin-mirar-error` | WARNING | Una escritura a Supabase mira `{ error }` (supabase-js no lanza). |

## Hallazgos abiertos al crear las reglas (14/10/2026)

- Los dos webhooks sin firma obligatoria: corregidos el mismo día con `exigirFirmaDeMP` (falla cerrado).
- `run72-escritura-sin-mirar-error` → 17 escrituras.

Para silenciar un caso puntual y justificado: comentario `// nosemgrep: <id-de-la-regla> — motivo` en la línea.
