# START HERE — Onboarding de RUN72

> Si sos una **persona** o una **IA** que se incorpora a RUN72: leé este documento primero. En 5 minutos
> te explica qué es el ecosistema, cómo está organizado, cómo se trabaja y dónde vive la verdad. No
> necesitás memoria de conversaciones anteriores ni de ningún modelo en particular —
> **todo lo que hace falta está en este repositorio** (Constitución, [Artículo 1](01-product-constitution/README.md)).

---

## 1. Qué es RUN72 (en una frase)

RUN72 no es un producto: es **el sistema que produce productos AI-Native**. Margin, Tips+ y Stay son
productos. El verdadero activo es el **RUN72 Product Operating System (POS)** — y mejora con cada
producto que construye. Esa ventaja compuesta (un sistema que aprende) es lo difícil de copiar.

## El ciclo de RUN72 (el mapa en 1 minuto)

```
                        Constitution
                             │
                             ▼
               Product Operating System
                             │
      ┌──────────────────────┼──────────────────────┐
      ▼                      ▼                      ▼
 Stage Gates            Playbooks         Knowledge Library
      │                      │                      │
      └──────────────┬───────┴──────────────┬───────┘
                     ▼                      ▼
          Shared Components      Ecosystem Architecture
                     │
                     ▼
            Capability Catalog
                     │
                     ▼
                 Productos
       Margin · Tips+ · Stay · ...
                     │
                     ▼
            Nuevo conocimiento
                     │
                     ▼
         Evolución del Framework  ──┐
                     │              │ vuelve a alimentar
                     └──────────────┘ la Constitución y el POS
```

El sistema es un **ciclo, no una pila**: cada producto genera conocimiento, el conocimiento evoluciona
el Framework, y el Framework hace al próximo producto más fuerte. Ahí está la ventaja compuesta.

## 2. La jerarquía (de lo más estable a lo más cambiante)

```
01 Product Constitution      reglas no-negociables de la compañía   ── lo más estable
02 Product Operating System  el método de 13 etapas (Stage Gate)
03 Product Playbooks         CÓMO ejecutar cada etapa
04 Shared Components         capacidades reutilizables · Capability Catalog · Ecosystem Architecture
05 Products                  un producto por carpeta (Stay, Margin, Tips+…), estructura 00–13
06 Knowledge Library         ADs · Lessons Learned · Retrospectivas · evolución del POS
        ↓
Productos (Margin · Tips+ · Stay · …)                              ── lo más cambiante
```

Regla mental: **cuanto más arriba, menos cambia.** Las herramientas cambian; la Constitución permanece.

## 3. Qué leer primero (orden recomendado)

1. **[01 Constitución](01-product-constitution/README.md)** — las reglas que no se rompen.
2. **[README de la base de conocimiento](README.md)** — el mapa completo y el orden del Stage Gate.
3. **[02 POS](02-product-operating-system/README.md)** — el método (ver el gap conocido ahí).
4. Un producto real de punta a punta: **[Stay 01→13](05-products/stay/)** — el primero que recorrió todo el POS.
5. **[06 Knowledge Library](06-knowledge-library/)** — por qué se tomaron las decisiones (ADs) y qué se aprendió (LLs).

## 4. Cómo se construye un producto: el Stage Gate

13 etapas, **orden inalterable**. Cada una debe estar **FROZEN** antes de empezar la siguiente:

`01 Discovery → 02 Brand → 03 Formula → 04 Journey → 05 Engines → 06 Entities → 07 Rules →
08 Ecosystem → 09 MVP Scope → 10 Build Specs → 11 Sprint Planning → 12 Architecture Alignment → 13 Roadmap`

El **[03 Playbooks](03-product-playbooks/)** explica cómo ejecutar cada una.

## 5. Cómo leer el estado de un documento

**No hay una lista central de "qué está Frozen" — y es a propósito** (se desactualizaría). Cada documento
declara su propio estado en el header. Mirá ahí:

| Estado | Significado |
|---|---|
| **Draft** | En construcción. Se puede discutir y cambiar. |
| **Review** | Listo para revisión del Founder. |
| **Certified** | Validado, casi final. |
| **FROZEN** | Congelado. **No se reabre.** Las mejoras van a una **versión nueva**, no editan el original. |

Regla de oro: **un documento FROZEN no se toca.** Si aprendiste algo que lo mejora, eso es material para
una versión futura o para la [Knowledge Library](06-knowledge-library/), no una edición del Frozen.

## 6. Cómo se documentan las decisiones

- **Architecture Decisions (ADs)** → [`06/architecture-decisions/`](06-knowledge-library/architecture-decisions/).
  Se escriben **cuando aparece la decisión, no después**. Algunas se promueven a **principio del Framework**.
- **Lessons Learned (LLs)** → [`06/lessons-learned/`](06-knowledge-library/lessons-learned/).
- **Retrospectivas del POS** → [`06/pos-retrospectives/`](06-knowledge-library/pos-retrospectives/) (aprenden del sistema, no del producto).

## 7. Cómo evoluciona el Framework (la Regla del Tres)

El POS mejora **por evidencia, no por intuición**. Una mejora entra al Framework **solo tras usarse con
éxito en 3 productos**. Mientras tanto, espera en [`06/pos-evolution/v2-candidates.md`](06-knowledge-library/pos-evolution/v2-candidates.md).
Esto evita cambiar el sistema por evidencia de un solo caso.

## 8. Dónde vive la verdad

**El repositorio, en Markdown.** PDFs y `.docx` son fotos congeladas para comunicar, no para trabajar.
Si una decisión solo existe en un chat, **todavía no existe para RUN72** — hay que bajarla acá.

## 9. Cómo debería trabajar una IA o un nuevo integrante

1. Leé esta jerarquía y la Constitución antes de proponer nada.
2. **Reutilizá antes de construir**: revisá [Shared Components](04-shared-components/) y el
   [Capability Catalog](04-shared-components/capability-catalog.md) primero.
3. Toda propuesta responde **dos preguntas**: ¿es correcto para el producto? · ¿fortalece el ecosistema?
4. No trabajes sobre conversaciones; trabajá sobre documentos. Si falta un doc, primero se escribe.
5. No reabras Frozen. No inventes evidencia. Lo que no esté documentado, se documenta antes de usarse.

---

> **El objetivo de RUN72 no es ir rápido. Es aprender más rápido que otros.** Cada producto que cruza el
> Stage Gate deja al sistema más afilado para el siguiente. Bienvenido/a.
