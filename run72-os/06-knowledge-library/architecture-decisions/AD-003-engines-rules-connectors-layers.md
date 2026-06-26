# AD-003 — Arquitectura en capas: Engines · Business Rules · Connectors · Shared Components

| | |
|---|---|
| **Estado** | Aceptada |
| **Fecha** | Junio 2026 |
| **Autor** | Founder |
| **Producto** | Stay (candidato a patrón de Framework) |

## Contexto / Pregunta

Al diseñar los Product Engines de Stay surgió la necesidad de separar responsabilidades con
claridad para que el sistema sea simple, determinista, reutilizable y extensible.

## Decisión

Cuatro capas con responsabilidades separadas:

1. **Engines — *ejecutan comportamiento*.** Son deterministas y reutilizables. **Nunca**
   contienen lógica de decisión. Ej: el *Relationship Lifecycle Engine* ejecuta una transición
   de estado y emite el evento, pero **no decide** cuándo ocurre.
2. **Business Rules (etapa 07) — *deciden*.** Gobiernan las transiciones del Lifecycle y toda
   condición de negocio. Los Engines consultan/obedecen las reglas; las reglas no ejecutan.
3. **Connectors / Plugins — *conectan*.** Mecanismos de entrada/salida (QR, NFC, WiFi, WhatsApp,
   Wallet, PMS, POS, Booking Engine…). No son Engines ni tienen lógica de negocio: traducen el
   mundo externo a eventos normalizados que alimentan a los Engines (p. ej. al Guest Identity).
   Alineado con el **Plugin System** de RUN72.
4. **Shared Components — *se reutilizan*.** Capacidades ya construidas del ecosistema (Tips+).

## Justificación

- **Engines simples y testeables** (sin `if` de negocio escondidos).
- **Reglas versionables** sin tocar los Engines.
- **Connectors intercambiables** → el producto no depende de una tecnología de captura (ver AD-002).
- **Reutilización** maximizada.

## Impacto

- `05 Product Engines` separa Engines de Connectors; los Entry Points dejan de ser un Engine.
- `07 Business Rules` será dueña de la lógica de transición del Lifecycle.
- Se incorpora un **Relationship Intelligence Engine** (aprende de la relación; alimenta
  campañas, recomendaciones, IA, personalización).
- El *Recapture Engine* se renombra **Direct Relationship Engine** (responsabilidad más amplia
  que la reserva directa).
- **Candidato a patrón de Framework** (Regla del Tres) para todos los productos RUN72.
