# LL-001 — De producto a plataforma: la arquitectura compartida es el activo

| | |
|---|---|
| **Fecha** | Junio 2026 |
| **Origen** | Stay — etapa 05 Product Engines |
| **Autor** | Founder + Product Intelligence |

## Observación

Al diseñar los Product Engines de Stay y separar **Connectors · Engines · Business Rules ·
Shared Components** (AD-003) sobre un **Relationship Lifecycle universal** (AD-002), la
arquitectura dejó de pertenecer a Stay. Se volvió **independiente del producto que la originó**.

En ese momento la conversación cambió: dejamos de diseñar **un producto** y empezamos a diseñar
**una plataforma**.

## Por qué importa

El mayor activo que se está construyendo **no es Stay**: es el **modelo de arquitectura
compartida de RUN72**. Esa arquitectura (capas + Lifecycle + Plugin System) probablemente sea
reutilizada por el 4º, 5º y 6º producto. Es, exactamente, la tesis original de RUN72
materializándose por primera vez.

## Consecuencia / Acción

- AD-002 (Relationship Lifecycle) y AD-003 (capas Engines/Rules/Connectors/Shared) quedan como
  **candidatos a patrón de Framework** (Regla del Tres: promover tras usarse con éxito en 3 productos).
- Cuando un Engine/patrón demuestre reutilizarse, **promoverlo a `04 Shared Components`** y, si
  corresponde, al POS.
- Señal a vigilar en próximos productos: ¿cuánto del stack de Stay se reutiliza sin reconstruir?
  Ese ratio es la métrica real de la tesis RUN72.
