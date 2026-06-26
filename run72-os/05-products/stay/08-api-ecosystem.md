# Stay — 08 API & Ecosystem Strategy

| | |
|---|---|
| **Producto** | Stay |
| **Documento** | 08 API & Ecosystem Strategy |
| **Versión** | v1.0 |
| **Estado** | **FROZEN** |
| **Owner** | RUN72 |
| **Última actualización** | Junio 2026 |
| **Modificaciones** | Ninguna. Providers concretos = implementación, se eligen por propiedad/piloto. |

> **Modelo de 3 capas (AD-005): Capability → Connector → Provider.** Stay depende de
> **capacidades del negocio**, no de proveedores. El **Connector** es el contrato; el **Provider**
> es una implementación intercambiable. *"Los productos de RUN72 nunca dependen de proveedores.
> Dependen de capacidades del negocio."* Guía: *API & Ecosystem Playbook*.

---

## Catálogo de Capabilities → Connectors → Providers

| Capability | Connector (contrato) | Providers (ejemplos · abiertos) | Dir | Alimenta | Evento | MVP |
|---|---|---|---|---|---|---|
| **Guest Capture** | Capture (QR/NFC/WiFi) | QR, NFC, WiFi captive | in | Guest Identity · Moment | `stay.interaction.captured` | QR ✅ |
| **Guest Messaging** | Messaging | WhatsApp Business API (Meta), SMS, Email | in/out | Identity · Campaign · Notification | `stay.interaction.captured` / consume transiciones | WhatsApp+Email ✅ |
| **Property Management** | PMS | Cloudbeds, Mews, Opera, Oracle Hospitality | in/out | Stay · Direct Relationship | webhook `booking.created/updated` | post¹ |
| **Reservations** | Booking Engine / CRS | SiteMinder, Mirai, SynXis, Bookassist | in | Booking · atribución | webhook reserva | post¹ |
| **Point of Sale** | POS | (según hotel) | in | Moment · Recognized | `stay.experience.logged` | post |
| **Reviews / Reputation** | Reputation | Google Reviews, TripAdvisor, Booking Reviews | in/out | Review Engine | `stay.guest.advocated` | Google ✅ |
| **Payments** | Payments | Stripe, Mercado Pago, Adyen | in/out | Direct Relationship | webhook pago | post |
| **Benefits / Wallet** | Wallet | (Wallet de Tips+) | in/out | Loyalty/Club | `stay.reward.redeemed` | post |
| **AI Intelligence** | AI Gateway (Shared) | (modelos vía AI Gateway) | in/out | Relationship Intelligence | `stay.insight.generated` | ✅ |
| **Analytics** | Analytics | (interno + externos) | out | Analytics | consume todo | interno ✅ |

¹ **Atribución en el piloto:** la integración profunda con PMS/Booking es pesada; en Palacio Paz
la atribución de reserva directa arranca **manual/CSV** y se automatiza después. Para el MVP
importa **poder atribuir**, no integrar todo.

> El **catálogo de Capabilities + contratos de Connector** es reutilizable por todo RUN72
> (`04 Shared Components`). Un Provider nuevo = nueva implementación del contrato; el producto no cambia.

## Estrategia de eventos
- **Entrantes:** Connectors → `stay.interaction.captured` / webhooks de reserva-pago → Engines.
- **Salientes:** transiciones del Lifecycle → acciones (WhatsApp/email/incentivo) vía Campaign/Notification/Direct Relationship.
- **Bus de eventos** como columna vertebral (entidad `Event`); los Connectors nunca llaman Engines directo.

## Integraciones esenciales del MVP (piloto Palacio Paz)
**Captura:** QR + WhatsApp. **Comms:** WhatsApp + Email. **Reputación:** Google Reviews.
**IA:** AI Gateway (Relationship Intelligence). **Atribución:** manual/CSV al inicio.
Todo lo demás (PMS/CRS/POS/Payments/Wallet/NFC/TripAdvisor) = **post-MVP**.

## Proveedores = implementación (abiertos)
El proveedor concreto de cada categoría se decide por propiedad/piloto. El producto funciona con
cualquiera que cumpla el contrato del Connector. (No fijar vendors en el modelo.)

## Freeze Checklist
- [x] Modelo Capability → Connector → Provider (AD-005).
- [x] Catálogo de capabilities con Connector, providers de ejemplo (abiertos), dirección, evento, MVP.
- [x] MVP: QR + WhatsApp + Email + Google Reviews + AI Gateway; atribución manual/CSV en piloto.
- [x] Providers = implementación (no fijados en el modelo).
- [x] **Aprobado por el Founder → FROZEN v1.0.** Habilita `09 MVP Scope`.
