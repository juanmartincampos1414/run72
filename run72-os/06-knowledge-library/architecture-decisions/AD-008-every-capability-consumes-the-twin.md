# AD-008 — Toda capability consume el Twin

| | |
|---|---|
| **Estado** | **Principio del Framework** · pendiente incorporar al POS |
| **Fecha** | Julio 2026 |
| **Autor** | Founder |
| **Origen** | JC AI Agency (Brand Twin) — promovido por decisión explícita del Founder, 2026-07-03 |
| **Ámbito** | Todo producto AI-Native de RUN72 |

## Principio

> En un producto AI-Native, el activo central es el **Twin**: la representación viva de lo que el
> sistema sabe de la entidad que sirve (una marca en JC, y el equivalente que corresponda en
> Margin, Tips, Stay o futuros productos). **Toda capability del sistema debe consumir ese Twin.**
> No solamente las capabilities "de IA" — todas.

La pregunta operativa que se hace cada módulo antes de ejecutar cualquier cosa:

> **¿Qué sabe el sistema de esta entidad antes de hacer esto?**

Si la respuesta es "nada" y la capability corre igual con un template genérico, se está
construyendo una **feature**, no **inteligencia**.

## El checklist de dos preguntas

Toda capability nueva, antes de construirse, responde:

1. **¿Qué capa del Twin utiliza?** (consumo)
2. **¿Qué capa del Twin mejora?** (acumulación)

Si alguna de las dos no tiene respuesta, hay que dudar de su prioridad: probablemente agrega un
módulo pero no hace más inteligente al sistema. Es la versión Twin de LL-002 (la doble pregunta
producto + ecosistema): acá la doble pregunta es **consumir + acumular conocimiento**.

## Cómo se ve en la práctica (evidencia en JC AI Agency)

- **Reporting** no nace de un template genérico: nace de los colores, logo, tono y estilo que el
  sistema ya conoce de la marca.
- **Influencers** no busca perfiles grandes: busca perfiles **compatibles con esta marca** — y si
  el Twin no alcanza para medir compatibilidad, lo dice en vez de inventar un score (honestidad
  de métricas).
- **Ads** no muestra solo métricas: detecta **contradicciones** entre identidad, anuncios,
  contenido y audiencia.
- **Executive** acompaña toda recomendación importante con **qué evidencia usó, qué parte del
  Twin consultó y con qué confianza** llegó a la conclusión. Eso es lo que genera confianza.

## Twin Health

Consecuencia directa del principio: si todo consume el Twin, la métrica operativa más importante
de una cuenta no es su actividad sino **cuánto conoce realmente el sistema a esa entidad**.

**Twin Health** es ese indicador (en el backend de administración del producto): no mide la
cuenta, mide el conocimiento. Una cuenta muy activa con un Twin pobre produce resultados
genéricos; el sistema debe poder verlo y accionar sobre eso (pedir más contexto, sugerir la
ingesta, señalar capas vacías).

## Justificación / Impacto

- Convierte "construir activos, no funcionalidades" en un **contrato verificable por capability**.
- Explica el diferencial de un producto AI-Native: no es tener más módulos, es que **cuanto más
  trabaja la entidad dentro del sistema, mejor la conoce** — irreemplazable sin lock-in.
- Reutilizable tal cual en cualquier producto del ecosistema que tenga una entidad central a
  conocer (marca, negocio, hotel, cliente).

## Relación con el resto del framework

- **AD-007 (Heredar antes de decidir)** — el stack se hereda; **este principio gobierna qué se
  construye sobre ese stack**.
- **LL-002 (La doble pregunta)** — misma mecánica de evaluación por dos preguntas, aplicada al
  conocimiento.
- En JC AI Agency vive como **Reglas 28, 29 y 30** de `docs/02-product-operating-system/build-rules.md`
  y el modelo congelado `docs/07-knowledge-architecture/brand-twin-model.md`.
