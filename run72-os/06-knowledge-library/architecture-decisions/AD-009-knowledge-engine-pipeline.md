# AD-009 — El pipeline del conocimiento: Fuente → Extractor → Twin → Capabilities

| | |
|---|---|
| **Estado** | **Principio del Framework** · pendiente incorporar al POS |
| **Fecha** | Julio 2026 |
| **Autor** | Founder |
| **Origen** | JC AI Agency (Brand Twin v2) — promovido por decisión del Founder, 2026-07-03 |
| **Ámbito** | Todo producto AI-Native de RUN72 |
| **Extiende** | AD-008 (Toda capability consume el Twin) |

## Principio

AD-008 estableció que el Twin es el activo y todo lo consume. Esta AD congela **cómo se
construye y se hace visible** ese activo — el pipeline completo:

> **Fuente → Extractor → Procedencia → Twin → Health → Capabilities**

Cada eslabón tiene un contrato:
- **Fuente**: cualquier lugar donde vive conocimiento de la entidad (web, documentos, redes,
  comportamiento). El usuario aporta fuentes, no llena formularios.
- **Extractor**: absorbe una fuente y separa **hechos** de **interpretaciones**. Todos los
  extractores comparten exactamente la misma experiencia (ver "Las 4 preguntas").
- **Procedencia**: todo lo aprendido guarda de dónde salió, con qué confianza y cuándo
  (`source`, `confidence`, `learned_at`). Lo aplicado al perfil queda marcado como detectado
  (✨) hasta que el usuario lo edita. No solo importa qué sabemos: **importa de dónde**.
- **Twin**: el conocimiento consolidado por capas. El formulario manual pasa a ser un mecanismo
  de **corrección**, al final de la experiencia — primero trabaja el sistema, no el usuario.
- **Health / Confidence**: dos indicadores que conviven — **Health** (qué porcentaje de la
  entidad conocemos) y **Confidence** (qué tan seguros estamos de lo que sabemos). No es lo
  mismo saber mucho con poca certeza que saber menos con evidencia sólida.
- **Capabilities**: consumen el Twin (AD-008) y — a futuro — dejan **recibo de consumo**.

## Las 4 preguntas (contrato de UX de todo extractor)

El cliente nunca compra extracción: **compra confianza**. Por eso la devolución de todo
extractor responde siempre:

1. **¿Qué aprendimos?** (hechos + interpretaciones)
2. **¿Qué tan seguros estamos?** (confidence)
3. **¿Qué cambió?** (Health antes → después, con delta por capa: "59 → 67 (+8) · Communication +5")
4. **¿Qué mejoró automáticamente en el producto?** ("gracias a esto, ahora: tu estilo fue
   regenerado, el contenido futuro usa esta información, X medirá mejor Y…")

La cuarta es la que cierra el círculo: no solo aprendimos — **demostramos para qué sirvió**.

## El Twin como motor de capacidades (dirección futura)

El Twin no es un repositorio: es el **motor**. La evolución natural es que cada ejecución de
una capability deje un recibo interno:

```
Capability: Executive
Consumió:   ✓ Identity ✓ Strategy ✓ Market ✓ Performance
Confidence: 82%
Twin version: v37
```

Eso habilita: explicar recomendaciones con evidencia, auditar qué conocimiento influyó en qué
salida, y detectar capabilities corriendo con Twin pobre (resultados genéricos).

## Justificación / Impacto

- La timeline de aprendizaje ("hoy aprendí… ayer aprendí…") hace visible lo invisible — la IA
  aprende — y responde *por qué volver mañana*: porque mañana el sistema sabe más que hoy.
- Cambia quién trabaja: de "completá este formulario" a "esto es lo que ya sabemos de vos".
- Reutilizable en cualquier producto RUN72 con una entidad central (marca, negocio, hotel).

## Relación

- **AD-008** — el consumo del Twin. Esta AD agrega la construcción y la visibilidad.
- En JC vive en: `marca/page.tsx` (página invertida, momento mágico, timeline),
  `api/brand/ingest/web|book` (extractores), `identity_sources` (procedencia ✨, migración 037),
  `src/lib/twin-health.ts` (Health) y `brand_twin` (confidence por ítem).
