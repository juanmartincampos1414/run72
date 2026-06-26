# Stay — 05 Product Engines

| | |
|---|---|
| **Producto** | Stay |
| **Documento** | 05 Product Engines |
| **Versión** | v1.0 |
| **Estado** | **FROZEN** |
| **Owner** | RUN72 |
| **Última actualización** | Junio 2026 |
| **Modificaciones** | Ninguna (mejoras futuras → nueva versión, sin reabrir la etapa) |

> Capacidades permanentes derivadas del **Relationship Lifecycle** (`04`, FROZEN), conectadas
> por **eventos**. Arquitectura en capas (**AD-003**): **Engines ejecutan · Business Rules
> deciden · Connectors conectan · Shared Components se reutilizan.** 🆕 nuevo · ♻️ reutilizado de Tips+.

---

## Principio rector
**Los Engines no deciden, ejecutan.** Toda lógica de decisión (cuándo avanza un estado, qué
incentivo aplica, qué beneficio corresponde) vive en `07 Business Rules`. Los Engines son
deterministas, simples y reutilizables.

## Mapa de capas y eventos

```
CONNECTORS (Plugins)  QR · NFC · WiFi · WhatsApp · Wallet · PMS · POS · Booking
        │  traducen el mundo externo → stay.interaction.captured
        ▼
Guest Identity Engine ──identified/known──▶ Relationship Lifecycle Engine (CORE)
Experience/Moment Engine ──engaged/recognized──▶ (ejecuta transiciones según Business Rules 07)
                                          │ emite transiciones de estado
        ┌─────────────────────────────────┼───────────────────────────────┐
        ▼                                  ▼                               ▼
 Direct Relationship Engine        Loyalty/Club Engine          Campaign · Notification · Review
        │                                                                   │
        └────────────▶ Relationship Intelligence Engine ◀──────────────────┘
                 (aprende de TODO; produce conocimiento/insights)
Todos los eventos ──▶ Analytics / Event Tracking (KPIs · North Star · Business Outcome)
```

---

## Connectors / Plugins *(no son Engines — AD-003)*
QR · NFC · WiFi · WhatsApp · Wallet · PMS · POS · Booking Engine. Mecanismos de entrada/salida
que **traducen el mundo externo a eventos normalizados** (`stay.interaction.captured`) y
alimentan al Guest Identity Engine. Intercambiables; se validan en el piloto. Alineado con el
**Plugin System** de RUN72.

---

## 🆕 1. Relationship Lifecycle Engine — **CORE**
- **Objetivo:** mantener el `RelationshipState` de cada huésped y **ejecutar** las transiciones
  de profundidad de relación. **No decide** las transiciones: las dicta `07 Business Rules`.
- **Inputs:** eventos de identidad / momento / reserva + **reglas de transición (07)**.
- **Outputs:** estado actual + historial; **eventos de transición**.
- **KPIs:** distribución por estado · tasas de transición · **Direct Guest Relationship Rate**.
- **Dependencias:** Guest Identity, Business Rules (07), Event Tracking.
- **APIs:** `getRelationshipState(guest)` · `applyTransition(guest, event)` *(según regla)*.
- **Eventos:** emite `stay.guest.{identified,engaged,known,recognized,loyal,advocated}`.

## 🆕 2. Guest Identity Engine *(sobre Guest Profiles de Tips+)*
- **Objetivo:** resolver y unificar la identidad del huésped a través de connectors, momentos y estadías.
- **Inputs:** `stay.interaction.captured` (de Connectors), datos pre-stay, opt-in.
- **Outputs:** Guest unificado, match/merge, nivel de conocimiento.
- **KPIs:** **Guest Capture Rate** · % perfiles unificados.
- **Dependencias:** ♻️ Tips+ Guest Profiles, CRM.
- **Eventos:** emite `stay.guest.identified`, `stay.guest.known`.

## 🆕 3. Experience / Moment Engine
- **Objetivo:** registrar cada interacción como un **Moment** estructurado y derivar señales
  (Engaged/Recognized) y preferencias para el Lifecycle.
