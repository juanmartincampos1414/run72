# Seguimiento de meets por WhatsApp (recordatorio + confirmación)

Automatiza el recordatorio de la reunión y la confirmación de asistencia por WhatsApp,
usando la **WhatsApp Cloud API** de Meta. El número puede seguir en el celular
(**coexistencia**): esta API envía plantillas sin desconectar WhatsApp Business.

## Cómo funciona

Dos momentos, los dos con botones **Confirmar / Reprogramar**:

```
Centrilize → Google Calendar (evento con el WhatsApp del invitado)
        → cron de RUN cada 15 min:
            ① ~10-20 min después de agendar  → plantilla "confirmacion_reserva"
            ② ~30 min antes de la meet        → plantilla "recordatorio_meet"
        → el webhook de RUN capta la respuesta (fase 2)
```

> ⚠️ **Frecuencia del cron:** corre cada 15 min (`*/15 * * * *`). En Vercel plan **Hobby los
> crons corren solo 1 vez por día** → para que corra cada 15 min necesitás plan **Pro**, o un
> disparador externo que haga `GET /api/whatsapp/cron` con el header del `CRON_SECRET` cada 15 min.

Código en RUN (ya creado en esta rama, **no** desplegado a producción):
- `lib/whatsapp.ts` — cliente Cloud API (enviar plantilla, verificar firma del webhook).
- `lib/calendar.ts` — lee Google Calendar con un service account (solo lectura).
- `app/api/whatsapp/cron/route.ts` — corrida programada que envía los recordatorios.
- `app/api/whatsapp/webhook/route.ts` — recibe respuestas y confirma asistencia.
- `supabase/migration_meeting_reminders.sql` — estado por evento (idempotente).
- `vercel.json` — cron diario 10:00 ART (solo dispara en el deploy de producción).

Nada de esto hace nada hasta que estén cargadas las variables de entorno. **Sin
credenciales no envía (falla cerrado).**

---

## Acciones necesarias (tu lado)

> **Ningún secreto por chat / WhatsApp / Markdown.** Todo se carga como variables
> protegidas en Vercel.

### v1 — lo mínimo para arrancar (sin webhook)

El número queda en **coexistencia** (sigue en WhatsApp Business del celular), así que las
respuestas **Confirmar / Reprogramar** las ves en el teléfono. Para esto NO hace falta
App Secret, verify token ni webhook. Solo:

1. **`WHATSAPP_TOKEN`** — reutilizá el token del System User de Aikestar/Fixy (si el número
   de RUN está en una WABA del mismo Business Manager y ese System User tiene acceso).
2. **`WHATSAPP_PHONE_ID`** — del número **+54 11 6600-6717** (WhatsApp → API Setup).
3. **Plantilla `recordatorio_meet`** aprobada en la WABA de RUN.
4. **Google Calendar**: service account + compartir el calendario (sección B).
5. **`CRON_SECRET`** + aplicar la migración.

El **tracking automático** de confirmaciones (webhook + App Secret + App dedicada) es
**fase 2**, opcional. El código del webhook ya está listo en la rama para cuando se quiera.

### A. WhatsApp / Meta — habilita el envío
1. En **Meta Business**, tener la WhatsApp Business Account (WABA) con el **número nuevo**.
   Al registrarlo en la API, elegir el modo que **mantiene WhatsApp Business en el celular** (coexistencia).
2. Crear una **App** (tipo Business) en developers.facebook.com → agregar el producto **WhatsApp** → vincular la WABA.
3. Crear un **System User** (Business Settings → Users → System Users), asignarle la App y la WABA,
   y generar un **token permanente** con permisos `whatsapp_business_messaging` y `whatsapp_business_management`
   → `WHATSAPP_TOKEN`.
4. Anotar `WHATSAPP_PHONE_ID` (del número) y `WHATSAPP_WABA_ID`.
5. App → Configuración → Básica → copiar **App Secret** → `WHATSAPP_APP_SECRET`.
6. Inventar un string al azar → `WHATSAPP_VERIFY_TOKEN`.
7. Crear las **plantillas** (ver abajo) en WhatsApp Manager → Plantillas de mensaje y mandarlas a aprobar
   (categoría **UTILITY**, idioma **español**). Tardan de minutos a ~1 día.

### B. Google Calendar — de dónde salen los meets
1. En **Google Cloud Console**: proyecto nuevo o existente → habilitar **Google Calendar API**.
2. Crear un **Service Account** → Keys → Add key → **JSON** → descargar. El JSON **entero** va a `GOOGLE_SERVICE_ACCOUNT_JSON`.
3. Copiar el **email** del service account (`…@….iam.gserviceaccount.com`).
4. En Google Calendar → Configuración del calendario que usa Centrilize → **Compartir con personas concretas**
   → agregar ese email con permiso **"Ver todos los detalles del evento"**.
5. `GOOGLE_CALENDAR_ID` = el id del calendario (normalmente tu email de Google).

