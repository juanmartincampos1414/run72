# Moment Taxonomy v1

| | |
|---|---|
| **Estado** | **FROZEN v1** (Founder, 2026-07-05) — fuente de verdad del ecosistema (no solo Stay) |
| **Owner** | RUN72 (Shared Runtime / Shared Knowledge) |
| **Base** | AD-B003 (Event Bus) · AD-B006 (Timeline) · AD-B022 (Relationship First) · Domain Model de Stay §Moment |
| **Regla** | Los hoteles cambian. Los Moments permanecen. El dominio conoce **Moment**, jamás una acción de un vertical. |

---

## 1. ¿Qué es un Moment?

> **Un Moment es un hecho del negocio que describe una oportunidad de profundizar una Relationship.**

La interacción es una *consecuencia*; lo importante es la Relationship (AD-B022, Relationship
First). Un Moment describe **que apareció una oportunidad** — no qué se hace con ella (eso lo
deciden los engines río abajo).

Es un concepto **transversal del ecosistema**: cualquier producto RUN72 que registre
oportunidades de profundizar una relación produce Moments — hoy Stay (estadías), mañana Margin,
Tips o cualquier otro. El Moment no pertenece a una vertical.

---

## 2. Atributos mínimos

| Atributo | Qué es |
|---|---|
| `id` | Identidad única del Moment |
| `organization_id` | El tenant (AD-B005). Opcional `property_id` para el scoping físico |
| `subject` | A quién pertenece (típicamente un Guest/persona) — el otro lado de la Relationship |
| **`intent`** | La **intención del producto** (no del usuario): qué clase de oportunidad es, con namespace del vertical. Ej.: `hospitality.visit`, `hospitality.consume`, `hospitality.feedback`, `hospitality.checkout`, `hospitality.support`. **Es la dimensión que Lifecycle, Knowledge y Analytics más van a usar** — más que category |
| **`category`** | Clasificación **abstracta y estable** definida por el producto en su propia taxonomía |
| **`source`** | Cómo se originó: el connector (`qr`, `nfc`, `wifi`, `api`, `manual`, `import`, …). El mecanismo, nunca el dominio |
| **`confidence`** | Qué tan cierto es el hecho, 0.0–1.0 (observado vs declarado vs inferido) |
| `occurred_at` | Cuándo ocurrió en el mundo real |
| **`metadata`** | jsonb extensible: **acá** vive todo lo específico del producto/vertical (ej. `{ "item": "breakfast", "venue": "trufa" }`). El dominio nunca lo interpreta |

`intent` + `category` + `metadata` son la frontera: el modelo del Moment provee los *campos*; el
producto provee los *valores*. Igual que los extractores del Timeline (mecanismo compartido,
config del producto).

---

## 3. ¿Qué produce un Moment?

Un hecho en el Event Bus. Ese hecho alimenta el Runtime, que lo entrega a:
- **Lifecycle Engine** → puede avanzar la profundidad de la Relationship (R-L2/R-L3/R-L5…).
- **Knowledge Engine** → puede derivar preferencias, patrones, propensiones.
- **Analytics / Timeline** → memoria y métricas.

El Moment **publica**; los engines **reaccionan**. El Moment no llama a nadie.

---

## 4. Principio congelado — un Moment JAMÁS modifica estado

Un Moment **nunca** modifica estado. Nunca avanza una Relationship, nunca escribe una
transición, nunca toma una decisión. **Únicamente publica un hecho.**

Quienes modifican estado son los **Engines** (Lifecycle, Knowledge…), reaccionando al hecho a
través del Runtime. Esta separación es lo que mantiene el sistema predecible: el registro de lo
que pasó (Moment) está desacoplado de la interpretación de lo que significa (Engines).

---

## 5. Lo que un Moment NO es

Un Moment **no** es:
- una pantalla · un formulario;
- un QR · un NFC (esos son `source`);
- un evento técnico (es un hecho **del negocio**);
- una transición de estado;
- una decisión del sistema.

Es únicamente **un hecho del negocio**.

---

## 6. ¿Qué NUNCA debe conocer un Moment?

- El **vocabulario de un vertical**: breakfast, room service, spa, Trufa, checkout, mesa,
  habitación, gimnasio. Esos son *valores* de `intent`/`category`/`metadata` definidos por el
  producto, jamás tipos del modelo. **Cero enums de negocio en el dominio del Moment.**
- La **lógica de los engines** (§4).
- El **mecanismo de captura**: QR/NFC/WiFi son `source`, no ramas del modelo.

Si mañana un hotel elimina el desayuno o Margin agrega un tipo de interacción nuevo, **el modelo
del Moment no cambia** — cambia el conjunto de valores que el producto usa.

---

## 7. ¿Qué eventos puede generar?

| Evento | Cuándo |
|---|---|
| `{producto}.moment.logged` | Siempre que se registra un Moment. El hecho fundacional de la experiencia |
| `{producto}.preference.captured` | Si el Moment deriva una preferencia conocida (opcional) |

Downstream, otros componentes emiten sus propios eventos al reaccionar (ej. el Lifecycle Engine
emite `guest.engaged`), pero esos **no** son eventos del Moment: son de quien reacciona.

---

## 8. La regla de evolución (el pipeline de RUN72)

```
EntryPoint   produce ▶   Moment   produce ▶   Business Event
                                                    │ produce ▼
   Nuevo conocimiento   ◀ producen   Engines   ◀ produce   Runtime
```

Cada eslabón **produce** el siguiente y jamás rearaña hacia atrás. Un EntryPoint produce Moments;
un Moment produce un hecho; el Runtime lo entrega; los Engines reaccionan; nace conocimiento. Este
pipeline resume la arquitectura de RUN72: **publicar hechos, reaccionar a hechos — nunca ejecutar
imperativamente a través de las capas.**

---

> **Principio.** No modelamos lo que hace un hotel. Modelamos qué significa que apareció una
> **oportunidad de profundizar una Relationship**. Ese concepto sobrevive a Stay, a los hoteles
> y a cualquier vertical. Por eso el Moment es del ecosistema, no del producto.
