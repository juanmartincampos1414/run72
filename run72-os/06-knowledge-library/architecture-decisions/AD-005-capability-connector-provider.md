# AD-005 — Capability → Connector → Provider (arquitectura de integración de RUN72)

| | |
|---|---|
| **Estado** | Aceptada · **candidata a principio del POS** |
| **Fecha** | Junio 2026 |
| **Autor** | Founder |
| **Ámbito** | **Todo RUN72** (Margin, Tips+, Stay y futuros) |

## Principio

> **Los productos de RUN72 nunca dependen de proveedores. Dependen de capacidades del negocio.
> Los Connectors implementan esas capacidades y los Providers son simplemente una implementación
> concreta de cada Connector.**

## Decisión

Toda integración se modela en **tres capas**:

1. **Capability** — una capacidad del negocio (ej. *Property Management*, *Guest Messaging*,
   *Payments*). Es de lo que **depende el producto**.
2. **Connector** — el **contrato/interfaz** que implementa esa capability (ej. *PMS*, *Messaging*,
   *Payments*). Independiente del proveedor.
3. **Provider** — una **implementación concreta** del Connector (ej. Cloudbeds, Mews, WhatsApp
   Business API, Stripe). **Intercambiable**.

El producto consume **Capabilities**, no Providers.

## Mapa por producto (mismo modelo)

**Stay (Hospitality):** Property Management · Reservations · Guest Messaging · Reviews · Payments · AI Intelligence.
**Margin:** Accounting · Procurement · Supplier Data · Invoice OCR · BI/Reporting.
**Tips+:** Payments · Reviews · Messaging · Wallet · CRM.

Ejemplos de Providers por Connector (Stay):
- PMS → Cloudbeds, Mews, Opera, Oracle Hospitality…
- Booking Engine / CRS → SiteMinder, Mirai, SynXis, Bookassist…
- Messaging → WhatsApp Business API (Meta), SMS, Email…
- Reputation → Google Reviews, TripAdvisor, Booking Reviews…
- Payments → Stripe, Mercado Pago, Adyen…

## Justificación

- **Desacopla por completo** el modelo de negocio, la arquitectura del producto y la implementación técnica.
- Si aparece un nuevo PMS/mensajería/pago, **el producto no cambia**: solo se agrega un Provider
  que implementa el contrato existente.
- Convierte la estrategia de integraciones de Stay en una **arquitectura de integración
  reutilizable para todo RUN72**.

## Impacto / Relación

- Extiende AD-003 (capa de Connectors): formaliza la terna Capability/Connector/Provider.
- El **catálogo de Capabilities + contratos de Connector** vive en `04 Shared Components` (reutilizable).
- **Candidata a principio del POS**: aplica a Margin, Tips+ y Stay (3 productos) — cumple, en
  espíritu, la Regla del Tres; promover al POS cuando se valide con build real.

## Refinamientos del review CTO (ver AD-006)

- **Congelar el PRINCIPIO, no los CONTRATOS.** El principio ("depender de capacidades, no de
  proveedores") puede ser POS. Los **contratos de Connector concretos** quedan Draft→Certified
  hasta integrarse con **≥2–3 providers reales** — el contrato correcto emerge del 2º/3º, no del 1º.
- **Regla de granularidad:** las Capabilities se definen por **resultado de negocio** y se
  gobiernan en un **catálogo único** a nivel Framework (evita que cada producto las recorte distinto
  y se pierda la reutilización).
- **Falta una capa operativa** (auth, sync/idempotencia, normalización/anti-corruption, capability
  flags, observabilidad) → se formaliza en **AD-006 (Integration Runtime)**.
- **Build vs buy:** un "Provider" puede ser un **agregador** existente; no reconstruir un iPaaS.
