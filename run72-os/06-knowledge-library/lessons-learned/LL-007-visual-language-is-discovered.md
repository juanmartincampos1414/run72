# LL-007 — El lenguaje visual se descubre, no se inventa

| | |
|---|---|
| **Estado** | **Promovido a meta-principio** — Constitución **Artículo 8** ("No congelamos ideas. Congelamos patrones demostrados") |
| **Fecha** | 2026-07-05 |
| **Origen** | Founder, al revisar el Design Language v0.1 de STAI. LL-007 es la instancia *visual* del meta-principio. |

## La regla

> **El lenguaje visual se descubre igual que la arquitectura: construir → convivir → encontrar patrones → congelar. No antes.**

Corolario operativo: **no congelamos decisiones visuales hasta haberlas utilizado en varias superficies distintas.** Congelar un sidebar, un layout o un sistema de cards antes de haber construido varias pantallas es, visualmente, el mismo error que evitamos en arquitectura: fijar un contrato antes de tener uso real.

## Cómo se detecta un patrón (Regla del Tres, visual)

No alcanza con construir las pantallas — hay que **convivir** con ellas: usarlas, abrirlas varias veces, mostrárselas a otros. Cuando **la misma solución aparece 3–4 veces sin haber sido forzada**, ahí probablemente hay un patrón real — y recién ese patrón merece entrar al `Design Language v1`. Una solución que hay que *forzar* en cada pantalla no es un patrón: es una preferencia.

## Por qué

El lenguaje visual **se descubre, no se escribe** — igual que se descubrieron el Runtime, los Shared Components, [[LL-005]] (los conceptos emergen de los productos), Moment y el KPI verdadero. El orden es siempre:

```
Construir  →  convivir  →  encontrar patrones  →  congelar
```

Nunca al revés. Un Design Language escrito de una sola vez es una hipótesis disfrazada de sistema.

## Qué SÍ se congela temprano

La **relación** entre capas, no las decisiones puntuales:
- ✅ Congelable: `Experience Principle → regla visual` (ej. *tranquilidad sin pasividad* → aire · menos cajas · un foco · estados vivos).
- 🟡 Hipótesis hasta usarse en varias superficies: sidebar, navegación, layouts, cards, tamaños, espaciados.

## Consecuencia operativa

Un Design Language nace como **v0.x Experimental**. Se aplica a 3–4 superficies reales, se convive con ellas unos días, y **recién cuando un patrón aparece en varias** se promueve a **v1 Frozen**. Es la Regla del Tres (Artículo 4) y el Artículo 6, aplicados a lo visual — y coherente con [[LL-006]]: no damos por bueno lo que todavía no probamos.
