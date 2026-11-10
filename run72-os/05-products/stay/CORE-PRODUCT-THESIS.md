# STAI — Core Product Thesis v2

| | |
|---|---|
| **Estado** | Tesis central del producto (Founder, 2026-07-05) — **cristaliza y eleva** la formula frozen, no la reemplaza |
| **Owner** | Founder |
| **Relación** | Afila `01-product-discovery` y `03-product-formula` · realiza AD-B022 (Relationship First) · marco de la tesis LTV/patrimonio relacional (FD) |
| **Nombre** | El producto es **STAI** (marca; los docs frozen aún dicen "Stay" — inconsistencia a alinear) |

> **No estamos construyendo una plataforma de incentivos. Estamos construyendo el canal de relación directa entre un hotel y sus huéspedes. Porque la segunda reserva debería pertenecer al hotel, no a la OTA.**

---

## El problema

El hotel paga miles de dólares al año a las OTAs no porque no atienda bien, sino porque **nunca construye una relación propia** con el huésped. Booking conoce al huésped → el hotel presta el servicio → el huésped se va → **Booking sigue siendo dueño de la relación**. El hotel "alquila" al huésped unos días; la próxima vez vuelve a pagar comisión para recuperar exactamente a la misma persona.

## La tesis (v2.1 — corrección del Founder, 2026-07-05)

> **STAI existe para construir y fortalecer el canal propietario de relación entre el hotel y cada huésped durante todo su ciclo de vida.**

**La reserva directa deja de ser el objetivo — pasa a ser una consecuencia natural de haber construido una buena relación.** El cambio parece chico pero modifica todas las decisiones futuras:

```
Antes:   OTA → Reserva directa
Ahora:   OTA → Relación → Canal propio → Conocimiento → Confianza → Reserva directa
```

### Qué es STAI (y qué NO es)

STAI **es el canal propietario del hotel.** No es:
- ❌ un sistema de QR
- ❌ un CRM
- ❌ un motor de incentivos
- ❌ un sistema de reservas
- ❌ una herramienta para captar emails
- ❌ una plataforma de descuentos

**Todo lo demás nace como consecuencia de haber construido ese canal:**

> El CRM existe porque existe el canal. El Twin existe porque existe el canal. La IA existe porque existe el canal. El scoring existe porque existe el canal. Los incentivos existen porque existe el canal. **La reserva directa existe porque existe el canal.**

### Una forma humana de decir lo mismo (Founder)

> **STAI es el lugar donde continúa la relación entre un hotel y un huésped después de la reserva.**

No reemplaza la definición de arriba — la ilumina. Explica solo todo el producto: la OTA termina, STAI empieza, y desde ese momento la relación **tiene un lugar donde vivir**; por eso aparecen —naturalmente— los NFC, los mensajes, el CRM, el Twin, la IA, los incentivos y la reserva directa.

## El momento más importante: el check-in

Es la primera vez que el huésped **acepta iniciar una relación** con el hotel. Vale mucho más que un QR, un descuento o una encuesta. Es el momento de decir: *"A partir de ahora, toda tu experiencia digital durante la estadía ocurre con nosotros."*

**El primer NFC no es un botón — es una puerta.** No dice "escaneá para un beneficio"; abre el **espacio personal del huésped durante toda la estadía**: comunicarse con recepción, amenities, reservar restaurante/spa, room service, recomendaciones de la ciudad, eventos, beneficios, comentarios, regalos, futuras reservas directas. **El verdadero onboarding no es completar un formulario — es que el huésped adopte el canal del hotel como su canal principal durante la estadía.**

## Cada NFC es un contexto; todos alimentan UNA Relationship

Recepción · Habitación · Restaurante · Spa · Desayuno · Checkout — cada uno con su propósito, pero **todos producen Moments sobre la misma Relationship**. No importa dónde ocurrió: cada Moment hace que el hotel conozca un poco más a la persona (le gusta el tinto, desayuna temprano, vino con su pareja, prefiere habitaciones silenciosas…). Ningún dato vale por separado; **juntos construyen una relación**.

## El CRM deja de ser un CRM — es el Twin del huésped

No otro Salesforce. Un **modelo vivo del huésped**: última visita, con quién viajó, habitación preferida, gustos, intereses detectados, comentarios relevantes, probabilidad de volver, **próxima mejor acción**. Un twin, no una tabla.

## La IA aparece naturalmente

No para responder preguntas — para **aprender continuamente**. Cada Moment: actualiza scoring, detecta intereses, descubre patrones, enriquece preferencias, sugiere próximas acciones, recomienda incentivos, anticipa necesidades. **Cada estadía vuelve más inteligente a la siguiente.**

## El flywheel

```
OTA trae al huésped → Check-in → STAI inicia la relación → toda la estadía en el canal del hotel
  → Moments → el hotel aprende → el perfil se enriquece → la IA comprende mejor
  → la comunicación se personaliza → el huésped vuelve directo → la OTA desaparece de la 2ª reserva
```

No empieza en un descuento. **Empieza en una relación.**

## Los incentivos son herramientas, no el producto

Cena, desayuno, upgrade, drink, masaje, entradas, descuento, early check-in, late checkout — **ninguno es el producto**. Son herramientas para fortalecer la relación. *(Esto recontextualiza Sprint 3: el loop de IncentiveProposal es UNA herramienta al servicio de la relación, no el centro.)*

---

## Product Principle (filtro de todo lo que construimos)

> **¿Esta funcionalidad ayuda al hotel a recuperar, fortalecer o mantener una relación directa con sus huéspedes?**
>
> Sí → pertenece a STAI. No → aunque sea útil, pertenece a otro producto.

---

## Reconciliación con lo congelado

**Alinea / realiza:**
- `01-product-discovery` y `03-product-formula`: *"convertir cada estadía en una relación directa"*, romper la dependencia de OTAs, **North Star = Direct Guest Relationship Rate**, **Business Outcome = OTA Revenue Recaptured**. La v2 es la misma tesis, afilada.
- **AD-B022 (Relationship First)** y el dominio (`Relationship`, `Moment`, `IncentiveProposal`): el Moment como unidad que enriquece la Relationship es exactamente el mecanismo del flywheel.
- Tesis LTV / patrimonio relacional (Founder Decisions): "la propiedad de la relación" es su formulación más nítida.

**Afila / agrega (nuevo énfasis):**
- El **check-in** como el momento crítico (antes: "cualquier momento del journey").
- El primer NFC como **puerta de adopción del canal** = el **verdadero onboarding** (antes: captura por formulario).
- El **Twin del huésped** como forma del conocimiento (antes: Guest 360 / preferencias).
- La **IA como aprendizaje continuo** que compone estadía-sobre-estadía (Knowledge Engine, aún futuro).

**Recontextualiza:** los incentivos (Sprint 3) pasan de "capacidad" a "herramienta al servicio de la relación".

## Implicaciones para el roadmap (bajo la disciplina vigente)

Esta tesis **gobierna** qué construimos, pero **no cambia cómo**: sprint por sprint, hipótesis → dominio → implementación mínima → validación técnica → **validación con usuario real** (Art. 7), construyendo solo cuando una hipótesis lo exige (Art. 6). Temas que la tesis ilumina como futuros (NO ahora): onboarding-como-adopción-de-canal en el check-in, el Twin del huésped, la IA de aprendizaje continuo, el resto de los NFC de contexto. Cada uno entra cuando su hipótesis toque construirlo — no por completar el modelo.