### C. RUN / Vercel
1. Cargar **todas** las variables en Vercel (Production; y Preview si querés probar antes).
2. Inventar y cargar `CRON_SECRET` (Vercel lo manda solo en el header del cron).
3. Aplicar `supabase/migration_meeting_reminders.sql` en Supabase (SQL Editor).
4. Configurar el webhook: App de Meta → WhatsApp → Configuration → Webhook:
   - **Callback URL:** `https://run72.app/api/whatsapp/webhook`
   - **Verify token:** el `WHATSAPP_VERIFY_TOKEN`
   - Suscribir el campo **`messages`**.
5. El cron ya está programado en `vercel.json`. Corre solo en el deploy de **producción**.

---

## Variables de entorno

| Variable | Qué es | Obligatoria |
|---|---|---|
| `WHATSAPP_TOKEN` | Token permanente del System User | sí |
| `WHATSAPP_PHONE_ID` | ID del número +54 11 6600-6717 | sí |
| `WHATSAPP_APP_SECRET` | App Secret (firma del webhook) | fase 2 |
| `WHATSAPP_VERIFY_TOKEN` | String propio para verificar el webhook | fase 2 |
| `WHATSAPP_WABA_ID` | ID de la WABA (solo para gestionar plantillas por API) | no |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | JSON completo de la clave del service account | sí |
| `GOOGLE_CALENDAR_ID` | ID del calendario (tu email de Google) | sí |
| `CRON_SECRET` | String propio; protege el endpoint del cron | sí |
| `WHATSAPP_TEMPLATE_CONFIRM` | Plantilla de confirmación (default `confirmacion_reserva`) | no |
| `WHATSAPP_TEMPLATE_REMINDER` | Plantilla de recordatorio (default `recordatorio_meet`) | no |
| `WHATSAPP_TEMPLATE_LANG` | Idioma de las plantillas (default `es`) | no |
| `BOOKING_CONFIRM_MIN_MIN` | Min. minutos tras agendar antes de confirmar (default `10`) | no |
| `BOOKING_CONFIRM_MAX_MIN` | Máx. minutos tras agendar para confirmar (default `120`) | no |
| `REMINDER_MINUTES_BEFORE` | Minutos antes de la meet para recordar (default `30`) | no |

---

## Plantillas en WhatsApp Manager (ya creadas)

Las dos están creadas en la WABA de RUN y enviadas a revisión de Meta (UTILITY · Español),
con botones de respuesta rápida **`Confirmar` · `Reprogramar`** y ejemplos
{{1}} = `Juan`, {{2}} = `jueves 13 de noviembre, 10:00`.

### `confirmacion_reserva` — ① ~10-20 min después de agendar
```
Hola {{1}} 👋 ¡Recibimos tu reserva! Tu reunión con RUN quedó para {{2}}.

¿Confirmás tu asistencia?
```

### `recordatorio_meet` — ② ~30 min antes de la meet
```
Hola {{1}} 👋 Te recordamos tu reunión con RUN: {{2}}.

¿Confirmás tu asistencia?
```

El cron envía dos variables: `{{1}}` = nombre, `{{2}}` = fecha/hora legible.
El webhook (fase 2) interpreta **Confirmar** → `confirmed` y **Reprogramar** → `reschedule`.

---

## Formato del invitado (confirmado)

Centrilize deja el dato con etiquetas, así:

```
Invitado: Emiliano Cocilobo
Correo electrónico del invitado: emiliano...@gmail.com
Numero de WhatsApp: +54 2323 53-8166
Hora/fecha del evento: Tuesday, November 10, 2026 10:00 AM
Zona horaria del invitado: -03
```

El parser lee la etiqueta `Numero de WhatsApp:` y la etiqueta `Invitado:`. El número viene
**sin el "9"** de los móviles argentinos → se normaliza a `549...` para que WhatsApp entregue
(`+54 2323 53-8166` → `5492323538166`). La fecha/hora sale del `start` del evento del calendario.

> ⚠️ **Verificar una vez:** abrí en Google Calendar el evento real (ej. el de Emiliano, 10/11)
> y confirmá que la **descripción del evento** trae esas líneas (no solo el email). Si el WhatsApp
> aparece en el email pero **no** en el evento del calendario, avisá: hay un plan B que lee el aviso
> por correo en vez del calendario.

## Número que envía
`+54 11 6600-6717` (WhatsApp Business, en coexistencia → sigue en el celular).

## Probar sin molestar a nadie
1. Cargar las variables en **Preview**.
2. Agendar un evento de prueba en tu calendario con **tu propio WhatsApp** en la descripción.
3. Disparar el cron a mano:
   ```bash
   curl -H "Authorization: Bearer $CRON_SECRET" https://<preview>/api/whatsapp/cron
   ```
   (Los crons automáticos de Vercel solo corren en producción; en Preview se dispara a mano.)
