# AD-002 — Stay se organiza alrededor de un Relationship Lifecycle universal

| | |
|---|---|
| **Estado** | Aceptada |
| **Fecha** | Junio 2026 |
| **Autor** | Founder |
| **Producto** | Stay (con potencial de patrón de Framework) |

## Contexto / Pregunta

El Journey Map inicial describía el flujo operativo de un hotel específico (Palacio Paz).
¿Cómo evitamos que Stay dependa del flujo de un hotel y pase a tener un modelo universal
aplicable a cualquier propiedad?

## Decisión

Stay se organiza alrededor de un **Relationship Lifecycle universal del huésped** y se separan
**dos niveles**:

1. **Relationship Lifecycle** — modelo universal del producto (estados de la relación
   hotel–huésped): **Anonymous → Identified → Engaged → Known → Recognized → Loyal →
   Returning → Advocate**.
2. **Hotel Journey** — implementación específica de cada propiedad: cada hotel activa esos
   estados con sus propios momentos operativos (en Palacio Paz: Check-in → Identified,
   Habitación → Engaged, etc.).

Los **Entry Points** (QR, NFC, WiFi, WhatsApp, Wallet…) quedan como **mecanismos de
implementación a validar en el piloto**, no se fijan en el modelo.

## Justificación

- **De los estados del Lifecycle nacen** los Product Engines, las Core Entities, los KPIs y el CRM.
- Desacopla el producto del flujo de un hotel puntual → aplicable a cualquier propiedad.
- Da a Stay un **modelo conceptual propio** (más defendible que las funcionalidades).

## Impacto

- El Journey Map (etapa 04) se reorganiza en dos niveles (Lifecycle universal + Hotel Journey).
- Los **eventos** se reinterpretan como **transiciones de estado del Lifecycle**.
- Etapas 05 (Engines), 06 (Core Entities) y los KPIs derivan del Lifecycle.
- **Candidato a patrón de Framework** (Regla del Tres): si el modelo "Lifecycle universal +
  implementación por cliente" se repite en otros productos, se promueve al POS.
