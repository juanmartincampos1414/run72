# Stay — 06 Core Entities

| | |
|---|---|
| **Producto** | Stay |
| **Documento** | 06 Core Entities |
| **Versión** | v1.0 |
| **Estado** | **FROZEN** |
| **Owner** | RUN72 |
| **Última actualización** | Junio 2026 |
| **Modificaciones** | Ninguna (mejoras futuras → nueva versión, sin reabrir la etapa) |

> **Decisión registrada:** `RelationshipState` (profundidad de relación · capa conceptual del
> Lifecycle) y `Membership/Reward` (beneficios/club · capa comercial) se mantienen **separadas**
> a propósito — son conceptos distintos; fusionarlas mezclaría el modelo del Lifecycle con la
> capa de beneficios.

> El modelo de datos del dominio. **Sin lógica** (la lógica vive en `07 Business Rules`).
> 🌐 = compartida (reutilizable en el ecosistema RUN72) · 🏠 = propia de Stay (algunas son
> candidatas a compartidas vía Regla del Tres). Guía: *Core Entities Playbook*.

---

## Diagrama de relaciones (resumen)

```
Property 1───* Stay *───1 Guest
   │                         │
   │        RelationshipState (Guest × Property)
   │                         │
   *                         *
 Moment *──1 Stay      Booking *──1 Guest (atribuida a una Stay/relación)
 Reward/Membership (Guest × Property)        Event (referencia a cualquiera)
 Insight (deriva de Guest × Property)
```

---

## 🌐 Guest *(compartida — reutiliza Guest Profiles de Tips+)*
- **Definición:** la persona huésped, única a través de canales, momentos y estadías.
- **Atributos:** id · identidad (nombre, doc) · contactos (email, WhatsApp) · canales · preferencias · opt-in.
- **Relaciones:** 1—* Stay · *—* Property (vía RelationshipState) · 1—* Booking · 1—* Reward.
- **Engine dueño:** Guest Identity Engine.
- **Eventos:** `stay.guest.identified`, `stay.guest.known`.

## 🌐 Property *(compartida — reutiliza Organizations de Tips+)*
- **Definición:** el hotel/propiedad (tenant). Puede tener sub-unidades (ej. Trufa).
- **Atributos:** id · nombre · tipo · unidades/outlets · config (reglas, connectors) .
- **Relaciones:** 1—* Stay · 1—* Moment · 1—* Booking.
- **Engine dueño:** Auth/Organizations (Shared).

## 🏠 Stay (estadía) *(propia)*
- **Definición:** una estadía concreta de un Guest en una Property.
- **Atributos:** id · guest · property · fechas (in/out) · **origen (OTA / directo)** · canal de reserva · estado.
- **Relaciones:** 1 Guest · 1 Property · 1—* Moment.
- **Engine dueño:** — (contexto; la consumen varios engines).
- **Eventos:** `stay.guest.appeared` (alta de estadía).

## 🏠 RelationshipState *(propia — núcleo del modelo; candidata a compartida)*
- **Definición:** el **nivel de relación** de un Guest con una Property (Anonymous…Advocate) + historial de transiciones.
- **Atributos:** guest · property · estado actual · historial (estado, evento, timestamp) · scores.
- **Relaciones:** 1 Guest × 1 Property.
- **Engine dueño:** Relationship Lifecycle Engine (transiciones según Business Rules 07).
- **Eventos:** todas las `stay.guest.{identified…advocated}`.

## 🏠 Moment / Interaction *(propia — candidata a compartida)*
- **Definición:** una interacción registrada durante una estadía (la unidad event-driven).
- **Atributos:** id · guest · property · stay · momento operativo · connector (canal) · datos · timestamp.
- **Relaciones:** 1 Stay (· Guest · Property).
- **Engine dueño:** Experience / Moment Engine.
- **Eventos:** `stay.interaction.captured`, `stay.experience.logged`, `stay.guest.engaged/recognized`.

## 🏠 Booking (reserva directa) *(propia)*
- **Definición:** una reserva, con foco en la **directa** y su **atribución** a la relación.
- **Atributos:** id · guest · property · origen (OTA/directo) · valor · **comisión evitada** · atribución (a qué relación/stay) · estado.
- **Relaciones:** 1 Guest · 1 Property · atribuida a una Stay/relación.
- **Engine dueño:** Direct Relationship Engine.
- **Eventos:** `stay.directbooking.confirmed`.

## 🌐 Reward / Membership *(compartida — reutiliza Wallet/Rewards de Tips+)*
- **Definición:** beneficios y membresía de club del Guest en una Property.
- **Atributos:** guest · property · membresía/nivel · rewards · redenciones.
- **Relaciones:** 1 Guest × 1 Property.
- **Engine dueño:** Loyalty / Club Engine.
- **Eventos:** `stay.reward.redeemed`, `stay.guest.loyal`.

## 🌐 Event *(compartida — backbone event-driven)*
- **Definición:** el registro inmutable de algo que pasó (la columna vertebral del sistema).
- **Atributos:** id · tipo (`stay.*`) · actor (guest/property) · payload · timestamp · origen (connector/engine).
- **Relaciones:** referencia a cualquier entidad.
- **Engine dueño:** Analytics / Event Tracking (Shared).

## 🏠 Insight *(propia — derivada, AI-Native)*
- **Definición:** conocimiento producido por el Relationship Intelligence Engine (segmentos, patrones, propensiones).
- **Atributos:** guest/segmento · property · tipo · valor/score · vigencia · fuente.
- **Relaciones:** deriva de Guest × Property (y su historial).
- **Engine dueño:** Relationship Intelligence Engine.
- **Eventos:** `stay.insight.generated`.

---

## Reutilización (resumen)
- **Compartidas del ecosistema (no se reconstruyen):** Guest, Property/Organization, Reward/Wallet, Event.
- **Propias de Stay:** Stay, RelationshipState, Moment, Booking, Insight.
- **Candidatas a compartidas (Regla del Tres):** RelationshipState y Moment — si otro producto
  necesita modelar relación/interacciones, se promueven a `04 Shared Components`.

## Freeze Checklist
- [x] Entidades + relaciones definidas, sin lógica.
- [x] Compartidas vs propias marcadas; reutilización de Tips+ explícita.
- [x] RelationshipState y Membership/Reward separadas (decisión registrada).
- [x] RelationshipState y Moment marcadas candidatas a compartidas (Regla del Tres).
- [x] **Aprobado por el Founder → FROZEN v1.0.** Habilita `07 Business Rules`.
