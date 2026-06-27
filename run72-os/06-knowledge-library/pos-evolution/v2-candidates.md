# POS — Candidatos para una versión futura (v2)

| | |
|---|---|
| **Tipo** | Backlog de evolución del Framework |
| **Estado** | Vivo — acumula entre productos |
| **Gobierna** | **Regla del Tres**: nada entra al POS hasta validarse en 3 productos |

> **No es una changelist. Es una sala de espera.** Cada ítem viene de una retrospectiva real y lleva
> un contador de evidencia. El POS (Cap. 02) sigue FROZEN hasta que un candidato junte sus 3 usos.
> Esto evita el error que el propio POS nos enseñó: cambiar el sistema por evidencia de N=1.

Leyenda de evidencia: `[1/3]` = validado en 1 de 3 productos requeridos.

---

## A. Mejoras de estructura / nombres de etapa

| Candidato | Cambio propuesto | Evidencia | Origen |
|---|---|---|---|
| **Renombrar etapa 08** | `API & Ecosystem` → **Ecosystem Strategy** (no define APIs; define cómo consumir capacidades) | `[1/3]` Stay | Retro #01 |
| **Renombrar etapa 12** | `Arquitectura` → **Architecture Alignment** (no diseña stack; documenta cómo se hereda) | `[1/3]` Stay | Retro #01 |
| **Roadmap evidence-gated** | Etapa 13 explícitamente por evidencia, no por fechas | `[1/3]` Stay | Retro #01 |
| **Modelo producto + ecosistema explícito** | Playbooks y Stage Gates reflejan los dos ejes en cada etapa, no solo en 13 | `[1/3]` Stay | Retro #01 |

## B. Componentes que deberían ser permanentes en RUN72

| Candidato | Propuesta | Evidencia | Origen |
|---|---|---|---|
| **Capability Catalog** | Parte permanente de Shared Components (no artefacto de Stay) | `[1/3]` Stay | Retro #01 |
| **Integration Runtime** | Parte de la arquitectura compartida heredable | `[1/3]` Stay | Retro #01 |

## C. Principios candidatos (aún no promovidos)

> Distinto de los principios **ya promovidos** (AD-005, AD-007): esos cruzaron el umbral durante el
> propio recorrido de Stay. Los de acá esperan.

| Principio candidato | Evidencia | Origen |
|---|---|---|
| **Congelar el principio, no los contratos** (AD-006) | `[1/3]` Stay | Retro #01 |
| **Los productos consumen capacidades, no proveedores** (refuerzo de AD-005) | `[1/3]` Stay | ya ~promovido, confirmar en 2º producto |
| **Cada Sprint entrega software *y* aprendizaje** | `[1/3]` Stay | Retro #01 |
| **Cada producto debe fortalecer el ecosistema** (LL-002) | `[1/3]` Stay | Retro #01 |
| **El producto valida el mercado; la retro valida el sistema que construye productos** | `[1/3]` Stay | Retro #01 |
| **El POS reduce incertidumbre antes de escribir código** (LL-004) | `[0/3]` — hipótesis, ni siquiera confirmada en Stay aún | Retro #01 |

---

## Regla de promoción
Un candidato entra al POS (Cap. 02) cuando: (1) llega a `[3/3]`, **y** (2) el Founder aprueba la
nueva versión del documento Frozen correspondiente, **y** (3) queda registro de qué 3 productos lo
validaron. Mientras tanto, vive acá.
