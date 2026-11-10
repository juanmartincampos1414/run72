# 01 — RUN72 Product Constitution

| | |
|---|---|
| **Capa** | 01 — Constitución (reglas fundamentales de la compañía) |
| **Versión** | v0.1 |
| **Estado** | Draft |
| **Owner** | Founder |
| **Última actualización** | Junio 2026 |

> La capa más estable de RUN72. Las herramientas cambian, los productos van y vienen, el modelo de IA
> del día cambia. **La Constitución permanece.** Está por encima del POS: el POS dice *cómo* construimos;
> la Constitución dice *qué es no-negociable* sin importar cómo.

---

## Artículo 1 — Conocimiento independiente del modelo

> **La documentación debe ser suficientemente buena para que cualquier modelo de IA, desarrollador o
> nuevo integrante pueda incorporarse al proyecto leyendo únicamente el repositorio.**

El conocimiento de RUN72 **no vive en Claude, ni en ChatGPT, ni en Copilot, ni en ninguna conversación.**
Vive en el repositorio, en Markdown. Cualquier inteligencia —humana o artificial— debe poder volverse un
miembro productivo del equipo entendiendo la documentación, sin memoria previa ni contexto de chats
anteriores.

**Consecuencia operativa:** si una decisión, un concepto o un porqué importante solo existe en una
conversación, **todavía no existe para RUN72.** Hay que bajarlo al repo. La independencia tecnológica es
una ventaja competitiva, no un detalle.

## Artículo 2 — El repositorio es la única fuente de verdad

Markdown en el repo es canónico. PDFs, presentaciones y `.docx` son **versiones congeladas para
comunicar**, no para trabajar. **Nunca se trabaja sobre conversaciones, sino sobre documentación.** Un
solo lugar por documento. Nunca duplicar. Nunca sobrescribir la historia (GitHub es la memoria).

## Artículo 3 — Reutilizar antes de construir

¿Ya existe en RUN72? → se reutiliza. Cada producto debe **fortalecer el ecosistema**, no solo a sí mismo
(la doble pregunta: ¿es correcto para el producto? · ¿hace más fuerte al ecosistema?).

## Artículo 4 — El conocimiento se acumula con disciplina

Las decisiones se documentan **cuando aparecen, no después.** El Framework mejora por evidencia, no por
intuición: **la Regla del Tres** — una mejora entra al sistema solo tras usarse con éxito en 3 productos.

## Artículo 5 — Construir con disciplina, no con documentación

Construimos con el **Stage Gate del POS**. El compromiso constitucional es el **método**: cerrar
preguntas mientras cerrarlas todavía es barato, no producir documentación por sí misma. El producto
valida el mercado; la retrospectiva valida el sistema que construye productos.

> **Lo que NO es constitucional (todavía):** la afirmación *"el POS reduce la incertidumbre antes de
> escribir código"* es una **tesis**, no un principio. Necesita evidencia de 3 productos antes de
> promoverse (Artículo 4, Regla del Tres). Se rastrea en
> [LL-004](../06-knowledge-library/lessons-learned/LL-004-pos-reduces-uncertainty.md) · `[1/3]`.

## Artículo 6 — Los componentes compartidos los exige el producto, no la arquitectura

> **Todo nuevo Shared Component debe justificar explícitamente qué hipótesis del producto ayuda a
> validar. Si no ayuda a demostrar una hipótesis concreta del producto, espera.**

Una abstracción puede ser perfectamente correcta y aun así adelantarse a la necesidad real del
producto. El ecosistema **no crece por belleza arquitectónica; crece porque un producto lo obligó a
crecer.** No es que la abstracción esté mal — es que todavía no es su momento. Este artículo es la
forma *prescriptiva* del patrón que ya observamos de forma *descriptiva*: los conceptos del ecosistema
emergen de los productos ([LL-005](../06-knowledge-library/lessons-learned/LL-005-concepts-emerge-from-products.md)).

**Consecuencia operativa:** al proponer un Shared Component —o al promover una abstracción de un
producto al ecosistema— la propuesta **declara qué hipótesis del producto valida.** Sin esa
justificación no se construye: se registra como candidato y se observa (Architectural Watch + Regla del
Tres, Artículo 4). La evidencia del producto manda sobre la elegancia del modelo. La pregunta no es
*"¿es correcta esta abstracción?"* sino *"¿es este el momento de construirla?"*.

## Artículo 7 — Un sprint no se cierra hasta que un usuario real valida la hipótesis

> **Ningún sprint se considera cerrado hasta que la hipótesis que buscaba demostrar haya sido
> validada por un usuario real.**

No alcanza con CI en verde, tests pasando, arquitectura correcta ni el dashboard construido. Todo
eso demuestra que el software funciona — no que el producto **comunica su valor**. La evidencia final
siempre la produce un usuario, no el equipo. Que nosotros (o un modelo simulando ser el usuario)
digamos que se entiende **no cuenta**: el gate es una persona real frente al producto.

**Consecuencia operativa:** el "Done" de todo sprint incluye una validación con un usuario real de la
hipótesis del sprint. Se define de antemano qué se observa y qué cuenta como "sí". Hasta que esa
validación exista, el sprint está *construido*, no *cerrado*. Este artículo es la contracara de la
disciplina de altitud (Artículo 6): el Artículo 6 evita construir de más; el Artículo 7 evita dar por
demostrado lo que todavía no se demostró con un usuario.

## Artículo 8 — No congelamos ideas. Congelamos patrones demostrados.

> **No congelamos ideas. Congelamos patrones demostrados.**

Da igual la capa —arquitectura, dominio, diseño, métricas, experiencia—: el proceso es siempre el
mismo, nunca al revés:

```
Construir  →  Convivir  →  Encontrar patrones  →  Congelar
```

Es el meta-principio que unifica al resto. No se diseñaron el Runtime, Moment, Timeline, Guest ni el
KPI: **aparecieron** construyendo producto, después se reconoció el patrón, después se congelaron. El
lenguaje visual sigue la misma ley ([LL-007](../06-knowledge-library/lessons-learned/LL-007-visual-language-is-discovered.md)),
como los conceptos siguen [LL-005](../06-knowledge-library/lessons-learned/LL-005-concepts-emerge-from-products.md).
**Este artículo no reemplaza a los anteriores — los explica.** La Regla del Tres (Artículo 4) es su
**mecanismo** (cómo se descubren los patrones); los Artículos 6 y 7 son sus **aplicaciones** (no
construir de más, no cerrar sin usuario). **Una decisión que hay que forzar en cada superficie no es un
patrón — es una preferencia.** Solo cuando una misma solución aparece sola, varias veces, merece
congelarse. **No existen excepciones** — aplica a arquitectura, dominio, diseño, métricas, experiencia,
IA y productos.

---

> **Estado:** Artículos 1, 6, 7 y 8 son aporte del Founder (Junio–Julio 2026). Artículos 2–5 consolidan
> reglas ya vigentes y documentadas en el repo. Pendiente revisión del Founder para **FROZEN v1.0**.
