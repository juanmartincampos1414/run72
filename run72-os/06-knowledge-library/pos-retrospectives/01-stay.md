# POS Retrospective #01 — Stay

| | |
|---|---|
| **Tipo** | Retrospectiva del Framework (no del producto) |
| **Disparador** | Primer producto que completó el Stage Gate de punta a punta (Stay 01→13) |
| **Versión** | v0.1 |
| **Estado** | Draft |
| **Owner** | Founder + Product Intelligence |
| **Última actualización** | Junio 2026 |

> **Esto no es la etapa 14.** El Stage Gate terminó bien con `13 Roadmap`. Esto es un proceso
> *posterior* al Stage Gate: la primera vez que tenemos evidencia real para evaluar **el sistema**,
> no el producto. No reabre Stay. Aprende de Stay.

> **Regla del Tres (recordatorio que gobierna este documento).** Tenemos **N=1**. Nada de lo de acá
> modifica un documento FROZEN. Los outputs son **candidatos** que esperan validación con el 2º y 3er
> producto antes de entrar al POS. La retro no promueve: **propone**.

---

## 1. ¿Qué funcionó inesperadamente bien?

Separado en lo que **ya está validado por la práctica** vs. lo que **sigue siendo teoría** (se confirma en el build/pilot).

### Validado por la práctica (lo vivimos en estas 13 etapas)
- **Congelar antes de avanzar.** Forzó cerrar decisiones en vez de arrastrar ambigüedad. Cada etapa empezó con base firme, no con discusiones reabiertas.
- **Documentar la decisión cuando aparece, no después.** Las 7 ADs nacieron *en el momento* del debate. Si las hubiéramos pospuesto, el "por qué" se habría perdido.
- **Journey antes que pantallas / Engines antes que features.** Nos impidió diseñar UI sobre un modelo que todavía no entendíamos. El Relationship Lifecycle apareció *porque* no empezamos por pantallas.
- **Separar producto / ecosistema / arquitectura.** La doble pregunta (LL-002) cambió decisiones reales: Lifecycle universal, Connectors, Runtime — todas nacieron de "¿esto fortalece el ecosistema?".
- **Markdown como fuente de verdad.** Trabajar sobre documentos y no sobre conversaciones permitió que cada etapa heredara la anterior sin re-litigar.

### Todavía teoría (parece valioso, lo confirma el build)
- **Que el Stage Gate haya acelerado** (no solo ordenado). Se prueba si el Sprint 1 sale fluido.
- **Que los Playbooks aceleren el 2º producto.** Se prueba cuando otro producto los use.
- **Que el Capability Catalog evite re-trabajo de integración.** Se prueba al integrar un provider real.

---

## 2. ¿Qué cambiaríamos si empezáramos de nuevo?

No son errores. Son mejoras descubiertas **al usar el sistema**.

| Lo que era | En qué evolucionó | Por qué |
|---|---|---|
| Arquitectura (definir stack) | **Architecture Alignment** | Stay no necesitaba stack nuevo: hereda el de RUN72 (AD-007). |
| API & Ecosystem (definir APIs) | **Ecosystem Strategy** | No definíamos APIs sino cómo RUN72 consume capacidades del negocio (AD-005). |
| Roadmap por fechas | **Roadmap evidence-gated** | Las fases las habilita el aprendizaje validado, no el calendario. |
| Congelar contratos | **Congelar el principio, no los contratos** | Los contratos evolucionan con evidencia; lo estable es el principio (AD-006). |
| Engines y reglas mezclados | **Engines / Rules / Connectors / Shared separados** | Product Engines obligó a la separación (AD-003). |
| Journey operativo de Palacio Paz | **Relationship Lifecycle universal** + Hotel Journey como mapeo | El lifecycle es reutilizable; el journey de un hotel no (AD-002). |
| Build Specs ≈ Arquitectura | **Separados**: Specs = *qué* construir; Arquitectura = *cómo* se alinea | Dos preguntas distintas, dos etapas distintas. |

---

## 3. ¿Qué apareció en el camino y no existía al principio?

La parte más interesante: **conceptos que el proceso necesitó y por eso nacieron.** Ninguno estaba en el documento inicial del POS.

- **Capability Catalog** · **Integration Runtime** · **Capability → Connector → Provider**
- **Heredar antes de decidir** · **Congelar el principio, no los contratos**
- **Las dos preguntas** (¿correcto para el producto? · ¿fortalece el ecosistema?)
- **Relationship Lifecycle** · **RelationshipState** · **Relationship Intelligence Engine** · **Direct Relationship Engine**
- **Product Roadmap + Ecosystem Roadmap** (dos ejes) · **Knowledge Compounds** · **Evidence-gated Roadmap**
- **Sprints = hipótesis + capacidad + DONE + aprendizaje esperado**

> **Lectura:** el Framework **evolucionó mientras se usaba.** Esa es la evidencia más fuerte de que
> el POS es un sistema vivo, no un documento. Pero también el recordatorio de N=1: estos conceptos
> resolvieron *los problemas de Stay*. El 2º producto dirá cuáles son universales.

---

## 4. ¿Qué aprendimos sobre cómo construir productos?

**Hipótesis central (a confirmar en el Sprint 1, no conclusión todavía):**

> El objetivo del Product Operating System no es producir documentación.
> Es **reducir incertidumbre antes de escribir código.**

Durante Stay el POS nos impidió: empezar por pantallas · discutir APIs antes de entender el producto ·
mezclar reglas con engines · congelar contratos sin validarlos · decidir stack cuando se podía heredar ·
construir la integración PMS antes de demostrar valor · confundir relación directa con reserva directa ·
perder conocimiento en conversaciones.

**Por qué es hipótesis y no conclusión:** la prueba de que se redujo incertidumbre es que el build
salga *fluido porque los docs eliminaron la ambigüedad*. Esa evidencia llega después del Sprint 1.
La **retro técnica post-Sprint 1** confirma o mata esta hipótesis. Ahí cierra el círculo del POS.

---

# Outputs de esta retrospectiva

## A. Lecciones aprendidas → Knowledge Library
- Existentes que esta retro reafirma: LL-001 (producto→plataforma), LL-002 (la doble pregunta), LL-003 (primer ciclo completo).
- **Nueva: [LL-004](../lessons-learned/LL-004-pos-reduces-uncertainty.md) — El POS existe para reducir incertidumbre antes de escribir código** (registrada como hipótesis a confirmar en Sprint 1).

## B. Mejoras candidatas al Framework → `pos-evolution/v2-candidates.md`
No se aplican ahora. Esperan la Regla del Tres. Ver [backlog v2](../pos-evolution/v2-candidates.md).

## C. Principios candidatos al POS → `pos-evolution/v2-candidates.md`
Aparecieron en el proceso; se promueven solo tras validarse en 3 productos. Ver [backlog v2](../pos-evolution/v2-candidates.md).

---

## Cómo se relaciona con Stay
No reabre Stay. Las 13 etapas siguen FROZEN. La retro **aprende de ellas**, no las cambia.

## Después de esta retrospectiva
1. `00 Executive Summary` de Stay.
2. **Sprint 1 — Capture & Identity** (build real).
3. **Retro técnica post-Sprint 1** → confirma o mata la hipótesis LL-004.

## Freeze Checklist
- [ ] Confianza separada: validado-por-práctica vs. teoría.
- [ ] Outputs como **candidatos**, no promociones (Regla del Tres respetada).
- [ ] Hipótesis central marcada como tal (no conclusión).
- [ ] Aprobado por el Founder → FROZEN v1.0.
