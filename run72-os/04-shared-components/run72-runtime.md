# RUN72 Runtime — la capa de ejecución del ecosistema

| | |
|---|---|
| **Estado** | Vivo — nace oficialmente 2026-07-05 (Founder Decision, consolidación post-Sprint 1 de Stay) |
| **Owner** | RUN72 (gobernado a nivel Framework) |
| **Base** | AD-B003 (Event Bus) · AD-B006 (Timeline) · AD-B027 (Outbox Worker = infra RUN72) |
| **Naturaleza** | Documento **arquitectónico**, no técnico. Explica una categoría del ecosistema. |

> Hasta hoy RUN72 tenía dos niveles: **Shared Packages** (código reutilizable) y **Shared
> Knowledge** (decisiones, patrones, catálogo). La consolidación del worker reveló un tercero.

```
RUN72
├── Shared Packages     (capacidades reutilizables — código que los productos consumen)
├── Shared Runtime      (la ejecución del ecosistema — NUEVO)
└── Shared Knowledge    (decisiones, patrones, capability catalog, lessons)
```

---

## 1. Qué es el RUN72 Runtime

La capa que **ejecuta** el ecosistema. No es una librería que un producto llama para obtener
un resultado (eso son los Shared Packages). Es el **motor que corre continuamente** procesando
los hechos que los productos publican, y materializando de ellos memoria, proyecciones e
inteligencia — para todos los productos, por igual.

El cambio de nivel es este: **los productos ya no ejecutan nada de esto**. Publican hechos
(eventos) y registran proyectores (config). El Runtime hace el resto.

---

## 2. Qué vive en el Runtime

| Componente | Rol | Estado |
|---|---|---|
| **Event Bus** | El log append-only de hechos + outbox (AD-B003) | `@run72/event-kit` ✅ |
| **Worker Runtime** | Drena el outbox; ejecuta los proyectores registrados (AD-B027) | `@run72/worker-runtime` ✅ |
| **Scheduler** | Dispara el worker (Vercel cron / GitHub Actions / cron nativo según plan) | ✅ (piloto) |
| **Observabilidad del Bus** | Estado del outbox (pending/processing/processed/failed/dead, lag) | `outboxStats` ✅ |
| **Timeline Projection** | Proyecta eventos a la memoria cronológica compartida (AD-B006) | `@run72/timeline` ✅ |
| **Lifecycle Workers** | Ejecutan transiciones de estado de dominio sobre el bus | Sprint 2 (Stay primero) |
| **Knowledge Projectors** | Alimentan el Knowledge Engine desde el bus (AD-B007) | Futuro |
| **Analytics Projectors** | Materializan métricas desde el bus | Futuro |

Ninguno pertenece a un producto ni a una vertical. Pertenecen a RUN72.

---

## 3. Qué NO pertenece al Runtime

- **La lógica de negocio.** El Runtime ejecuta reglas *declaradas por el producto*, no las decide. (El Lifecycle Worker corre; las reglas R-L1…L7 son datos del producto.)
- **Los proyectores específicos.** El *mecanismo* de proyección es del Runtime; *qué evento va a qué sujeto* lo aporta el producto (extractores). Ej.: Stay decide que `guest.captured` va al timeline del EntryPoint.
- **El dominio.** Aggregates, invariantes y decisiones viven en los productos (o en Shared Packages de dominio). El Runtime nunca escribe estado canónico de dominio — solo proyecciones (AD-OS-009: la IA/infra propone, el dominio se protege).
- **La UI.** Delivery es del producto.

---

## 4. Cómo interactúa un producto con el Runtime

Un contrato de dos verbos:

```
PRODUCTO                         RUNTIME
   │  emit(event)  ───────────▶  outbox (append-only)
   │                                 │  drain() ejecuta proyectores
   │  registra proyectores ────▶     ▼
   │  (extractores/handlers)     Timeline · Knowledge · Analytics · Lifecycle
```

1. **Publica hechos:** `emit()` dentro de la transacción de dominio (outbox). El hecho nunca se pierde.
2. **Registra proyectores:** aporta sus extractores/handlers al `drain()` del Worker Runtime (como Stay aporta `stayProjectors`).

El producto **no corre workers, no gestiona el scheduler, no toca el bus directamente**. Eso es del Runtime.

---

## 5. Principios del Runtime

1. **Un solo bus.** Todos los productos publican al mismo Event Bus. Una sola fuente de hechos.
2. **Mecanismo compartido, config del producto.** El Runtime provee el cómo; el producto provee el qué (idéntico al patrón del Timeline).
3. **Los hechos nunca se pierden.** Outbox append-only; los eventos esperan `pending` hasta ser procesados. Idempotencia + replay garantizan que reprocesar sea seguro.
4. **El Runtime nunca decide dominio.** Ejecuta reglas declaradas; jamás inventa estado canónico (AD-OS-009).
5. **Observable por defecto.** El estado del bus (lag, dead-letter) es siempre inspeccionable. `dead > 0` o lag alto son alertas de operación.
6. **Neutral al producto.** Agregar un producto nuevo no cambia el Runtime: registra sus proyectores y publica sus hechos.
7. **Simplicidad antes que escala** (AD-B003): Postgres + outbox + cron. Sin brokers hasta que la evidencia lo exija.

---

## 6. Por qué esto importa (el salto conceptual)

Cuando el worker de Stay dejó de ejecutarse a mano y se volvió infra compartida, quedó claro
que la **ejecución del ecosistema** es un activo en sí mismo — tan reutilizable como el código
o el conocimiento. El 2º, 3º y 4º producto de RUN72 **no vuelven a resolver worker, scheduler
ni proyecciones**: heredan un Runtime que ya funciona. Esa es, en ejecución, la tesis del
Compound Product System (AD-B008): cada producto hace más fácil construir el siguiente.
