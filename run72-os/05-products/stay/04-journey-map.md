# Stay — 04 Journey Map

| | |
|---|---|
| **Producto** | Stay |
| **Documento** | 04 Journey Map |
| **Versión** | v0.2 |
| **Estado** | Draft (listo para Frozen) |
| **Owner** | RUN72 |
| **Última actualización** | Junio 2026 |

> Dos niveles (ver **AD-002**): un **Relationship Lifecycle universal** (modelo del producto)
> y un **Hotel Journey** (implementación de cada propiedad). De los estados del Lifecycle nacen
> los Engines, las Core Entities, los KPIs y el CRM. Los **Entry Points** son mecanismos de
> implementación a validar en el piloto, no se fijan en el modelo.

---

## Parte A — Relationship Lifecycle (universal)

El modelo conceptual de Stay: la relación hotel–huésped avanza por **estados**. Cada
transición emite un **evento** que alimenta el ecosistema. Aplica a **cualquier** propiedad.

| Estado | Qué significa (relación) | Objetivo del producto | Evento de transición |
|---|---|---|---|
| **Anonymous** | El huésped existe pero el hotel no lo conoce directo (llegó por OTA) | Crear la oportunidad de identificarlo | `stay.guest.appeared` |
| **Identified** | Se identifica y da opt-in → nace la relación directa | Capturar identidad + consentimiento | `stay.guest.identified` |
| **Engaged** | Interactúa con servicios/experiencias de la estadía | Generar interacción de valor | `stay.guest.engaged` |
| **Known** | El hotel conoce sus preferencias (datos para personalizar) | Capturar preferencias | `stay.guest.known` |
| **Recognized** | El hotel lo trata distinto: personalización/beneficios visibles | Personalizar y reconocer | `stay.guest.recognized` |
| **Loyal** | Relación sostenida / miembro activo del club | Mantener el vínculo en el tiempo | `stay.guest.loyal` |
| **Returning** | Reserva **directa** (recompra sin OTA) | Convertir la relación en ingreso directo | `stay.directbooking.confirmed` |
| **Advocate** | Recomienda: reseña / refiere | Convertir la satisfacción en crecimiento | `stay.guest.advocated` |

> Nota: el Lifecycle mide **profundidad de relación**, no el tiempo de una estadía. Una sola
> estadía puede avanzar varios estados; Loyal/Returning/Advocate se consolidan en el post-stay
> y a través de futuras estadías. Advocate puede ocurrir antes que Returning.

---

## Parte B — Hotel Journey: implementación Palacio Paz

Cómo Palacio Paz (+ Trufa) **activa** los estados del Lifecycle con sus momentos operativos.
Entry Points = **candidatos a validar** en el piloto (no fijados).

| Momento operativo | Estado que activa | Entry Point candidato (a validar) | Datos | Evento |
|---|---|---|---|---|
| Pre-stay (pre-arrival) | Anonymous → camino a Identified | WhatsApp / Email | contacto, origen OTA, fechas | `stay.guest.appeared` |
| **Check-in** | **Identified** | QR recepción / NFC / WiFi | identidad, **opt-in** | `stay.guest.identified` |
| Habitación | **Engaged** | NFC/QR habitación | servicios usados | `stay.guest.engaged` |
| Desayuno | **Known** | QR mesa | preferencias gastronómicas | `stay.guest.known` |
| Trufa | **Recognized** | QR mesa / Wallet | consumo, beneficios usados | `stay.guest.recognized` |
| Room service / Spa | Engaged/Recognized (refuerzo) | NFC/QR / WhatsApp | pedidos, reservas | `stay.guest.engaged` |
| Post-stay (club activo) | **Loyal** | WhatsApp / Email / Wallet | engagement sostenido | `stay.guest.loyal` |
| **Reserva directa** | **Returning** | WhatsApp / Email / Wallet | recompra, **atribución** | `stay.directbooking.confirmed` |
| Review / referido | **Advocate** | WhatsApp / QR | reseña, referido | `stay.guest.advocated` |

> Otro hotel implementará los mismos estados con momentos distintos. El modelo no cambia.

---

## Parte C — Lo que nace del Lifecycle (puntero a 05/06, no se diseña acá)

**KPIs (derivan de las transiciones):**
- **Guest Capture Rate** = Anonymous → Identified.
- **Direct Guest Relationship Rate** (North Star Producto) = % que llega a relación directa (Identified+).
- **Direct Booking Conversion** = → Returning. **OTA Revenue Recaptured** (Business Outcome) = valor de los Returning.
- **Advocacy Rate** = → Advocate.

**Engines que nacen del Lifecycle:**
- **Guest Identity Engine** *(nuevo, sobre Guest Profiles de Tips+)* — Anonymous→Identified→Known.
- **Experience / Moment Engine** *(nuevo)* — Engaged/Recognized (registra interacciones como eventos).
- **Entry Point Engine** *(nuevo)* — abstrae los mecanismos de captura (a validar).
- **Direct Booking / Recapture Engine** *(nuevo)* — Returning + atribución (alimenta North Star/Outcome).
- **Loyalty / Club Engine** — Recognized→Loyal (reutiliza Wallet/Rewards de Tips+).
- **Reutilizables (Tips+):** Campaign · Notification · Review (→Advocate) · CRM/Guest Profile · Analytics/Event Tracking.

**Core Entities (para `06`):** Guest · Stay (estadía) · **RelationshipState** · Moment/Interaction ·
Property (hotel/org) · Reward · Booking (directa) · Event.

---

## Para pasar a Frozen (faltante)
- [ ] OK del Founder al Lifecycle universal (estados + orden) y al mapeo de Palacio Paz.
- [ ] Entry Points quedan como candidatos a validar en el piloto (no se fijan).
- [ ] Aprobación → **Frozen v1.0** → habilita `05 Product Engines`.