- **Inputs:** `stay.interaction.captured`, contexto del momento.
- **Outputs:** entidad **Moment/Interaction**, señales, preferencias.
- **KPIs:** moments por estadía · engagement depth.
- **Dependencias:** Connectors, Lifecycle, CRM.
- **Eventos:** emite `stay.guest.engaged`, `stay.experience.logged`, `stay.guest.recognized`.

## 🆕 4. Direct Relationship Engine *(antes "Recapture" — responsabilidad ampliada)*
- **Objetivo:** construir, sostener y **recuperar** la relación directa hotel–huésped a lo largo
  del tiempo — incluida la reserva directa y su **atribución** (Returning), pero no limitada a ella.
- **Inputs:** RelationshipState, incentivos/beneficios (según reglas 07), eventos post-stay,
  datos de reserva (origen OTA vs directo, vía Connectors).
- **Outputs:** acciones de relación directa, **atribución** de reserva, comisión evitada / revenue recapturado.
- **KPIs:** **Direct Booking Conversion** · **OTA Revenue Recaptured** (Business Outcome) · recompra.
- **Dependencias:** ♻️ Campaign, CRM, Lifecycle, Business Rules (07), Connectors (PMS/Booking).
- **Eventos:** emite `stay.directrelationship.action`, `stay.directbooking.confirmed`.

## 🆕 5. Relationship Intelligence Engine
- **Objetivo:** **aprender** sobre la relación huésped–hotel. No solo registra eventos: construye
  **conocimiento** (perfiles enriquecidos, patrones, propensiones) que alimenta campañas,
  recomendaciones, IA, personalización y decisiones futuras. (Capa AI-Native del producto.)
- **Inputs:** todos los eventos del ecosistema (interacción, momentos, transiciones, reservas).
- **Outputs:** insights, segmentos, recomendaciones, scores de propensión (p. ej. propensión a recompra directa).
- **KPIs:** calidad/uso de insights · lift de campañas/recomendaciones impulsadas por el engine.
- **Dependencias:** Analytics/Event Tracking, CRM, AI Gateway (Shared), Lifecycle.
- **Eventos:** consume todo; emite `stay.insight.generated`, recomendaciones para Campaign/Direct Relationship.

## 🆕/♻️ 6. Loyalty / Club Engine *(reutiliza Wallet/Rewards de Tips+)*
- **Objetivo:** ejecutar el Guest Club y los beneficios/rewards (Recognized→Loyal). **Qué beneficio
  corresponde** lo deciden las Business Rules (07); el engine lo ejecuta.
- **Inputs:** RelationshipState, consumo, reglas de beneficios (07).
- **Outputs:** membresía, rewards, beneficios aplicados.
- **KPIs:** % miembros activos · redemption · retención (Loyal).
- **Dependencias:** ♻️ Tips+ Wallet/Rewards, Lifecycle, Business Rules (07), CRM.
- **Eventos:** emite `stay.reward.redeemed`, `stay.guest.loyal`.

---

## ♻️ Reutilizados directos de Tips+ (referencia)
Campaign Engine · Notification Engine · Review Engine (→ `stay.guest.advocated`) ·
CRM/Guest Profile · Analytics/Event Tracking · Auth/Roles/Organizations.

---

## Las innovaciones más fuertes (para defender)
1. **Relationship Lifecycle Engine + Business Rules** — el modelo conceptual hecho motor, con la
   lógica de decisión separada y versionable. Difícil de copiar.
2. **Direct Relationship Engine** — la **atribución** del ingreso recuperado vuelve el ROI medible.
3. **Relationship Intelligence Engine** — el producto **aprende** y se vuelve más valioso con cada
   estadía (ventaja compuesta, AI-Native).
4. **Connectors / Plugin System** — Stay corre en cualquier hotel sin atarse a una tecnología.

## Freeze Checklist
- [x] Set final: Connectors (Plugins) + 6 Engines + reutilizados de Tips+.
- [x] Engines ejecutan / Business Rules deciden (AD-003).
- [x] Mapa de capas y eventos consistente con el Lifecycle.
- [x] Reutilización de Tips+ marcada.
- [x] **Aprobado por el Founder → FROZEN v1.0.** Habilita `06 Core Entities`.
