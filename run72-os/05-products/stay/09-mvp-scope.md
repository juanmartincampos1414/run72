# Stay — 09 MVP Scope

| | |
|---|---|
| **Producto** | Stay |
| **Documento** | 09 MVP Scope |
| **Versión** | v0.1 |
| **Estado** | Draft |
| **Owner** | RUN72 |
| **Última actualización** | Junio 2026 |

> El MVP valida **una sola hipótesis**. Lo más importante de este doc es el **NO-alcance**.
> Piloto: Palacio Paz (+ Trufa). Guía: *MVP Scope Playbook*.

---

## Hipótesis única

> **¿Podemos transformar un huésped que llegó por OTA en un huésped directo, y medir ese impacto?**

Todo lo que no sirva para responder esto queda afuera.

## Criterio de éxito (qué valida la hipótesis)

- Se **identifican** huéspedes OTA durante la estadía (Guest Capture Rate > 0 y creciente).
- Una parte avanza a **relación directa** (Direct Guest Relationship Rate medible).
- Se registra al menos la primera **reserva directa atribuible** (Returning) → **OTA Revenue
  Recaptured** demostrable (aunque la atribución sea manual/CSV).
- Umbrales concretos: a calibrar con los primeros datos del piloto.

## In-scope (lo mínimo imprescindible)

**Lifecycle / Engines:** Relationship Lifecycle (CORE) · Guest Identity · Experience/Moment ·
Direct Relationship · Relationship Intelligence (básico) · Loyalty/Club (mínimo).
**Capabilities (MVP):** Guest Capture (**QR**) · Guest Messaging (**WhatsApp + Email**) ·
Reviews (**Google**) · AI Intelligence (insights básicos) · Analytics (interno).
**Flows del Brief:** Guest Capture · Guest Club (mínimo) · Direct Booking Incentive · CRM básico ·
Campaigns · Review Flow · Dashboard.
**Atribución:** **manual/CSV** (no integración PMS).
**Reglas:** las de `07` con defaults; ejecución **propuesta** (AD-004), no automática.

## OUT-of-scope (explícito — NO se construye en el MVP)

- ❌ Integración con **PMS / CRS / Booking Engine** (atribución va manual/CSV).
- ❌ **POS**, **Payments** in-app, **Wallet/NFC/WiFi** como connectors.
- ❌ **TripAdvisor** / analytics externos.
- ❌ **Automatizaciones** que actúen sobre la operación del hotel (todo es propuesta/opt-in).
- ❌ Multi-propiedad / panel para cadenas (el piloto es una sola propiedad).
- ❌ Personalización/IA avanzada (solo insights básicos).
- ❌ Catálogo extenso de beneficios; arrancamos con 1–2 incentivos simples.
- ❌ Todo lo que no ayude a convertir OTA → directo y medirlo.

## Plan de piloto (Palacio Paz)

- Captura por QR en check-in (+ puntos en Trufa/habitación si suma) → identificación + opt-in.
- WhatsApp/Email para club, incentivo de reserva directa y review (Google).
- Atribución manual/CSV de la primera reserva directa.
- Objetivo: **aprender** y calibrar umbrales — no vender software.

## Para pasar a Frozen (faltante)
- [ ] OK del Founder a la hipótesis, in-scope y **NO-alcance**.
- [ ] Confirmar criterio de éxito (aunque los umbrales se calibren en piloto).
- [ ] Aprobación → **Frozen v1.0** → habilita `10 Build Specs`.
