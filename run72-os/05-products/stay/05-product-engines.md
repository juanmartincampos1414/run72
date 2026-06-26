# Stay — 05 Product Engines

| | |
|---|---|
| **Producto** | Stay |
| **Documento** | 05 Product Engines |
| **Versión** | v0.1 |
| **Estado** | Draft |
| **Owner** | RUN72 |
| **Última actualización** | Junio 2026 |

> Capacidades permanentes derivadas del **Relationship Lifecycle** (`04`, FROZEN). Conectadas
> por **eventos**, no por llamadas directas. 🆕 = nuevo · ♻️ = reutilizado de Tips+.
> Guía: *Product Engines Playbook*.

---

## Mapa de eventos (cómo se conectan)

```
Entry Point Engine ──stay.interaction.captured──▶ Experience/Moment + Guest Identity
        Guest Identity ──identified / known──▶ Relationship Lifecycle Engine (CORE)
        Experience/Moment ──engaged / recognized──▶ Relationship Lifecycle Engine
Relationship Lifecycle ──transiciones (loyal, returning, advocated…)──▶
        ▶ Loyalty/Club · Campaign · Notification · Review · Direct Booking/Recapture
Todos los eventos ──▶ Analytics / Event Tracking (KPIs, North Star, Business Outcome)
```

---

## 🆕 1. Relationship Lifecycle Engine — **CORE**

- **Objetivo:** ser el cerebro del modelo: mantener el **RelationshipState** de cada huésped y
  avanzar la **profundidad** de la relación a partir de eventos (no lineal).
- **Inputs:** eventos de interacción (Experience/Moment, Entry Point), identidad (Guest Identity), reservas (Direct Booking).
- **Outputs:** estado actual + historial por Guest; **eventos de transición**.
- **KPIs:** distribución de huéspedes por estado · tasas de transición · **Direct Guest Relationship Rate**.
- **Dependencias:** Guest Identity, Event Tracking.
- **APIs:** `getRelationshipState(guest)` · `advanceState(event)` · config de reglas de transición **por hotel**.
- **Eventos:** consume interacción/identidad/reserva → emite `stay.guest.{identified,engaged,known,recognized,loyal,advocated}`, `stay.directbooking.confirmed`.

## 🆕 2. Guest Identity Engine *(sobre Guest Profiles de Tips+)*

- **Objetivo:** resolver y unificar la identidad del huésped (Anonymous→Identified→Known) a
  través de canales, momentos y estadías. Un solo Guest, muchos touchpoints.
- **Inputs:** señales de captura (Entry Point), datos pre-stay (OTA), opt-in.
- **Outputs:** Guest unificado, match/merge, nivel de conocimiento.
- **KPIs:** **Guest Capture Rate** · % perfiles unificados · completitud de datos.
- **Dependencias:** ♻️ Tips+ Guest Profiles, CRM.
- **APIs:** `identify(signal)` · `resolve(guest)` · `enrich(prefs)`.
- **Eventos:** emite `stay.guest.identified`, `stay.guest.known`.

## 🆕 3. Entry Point Engine

- **Objetivo:** abstraer los mecanismos de captura (QR/NFC/WiFi/WhatsApp/Wallet) en **una
  interfaz única** → eventos de interacción normalizados, independientes del canal.
- **Inputs:** tap NFC, scan QR, login WiFi, msg WhatsApp, acción Wallet.
- **Outputs:** interaction event normalizado (quién · dónde · qué momento · qué canal).
- **KPIs:** interacciones por Entry Point · **tasa de activación por canal** (clave para el piloto).
- **Dependencias:** — (capa de entrada).
- **APIs:** `registerEntryPoint(...)` · `handleInteraction(channel, payload)`.
- **Eventos:** emite `stay.interaction.captured`.
- *Nota:* desacopla el modelo de los canales (AD-002). Los canales se validan en el piloto.

## 🆕 4. Experience / Moment Engine

- **Objetivo:** registrar cada interacción como un **Moment** estructurado y derivar señales de
  relación (Engaged/Recognized) y preferencias (Known) para el Lifecycle.
