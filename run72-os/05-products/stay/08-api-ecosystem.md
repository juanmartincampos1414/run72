# Stay — 08 API & Ecosystem Strategy

| | |
|---|---|
| **Producto** | Stay |
| **Documento** | 08 API & Ecosystem Strategy |
| **Versión** | v0.1 |
| **Estado** | Draft |
| **Owner** | RUN72 |
| **Última actualización** | Junio 2026 |

> Las integraciones son **Connectors** (AD-003): traducen el mundo externo a eventos del modelo,
> y ejecutan acciones salientes. **El proveedor es implementación** (se elige por propiedad/piloto);
> el modelo no depende de ninguno. Guía: *API & Ecosystem Playbook*.

---

## Catálogo de Connectors

| Sistema | Categoría | Dir | Qué aporta / hace | Alimenta | Evento / Webhook | MVP |
|---|---|---|---|---|---|---|
| QR | Captura | in | punto de interacción por momento | Guest Identity · Moment | `stay.interaction.captured` | ✅ |
| WhatsApp (inbound) | Captura/Canal | in | identificación + interacción conversacional | Guest Identity · Moment | `stay.interaction.captured` | ✅ |
| NFC | Captura | in | interacción en habitación/espacios | Moment | `stay.interaction.captured` | ◻️ post |
| WiFi (captive) | Captura | in | identificación al conectarse | Guest Identity | `stay.interaction.captured` | ◻️ post |
| Wallet | Captura/Beneficios | in/out | credencial + rewards | Loyalty/Club | `stay.reward.redeemed` | ◻️ post |
| **PMS** | Sistema hotel | in/out | datos de reserva/estadía, **atribución** | Stay · Direct Relationship | webhook `booking.created/updated` | ◻️ post¹ |
| Booking Engine / CRS | Sistema hotel | in | origen de reserva (OTA vs directo) | Booking · atribución | webhook reserva | ◻️ post¹ |
| POS | Sistema hotel | in | consumo (Trufa, room service) | Moment · Recognized | `stay.experience.logged` | ◻️ post |
| WhatsApp Business API | Comms (out) | out | mensajes/campañas/incentivos | Campaign · Notification · Direct Relationship | consume transiciones | ✅ |
| Email Marketing | Comms (out) | out | campañas post-stay | Campaign | consume transiciones | ✅ |
| Payment Provider (Stripe/MercadoPago) | Pagos | in/out | cobro de reserva directa / incentivos | Direct Relationship | webhook pago | ◻️ post |
| Google Reviews | Reputación | in/out | solicitar/leer reseñas (→ Advocate) | Review Engine | `stay.guest.advocated` | ✅ |
| TripAdvisor | Reputación | in/out | reseñas | Review Engine | `stay.guest.advocated` | ◻️ post |
| Analytics | Medición | out | KPIs externos | Analytics | consume todo | ◻️ post (interno ✅) |
| **AI Gateway** (Shared) | IA | in/out | insights/recomendaciones | Relationship Intelligence | `stay.insight.generated` | ✅ |

¹ **Atribución en el piloto:** la integración profunda con PMS/Booking es pesada; en Palacio Paz
la atribución de reserva directa puede arrancar **manual/CSV** y automatizarse después. Lo que
importa para el MVP es **poder atribuir**, no la integración completa.

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

## Para pasar a Frozen (faltante)
- [ ] OK del Founder al catálogo de Connectors y a la selección MVP.
- [ ] Confirmar que la atribución del MVP arranca manual/CSV en el piloto.
- [ ] Aprobación → **Frozen v1.0** → habilita `09 MVP Scope`.
