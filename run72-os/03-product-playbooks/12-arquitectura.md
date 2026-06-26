# 12 — Arquitectura Playbook

| | |
|---|---|
| **Producto** | Framework (aplica a todos) |
| **Documento** | Arquitectura Playbook |
| **Versión** | v0.1 |
| **Estado** | Draft |
| **Owner** | RUN72 |
| **Última actualización** | Junio 2026 |

> Etapa 12. **No se diseña un stack nuevo: se hereda el del ecosistema (AD-007).** Esta etapa
> documenta **cómo el producto se alinea y reutiliza** la arquitectura existente de RUN72.
> "**Heredar antes de decidir.**" Baseline: `04-shared-components/ecosystem-architecture.md`.

## 1. Objetivo
Documentar la alineación del producto con la arquitectura heredada. **No** re-elegir tecnología.

> Pregunta única: **"¿Cómo se apoya este producto en la arquitectura existente de RUN72?"**

## 2. Entradas
- `05`–`11` **FROZEN** + `ecosystem-architecture` (baseline heredado).

## 3. Las 5 preguntas
1. ¿Qué reutiliza **sin modificaciones**?
2. ¿Qué reutiliza **con extensiones**?
3. ¿Qué **componentes nuevos** incorpora al ecosistema?
4. ¿Qué tiene **potencial de Shared Component** (Regla del Tres)?
5. ¿Qué **decisiones quedan abiertas** para el build (se registran como ADs propias del build)?

> Cualquier **desvío** del stack heredado requiere una **AD** que lo justifique.

## 4. Cómo ejecutar
1. Partir del stack del ecosistema (no inventar) y justificar cualquier desvío con una AD.
2. Mapear cada engine/connector del MVP a su realización técnica.
3. Decidir cómo se **comparten físicamente** los Shared Components (monorepo / paquetes / servicios).
4. Doble pregunta (LL-002): ¿la arquitectura deja base reutilizable para el ecosistema?
5. Revisión Founder + Engineering.

## 5. Entregables
`12 Arquitectura`: decisiones de stack/infra + mapeo modelo→tecnología + ADs si hay desvíos.

## 6. Salidas
Habilita `13 Roadmap` (y el build real).

## 7. Errores Frecuentes
- Elegir tecnología por moda y no por reutilización/encaje.
- Sobre-ingeniería antes del PMF (broker complejo, microservicios prematuros).
- Romper el desacople Capability→Connector→Provider con dependencias directas a un proveedor.

## 8–10. DoR / DoD / Freeze
- DoR: 05–11 FROZEN.
- DoD: stack/infra definidos; modelo mapeado a tecnología; reutilización resuelta.
- Freeze: aprobado por Founder + Engineering · desvíos documentados como AD · encabezado + estado + versión.
