# Stay — 06 Core Entities

| | |
|---|---|
| **Producto** | Stay |
| **Documento** | 06 Core Entities |
| **Versión** | **v1.1** |
| **Estado** | **FROZEN** |
| **Owner** | RUN72 |
| **Última actualización** | 2026-07-03 |
| **Modificaciones** | v1.1 (Founder-approved, Phase 6 Domain Modeling de Stay): `RelationshipState` evoluciona a **aggregate `Relationship`** (root, estado dual profundidad×status); se incorpora **`EntryPoint`** como entidad core; historia append-only explícita. Fuente: `Stai/docs/domain/PHASE_6_DOMAIN_MODEL.md` (FROZEN) + `FOUNDER_DECISION_DOMAIN_FREEZE.md` |

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

## 🏠 Relationship *(propia — AGGREGATE ROOT y núcleo del modelo; candidata a compartida)*
> v1.1: evoluciona la entidad `RelationshipState` de v1.0 — mismo concepto, frontera de consistencia explícita.
- **Definición:** **el activo del sistema** — el vínculo evolutivo entre un Guest y una Organization. "Stay no administra huéspedes: administra la evolución de la relación" (principio congelado).
- **Estado dual:** `RelationshipState` (profundidad, VO: Anonymous…Advocate — **solo avanza**) × `RelationshipStatus` (condición operativa: Active · Dormant · Closed). Combinables (ej. Loyal+Dormant).
- **Composición:** Relationship (root) + `StateTransition[]` (historial **append-only**: nunca se reescribe; si algo cambia, se registra un hecho nuevo).
- **Atributos:** guest · organization · state · status · historial · scores · `version` (lock optimista).
- **Invariantes:** transiciones solo vía Lifecycle Engine con regla declarada · nace en Identified con opt-in (Anonymous = "no existe relación") · `consent.revoked` cambia Status, jamás borra historia.
- **Engine dueño:** Relationship Lifecycle Engine (reglas de Business Rules 07).
- **Eventos:** `stay.relationship.started` · todas las `stay.guest.{identified…advocated}` · `stay.relationship.status_changed`.

## 🏠 EntryPoint *(propia — AGGREGATE ROOT; incorporada en v1.1)*
- **Definición:** una **oportunidad configurada de iniciar una relación** — el punto físico o digital del primer contacto. No es un QR/NFC (esos son connectors).
- **Atributos (AD-B018):** id · organization · property · location · entry_point_type · channel · physical_context · campaign · created_by · status · metadata.
- **Invariantes:** **único aggregate autorizado a iniciar el dominio** — produce siempre y únicamente el **Guest Capture Event** (`stay.guest.captured`, evento fundacional AD-B017) · solo captura estando `active` · token público inescrutable.
- **Engine dueño:** Entry Point Engine.
- **Eventos:** `stay.entrypoint.{created,activated,deactivated}` · ⭐ `stay.guest.captured`.

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
