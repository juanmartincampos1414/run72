# AD-007 — Heredar antes de decidir

| | |
|---|---|
| **Estado** | **Principio del Framework** · pendiente incorporar al POS |
| **Fecha** | Junio 2026 |
| **Autor** | Founder |
| **Ámbito** | Todo RUN72 |

## Principio

> **Heredar antes de decidir.** La arquitectura vive en **RUN72**, no en cada producto. El
> ecosistema toma las decisiones estructurales (stack, infra, plataforma); cada producto las
> **hereda** y se enfoca en aportar valor sobre esa base.

Complementa a *"Reutilizar antes de construir"*:
- **Reutilizar antes de construir** → componentes.
- **Heredar antes de decidir** → decisiones estructurales / stack.

## Contexto

En la etapa 12 (Arquitectura) de Stay apareció el riesgo de "diseñar un stack" cuando RUN72 ya
tiene una arquitectura existente (Tips+, Margin, AI Gateway, web, infra compartida, GitHub). Si
cada producto vuelve a discutir Next.js, Supabase, Vercel o Anthropic, **el Product Operating
System falló**.

## Decisión

- Las decisiones de **stack e infraestructura** pertenecen a **RUN72** (ecosistema), no al producto.
  Baseline heredado: ver `04-shared-components/ecosystem-architecture.md`.
- La etapa **12 Arquitectura** de cada producto **no diseña un stack nuevo**: documenta **cómo el
  producto se alinea y reutiliza** la arquitectura existente, respondiendo 5 preguntas:
  1. ¿Qué reutiliza **sin modificaciones**?
  2. ¿Qué reutiliza **con extensiones**?
  3. ¿Qué **componentes nuevos** incorpora al ecosistema?
  4. ¿Qué tiene **potencial de Shared Component**?
  5. ¿Qué **decisiones quedan abiertas** para el build?
- Cualquier **desvío** del stack heredado requiere una **AD** que lo justifique.

## Justificación / Impacto

- Velocidad y consistencia: ningún producto re-litiga lo estructural.
- Foco: el producto invierte su energía en el **valor diferencial**, no en re-elegir tecnología.
- Hace operativa la tesis RUN72 (cada producto arranca con la base ya resuelta).
- Candidato a principio del POS.