- **Inputs:** `stay.interaction.captured`, contexto del momento (Hotel Journey).
- **Outputs:** entidad **Moment/Interaction**, señales para el Lifecycle, datos de preferencia.
- **KPIs:** moments por estadía · engagement depth.
- **Dependencias:** Entry Point, Lifecycle, CRM.
- **APIs:** `logMoment(...)` · `getGuestMoments(guest)`.
- **Eventos:** emite `stay.guest.engaged`, `stay.experience.logged`, `stay.guest.recognized`.

## 🆕 5. Direct Booking / Recapture Engine — **corazón del negocio**

- **Objetivo:** impulsar y **atribuir** la reserva directa (Returning) y medir el **OTA Revenue
  Recaptured**. Convierte la relación en ingreso directo. (El moat: la atribución.)
- **Inputs:** RelationshipState (Loyal/Recognized), incentivos, eventos post-stay, datos de
  reserva (origen OTA vs directo, vía integraciones).
- **Outputs:** incentivo de reserva directa, **atribución** de la reserva, comisión evitada /
  revenue recapturado.
- **KPIs:** **Direct Booking Conversion** · **OTA Revenue Recaptured** (Business Outcome) · tiempo a recompra.
- **Dependencias:** ♻️ Campaign (envío de incentivos), CRM, Lifecycle, Analytics, integraciones PMS/Booking (etapa 08).
- **APIs:** `sendIncentive(guest)` · `attributeBooking(booking)` · `recapturedRevenue(property)`.
- **Eventos:** emite `stay.directbooking.incentive_sent`, `stay.directbooking.confirmed`.

## 🆕/♻️ 6. Loyalty / Club Engine *(reutiliza Wallet/Rewards de Tips+)*

- **Objetivo:** gestionar el Guest Club, beneficios y rewards que sostienen la relación (Recognized→Loyal).
- **Inputs:** RelationshipState, consumo (Trufa, spa), reglas de beneficios del hotel.
- **Outputs:** membresía de club, rewards, beneficios aplicados.
- **KPIs:** % miembros activos · reward redemption · retención (Loyal).
- **Dependencias:** ♻️ Tips+ Wallet/Rewards, Lifecycle, CRM.
- **APIs:** (de Wallet) `issueReward` · `redeem` · gestión de membresía.
- **Eventos:** emite `stay.reward.redeemed`, `stay.guest.loyal`.

---

## ♻️ Reutilizados directos de Tips+ (referencia — no se rediseñan)

| Engine | Rol en Stay | Evento |
|---|---|---|
| **Campaign Engine** | Comms pre/post-stay + incentivos de reserva directa | consume transiciones |
| **Notification Engine** | Avisos a staff/huésped (room service, etc.) | consume `stay.service.requested` |
| **Review Engine** | Reseñas (→ Advocate) | emite `stay.guest.advocated` |
| **CRM / Guest Profile** | Base de huéspedes directa del hotel | consume todo |
| **Analytics / Event Tracking** | KPIs, North Star, Business Outcome | consume todo |
| **Auth / Roles / Organizations** | Multi-propiedad, accesos | base |

---

## Las innovaciones más fuertes (para defender)
1. **Relationship Lifecycle Engine** — el modelo conceptual hecho motor: nadie compite con una
   feature, compiten con un modelo. Difícil de copiar.
2. **Direct Booking / Recapture Engine** — la **atribución** del ingreso recuperado de las OTAs
   es lo que vuelve el valor de Stay medible y vendible (ROI demostrable).
3. **Entry Point Engine** — desacopla el modelo de los canales: Stay funciona en cualquier hotel
   sin atarse a una tecnología.

## Para pasar a Frozen (faltante)
- [ ] OK del Founder al set de Engines (nuevos + reutilizados) y al mapa de eventos.
- [ ] Confirmar que todo lo reutilizable de Tips+ está marcado como reutilizado.
- [ ] Aprobación → **Frozen v1.0** → habilita `06 Core Entities`.
