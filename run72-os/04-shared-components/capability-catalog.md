# Capability Catalog — RUN72

| | |
|---|---|
| **Estado** | Vivo (Draft estructural) |
| **Owner** | RUN72 (gobernado a nivel Framework) |
| **Base** | AD-005 (Capability→Connector→Provider) · AD-006 (Integration Runtime) |

> **Fuente de verdad** de las capacidades del ecosistema RUN72 — no solo documentación.
> Los productos consumen **Capabilities**; los Connectors las implementan; los Providers son
> intercambiables. Un producto nuevo **reutiliza/extiende** este catálogo; no inventa capabilities
> en paralelo. (Evita la deriva de granularidad que mata la reutilización.)

## Qué define cada Capability
1. **Propósito de negocio** · 2. **Productos que la usan** · 3. **Connectors disponibles** ·
4. **Providers compatibles** · 5. **Eventos** (produce/consume) · 6. **Shared Components asociados** ·
7. **Estado de madurez** (Draft → Pilot → Certified, vía Regla del Tres).

> Los **contratos de Connector** son APIs versionadas (semver + contract tests). Se **certifican**
> con ≥2–3 Providers reales. Hasta entonces: Draft.

---

## Capabilities — Stay (Hospitality)

| Capability | Propósito | Productos | Connector(s) | Providers (ej., abiertos) | Eventos | Shared Components | Madurez |
|---|---|---|---|---|---|---|---|
| **Guest Capture** | Identificar al huésped en cada momento | Stay | Capture | QR, NFC, WiFi | produce `interaction.captured` | Integration Runtime, Guest Identity | Pilot (QR) |
| **Guest Messaging** | Comunicación directa con el huésped | Stay, Tips+ | Messaging | WhatsApp Business API, Email, SMS | produce/consume transiciones | Campaign, Notification, Runtime | Pilot |
| **Property Management** | Datos de reserva/estadía | Stay | PMS | Cloudbeds, Mews, Opera, Oracle, HotelRunner | consume `booking.*` (webhook) | Runtime (ACL) | Draft |
| **Reservations** | Origen de reserva (OTA vs directo) | Stay | Booking/CRS | SiteMinder, Mirai, SynXis, Bookassist | consume reserva | Runtime | Draft |
| **Reviews / Reputation** | Reseñas (→ Advocate) | Stay, Tips+ | Reputation | Google, TripAdvisor, Booking, Expedia | produce `guest.advocated` | Review Engine | Pilot (Google) |
| **Payments** | Cobro de reserva directa / incentivos | Stay, Tips+ | Payments | Stripe, Mercado Pago, Adyen, Fiserv | consume webhook pago | Runtime, Wallet | Draft |
| **Benefits / Wallet** | Club, beneficios, rewards | Stay, Tips+ | Wallet | (Wallet de Tips+) | produce `reward.redeemed` | Wallet/Rewards | Draft |
| **AI Intelligence** | Insights, recomendaciones, personalización | Stay, Margin, Tips+ | AI | Anthropic, OpenAI, Google | produce `insight.generated` | AI Gateway | Pilot |
| **Analytics** | KPIs (North Star, Business Outcome) | Stay, Margin, Tips+ | Analytics | (interno + externos) | consume todo | Analytics/Event Tracking | Pilot (interno) |

## Capabilities — Margin (semilla, se completa al construirlo)
Accounting · Procurement · Supplier Intelligence · Invoice OCR · BI & Reporting · Forecasting.

## Capabilities — Tips+ (semilla)
Payments · Reviews · Messaging · Wallet · CRM · Identity · Notifications.

---

## Capabilities compartidas (candidatas a contrato único de Framework)
**Messaging, Reviews/Reputation, Payments, AI Intelligence, Analytics** aparecen en ≥2 productos.
Son las primeras candidatas a **certificar un contrato de Connector común** (Regla del Tres) y a
vivir como Shared Component formal. Esa convergencia es la métrica real de la tesis RUN72.
