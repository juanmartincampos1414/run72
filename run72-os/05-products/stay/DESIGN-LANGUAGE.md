# STAI — Design Language v0.1 (Experimental)

| | |
|---|---|
| **Estado** | 🟡 **EXPERIMENTAL** (Founder, 2026-07-05) — el Design Language **no se escribe, se descubre**. Se congela recién tras usarlo en varias superficies. |
| **Deriva de** | [Experience Principles](./EXPERIENCE-PRINCIPLES.md) (**cómo se siente** — la manda) + `Stai Manual de Marca v1.0` (foundations) |
| **Regla** | Cada decisión visual es **consecuencia de una decisión de experiencia** (EP-1..7), no estética por sí misma. |
| **Secuencia** | Thesis → Journey → Channel Strategy → Product Principles → **Experience Principles** → **Design Language (v0.1)** → UI → Sprint 3 |

> **Qué está FROZEN y qué es HIPÓTESIS (metodología, Founder):**
> - ✅ **FROZEN — la relación `Experience Principle → regla visual`** (§ debajo). Ej.: EP-2 → aire, menos cajas, un foco, estados vivos. Eso no se toca.
> - 🟡 **HIPÓTESIS — las decisiones concretas:** sidebar, navegación, layouts, cards, tamaños, espaciados. **Son hipótesis, no principios.** Se prueban en pantallas reales; si emergen como patrón en varias superficies, recién ahí se congelan (→ `Design Language v1 Frozen`). No antes. (Ver [[LL-007]].)

> **Cada decisión de este sistema TRADUCE un Experience Principle en una regla visual** (no al revés):
> - **EP-1** no se siente software de gestión → sidebar de canal, tono anfitrión, jamás "dashboard".
> - **EP-2** tranquilidad **sin pasividad** → mucho aire, menos cajas, un solo foco · **y estados vivos + microseñales de actividad** (la relación está ocurriendo: "hace 2 min", tendencias, un pulso sutil — nunca estático).
> - **EP-3** evidente dónde actuar → un primario por vista, jerarquía tipográfica clara.
> - **EP-4** conocido, no vigilado → mostrar lo que el hotel *sabe* con calidez, sin exhibir "tracking".
> - **EP-5** la tecnología desaparece, aparece la relación → hablar de huéspedes/relaciones, no de "eventos"; verde solo en el momento de valor.
> - **EP-6** el hotel controla → toda acción de STAI es una propuesta que el hotel aprueba (AD-004), visible y reversible.
> - **EP-7** confianza operacional → **métricas honestas** (sin denominador → "—", nunca inventar) · **acciones explícitas** · **confirmaciones claras** · **errores tranquilos y accionables** · datos en JetBrains Mono (sólidos).

> **La personalidad manda.** El Manual dice: *"tecnología con calidez: precisa, nunca fría ni impersonal."* Un dashboard que se siente "técnico y frío" está **fuera de marca**. El sistema existe para que STAI se sienta **Anfitrión** (cálido), **Inteligente** (la señal, no el ruido) y **Directo** (el valor, claro).

---

## 1. Foundations (del Manual de Marca)

**Color** — un solo acento, reservado al momento de valor:
| Token | Hex | Uso |
|---|---|---|
| `midnight` | `#0C0F14` | Fondo base, superficies profundas |
| `signal` (verde señal) | `#4FE0A0` | **Acento único** — solo en el momento de valor/recurrencia (una acción, una métrica de recurrencia, un CTA). **Nunca** grandes áreas ni dos verdes compitiendo en pantalla |
| `mist` | `#E7ECF2` | Texto primario, reversos |
| `graphite` | `#12161D` | Cards (usar con moderación — ver §3) |
| `steel` | `#7B8593` | Texto secundario |
| `border` | `#1E242E` | Líneas y divisores |

**Tipografía** — hoy la app corre con fuentes del sistema; **eso es el mayor gap de marca**:
- **Space Grotesk** — títulos, interfaz, cuerpo (400/500/600/700).
- **JetBrains Mono** — **todo número/dato/métrica/etiqueta** (KPIs, tasas, IDs). Es lo que le da el aire "Inteligente".
- Escala: `Display 600 · Título 600 · Subtítulo 500 · Cuerpo 400`.

**Iconografía** — trazo 1.8px, círculos + rectas, esquinas vivas; verde **solo** en el punto de acción, nunca todo el trazo.

**Imagen** — nocturna, bajo contraste, hotelería boutique, gesto humano; el verde entra solo vía interfaz, nunca en la foto.

## 2. Los principios visuales (tus 3 quejas → reglas)

1. **Mucho más aire.** Escala de espaciado en múltiplos de 4: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64`. Entre secciones, mínimo `32`. El vacío es parte del diseño, no espacio "perdido".
2. **Menos cajas.** Una card **solo** para un objeto acotado real (una propuesta, un huésped). Para agrupar, usar **espacio + un divisor + jerarquía tipográfica**, no una caja anidada. Regla: si sacando el borde no se pierde información, **sacalo**.
3. **Jerarquía clara.** Un **único foco** por pantalla (el número/mensaje que importa, grande, en Space Grotesk). Todo lo demás cede. La tipografía crea la jerarquía; no los recuadros ni el color.

## 3. Sistema de componentes

- **Layout:** contenido con `max-width` cómodo (no full-bleed), respiración lateral. Ritmo vertical por la escala de espaciado.
- **Navegación → sidebar izquierdo (cambio clave).** Reemplaza los links de texto arriba. Es lo que hace *sentir plataforma* y no "pantallas sueltas". Secciones del producto en el sidebar; el estado activo con el verde señal (punto/borde, no relleno).
- **Header:** mínimo — contexto (property) + usuario. Sin cajas.
- **Botones (sistema consistente):**
  - **Primario** = la acción de valor: fondo `signal`, texto `midnight`. **Uno por vista** (es el momento de valor).
  - **Secundario** = quieto: borde `border`, texto `mist`, fondo transparente.
  - **Ghost** = terciario: solo texto `steel`.
  - Mismo alto, mismo radio, misma tipografía en todo el ecosistema.
- **KPIs / métricas:** número grande en **JetBrains Mono**, etiqueta en `steel` (Space Grotesk), sin caja pesada — el dato respira. El verde solo si esa métrica **es** el momento de valor.
- **Tablas / listas:** filas con divisor `border`, no cards por fila. Densas pero con aire vertical.
- **Estados vacíos:** cálidos y anfitriones — invitan, no informan una carencia. ("Cuando un huésped adopte el canal, su recorrido aparece acá", no "Sin datos").
- **Tono de voz:** cálido, directo, de anfitrión. Hablar de **relaciones y del huésped**, nunca de "registros" ni "eventos".

## 4. Cómo expresa la estrategia

- El **verde señal** = el momento de valor del **canal** (una acción del hotel, la recurrencia, un CTA). Coherente con *"la reserva directa es consecuencia"*: el verde marca la consecuencia, no domina la pantalla.
- **Valor antes de pedir info** (PP-4): las pantallas del huésped ofrecen antes de pedir; el estilo es cálido, nunca formulario.
- El dashboard cuenta **la historia del canal** (¿está creciendo la relación?), no un panel técnico de métricas sueltas.

---

> **v1 aplica a STAI.** Cuando 2–3 productos lo adopten, se promueve a **RUN72 Design Language** (Regla del Tres · [[LL-005]]). Próximo: aplicar este lenguaje a las pantallas de STAI (tipografía de marca + sidebar + menos cajas + más aire) — recién ahí se retoma Sprint 3.
