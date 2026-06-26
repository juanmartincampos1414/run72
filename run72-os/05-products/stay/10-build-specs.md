# Stay — 10 Build Specs (MVP)

| | |
|---|---|
| **Producto** | Stay |
| **Documento** | 10 Build Specs |
| **Versión** | v0.1 |
| **Estado** | Draft |
| **Owner** | RUN72 |
| **Última actualización** | Junio 2026 |

> Solo implementación, solo el **MVP Scope (09 FROZEN)**. ♻️ = reutiliza Tips+/Shared · 🆕 = nuevo.
> Doble pregunta (LL-002): lo 🆕 se diseña para que sea reutilizable por el ecosistema.

---

## A. Modelo de datos (MVP)

| Entidad | Campos mínimos (MVP) | Origen |
|---|---|---|
| **Guest** | id, property_id, nombre, email, whatsapp, prefs(json), opt_in, source(OTA/directo) | ♻️ Tips+ Guest Profiles |
| **Property** | id, nombre, config(json: reglas, connectors, incentivo) | ♻️ Organizations |
| **Stay** | id, guest_id, property_id, check_in, check_out, origin(OTA/directo) | 🆕 |
| **RelationshipState** | guest_id, property_id, state, history(json: state,event,ts) | 🆕 |
| **Moment** | id, guest_id, stay_id, property_id, type, connector, data(json), ts | 🆕 |
| **Booking** | id, guest_id, property_id, origin, value, commission_saved, attributed_stay_id, status | 🆕 |
| **Reward** | id, guest_id, property_id, type, status (mínimo) | ♻️ Tips+ Wallet |
| **Event** | id, type(`stay.*`), actor, payload(json), ts, source | ♻️ Event Tracking |

## B. Módulos del MVP

### 🆕 Relationship Lifecycle Engine (CORE)
- **Responsabilidad:** ejecutar transiciones de `RelationshipState` según reglas (07). Máquina de estados.
- **API:** `GET /guests/:id/state` · `POST /lifecycle/apply` (event) .
- **Eventos:** consume `stay.guest.*`/`booking.*` → emite transiciones.
- **MVP:** reglas R-L1..L7 como **config declarativa**; sin motor de reglas externo (tabla simple).

### 🆕 Guest Identity
- **Responsabilidad:** capturar identidad + opt-in; merge básico por email/whatsapp.
- **API:** `POST /identify` (signal de connector) · `GET /guests/:id`.
- **Eventos:** emite `stay.guest.identified`, `stay.guest.known`.
- **Reutiliza:** ♻️ Guest Profiles. **MVP:** merge por match exacto (email/teléfono).

### 🆕 Experience / Moment
- **Responsabilidad:** registrar Moments desde `stay.interaction.captured`; derivar señales.
- **API:** `POST /moments` · `GET /guests/:id/moments`.
- **Eventos:** emite `stay.guest.engaged/recognized`, `stay.experience.logged`.

### 🆕 Direct Relationship (incl. atribución)
- **Responsabilidad:** disparar el **Direct Booking Incentive** (regla R-IN, tipo configurable) y
  **atribuir** reservas directas → `commission_saved`.
- **API:** `POST /incentives/send` · `POST /bookings/import` (**CSV manual**, MVP) · `GET /metrics/recaptured`.
- **Eventos:** emite `stay.directbooking.incentive_sent`, `stay.directbooking.confirmed`.
- **MVP:** incentivo = parámetro de la Property (manual); atribución por import CSV.

### 🆕 Relationship Intelligence (básico)
- **Responsabilidad:** insights mínimos (propensión a recompra, segmento) desde eventos.
- **API:** `GET /guests/:id/insights`.
- **Reutiliza:** ♻️ **AI Gateway** (Anthropic). **MVP:** 1–2 insights simples, no modelo propio.

### ♻️ Reutilizados (config, no se construyen)
Campaign · Notification · Review · CRM · Analytics/Event Tracking · Auth/Roles/Orgs (de Tips+).

## C. Connectors del MVP (contratos mínimos)

| Connector | Contrato mínimo (MVP) | Provider |
|---|---|---|
| **Capture** | recibe scan/tap → `POST /identify` + `POST /moments` | QR |
| **Messaging** | `send(template, to, channel)` + inbound → moment | WhatsApp API + Email |
| **Reputation** | `requestReview(guest)` → link; ingestar reseña → `stay.guest.advocated` | Google |
| **AI** | `infer(prompt|signals) → insight` | AI Gateway |
> Contratos en **Draft** (se certifican con ≥2 providers, AD-005/006). Auth/sync/normalización vía Integration Runtime (AD-006).

## D. Dashboard (MVP)
KPIs del Lifecycle: Guest Capture Rate · Direct Guest Relationship Rate · Returning · **OTA Revenue
Recaptured** (de `commission_saved`). Distribución de huéspedes por estado.

## Out (no se construye en el MVP)
Integraciones PMS/CRS/POS/Payments/Wallet-NFC-WiFi · automatizaciones operativas · multi-propiedad ·
plataforma de beneficios · motor de reglas externo · IA avanzada. (Ver 09.)

## Para pasar a Frozen (faltante)
- [ ] Revisión Founder + Engineering del set de módulos y modelo de datos.
- [ ] Confirmar stack/Arquitectura concreta → se define en `12 Arquitectura` (no acá).
- [ ] Aprobación → **Frozen v1.0** → habilita `11 Sprint Planning`.
