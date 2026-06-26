# AD-001 — Separar Playbooks, Templates y Products

| | |
|---|---|
| **Estado** | Aceptada · implementación diferida |
| **Fecha** | Junio 2026 |
| **Autor** | Founder |
| **Ámbito** | RUN72 Product Operating System (estructura de la base de conocimiento) |

## Contexto / Pregunta

¿Cómo separamos la *metodología* (cómo ejecutar una etapa), las *plantillas*
(qué se copia dentro de un producto) y la *documentación específica* de cada
producto, para que no se mezclen y escalen bien a futuros productos?

## Decisión

Distinguir **tres niveles** dentro del Framework:

- **Playbooks** → explican *cómo ejecutar* cada etapa del Stage Gate.
- **Templates** → las plantillas en blanco que se copian dentro de cada producto.
- **Products** → la documentación específica de cada producto (Stay, Margin, Tips+…).

## Justificación

- Hoy el Playbook mezcla "cómo se hace" con "qué se entrega". Separar la plantilla
  reutilizable evita duplicación y mantiene una sola fuente de verdad por nivel.
- Facilita arrancar un producto nuevo: copiar Templates → completar en Products,
  con el Playbook como guía al lado.
- Escala mejor cuando haya 13 etapas × N productos.

## Impacto

- Futuro: agregar una capa `Templates` a la estructura (junto a Playbooks).
- Los Playbooks quedarían enfocados en metodología; el "Entregable" se movería a Template.

## Implementación

**Diferida.** Por ahora mantenemos la estructura actual (el Playbook incluye la
estructura del entregable). Se implementará cuando el patrón se valide con uso real
—coherente con la *Regla del Tres*. Esta AD deja la intención registrada.
