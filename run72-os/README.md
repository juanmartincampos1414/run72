# RUN72 — Base de Conocimiento

> Fuente de verdad en **Markdown** (Cap. 02 del POS). GitHub es la memoria.
> Un solo lugar por documento. Nunca duplicar. Nunca sobrescribir la historia.

Esta carpeta organiza el sistema de RUN72 en 6 capas. El **Framework está en el
centro**: las herramientas cambian, el Framework permanece.

```
RUN72
├── 01 Product Constitution      → reglas fundamentales de la compañía
├── 02 Product Operating System  → cómo pensamos, documentamos y construimos (POS, FROZEN)
├── 03 Product Playbooks         → CÓMO ejecutar cada etapa del Stage Gate
├── 04 Shared Components         → capacidades reutilizables (Auth, Notifications, Wallet, NFC…)
├── 05 Products                  → un producto por carpeta (Stay, Margin, Tips+…) con estructura 00–19
└── 06 Knowledge Library         → Patterns · Lessons Learned · Architecture Decisions · Prompt Library · Founder Notes
```

## Cómo se construye un producto (Stage Gate de 13 etapas)

Orden inalterable. Cada etapa debe estar **FROZEN** antes de empezar la siguiente.

`01 Product Discovery → 02 Brand System → 03 Product Formula → 04 Journey Map →
05 Product Engines → 06 Core Entities → 07 Business Rules → 08 API & Ecosystem →
09 MVP Scope → 10 Build Specs → 11 Sprint Planning → 12 Arquitectura → 13 Roadmap`

## Capa actual en construcción: Product Playbooks

Cada Playbook explica **cómo ejecutar** una etapa (la plantilla, las preguntas,
los entregables, los chequeos de Freeze). Empezamos por el primero:

- [`03-product-playbooks/01-product-discovery.md`](03-product-playbooks/01-product-discovery.md) — **el que usamos para arrancar Stay.**

## Principios del Framework (ADs promovidas)

- **Capability → Connector → Provider (AD-005).** Los productos dependen de **capacidades del
  negocio**, nunca de proveedores. → [Capability Catalog](04-shared-components/capability-catalog.md)
  (fuente de verdad) · capa operativa: [Integration Runtime (AD-006)](06-knowledge-library/architecture-decisions/AD-006-integration-runtime.md).
- **Heredar antes de decidir (AD-007).** La arquitectura vive en RUN72; los productos la heredan
  (no re-deciden el stack). Baseline: [ecosystem-architecture](04-shared-components/ecosystem-architecture.md).
- Otras decisiones vivas: AD-002 (Relationship Lifecycle), AD-003 (Engines/Rules/Connectors/Shared),
  AD-004 (proponer, no imponer), AD-006 (Integration Runtime). Ver `06-knowledge-library/architecture-decisions/`.

## Reglas de oro

- **Markdown es la fuente de verdad.** PDFs/presentaciones son versiones congeladas para comunicar, no para trabajar.
- **Reutilizar antes de construir.** ¿Ya existe en RUN72? → se reutiliza.
- **Nunca trabajamos sobre conversaciones**, sino sobre documentación.
- **La Regla del Tres:** una mejora entra al Framework solo tras usarse con éxito en 3 productos.
