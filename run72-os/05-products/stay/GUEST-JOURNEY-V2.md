# STAI — Guest Journey v2

| | |
|---|---|
| **Estado** | Recorrido operativo de la [Core Product Thesis v2](./CORE-PRODUCT-THESIS.md) (Founder, 2026-07-05) |
| **Relación** | **Hereda** `04-journey-map` v1 FROZEN — el **Relationship Lifecycle de 8 estados NO cambia** (sigue siendo el modelo). La v2 re-narra el **Hotel Journey** (Parte B) y eleva el check-in. |
| **Regla** | Profundidad ≠ secuencia (aclaración del `04` congelada): cada touchpoint **profundiza** la relación; no es un flujo lineal rígido. |

> **Misión (v2.1).** STAI existe para **construir y fortalecer el canal propietario de relación entre el hotel y cada huésped durante todo su ciclo de vida.** La reserva directa es una **consecuencia**, no el objetivo. La relación **no empieza en un QR — empieza en el check-in.**

---

## El recorrido

```
Reserva OTA
   ↓  (la OTA termina aquí)
CHECK-IN  ──►  STAI pasa a ser el canal OFICIAL entre el hotel y el huésped
   ↓
toda la estadía (Moments · conocimiento · canal)
   ↓
Checkout
   ↓
Reserva directa  (consecuencia)
```

**El cambio de ownership es el momento más importante de toda la experiencia.** Hasta el check-in la relación pertenece a Booking; desde el check-in empieza a pertenecer al hotel. Ese instante es el **nacimiento real del producto**.

| Etapa | Qué vive el huésped (valor) | Qué aprende el hotel (Twin) | Dominio |
|---|---|---|---|
| **Pre-stay (OTA)** | Reservó por Booking/Expedia. La relación es de la OTA. | Origen OTA, fechas. | Anonymous · `guest.appeared` |
| **Check-in** ⭐ | El recepcionista le presenta STAI como **su canal durante la estadía** (comunicarse, pedir, descubrir la ciudad, beneficios). No un QR escondido — parte del proceso. **Acá acepta iniciar la relación.** | Identidad + **opt-in** = nace la relación directa. | **Identified** · `guest.identified` |
| **Durante la estadía** (recepción · habitación · restaurante · desayuno · spa · pileta · rooftop) | Cada punto **captura Y aporta valor**: agenda cultural, menú y vinos, guía del hotel, reservas, room service, ayuda. STAI es el canal. | Cada interacción es un **Moment** que enriquece **automáticamente** el Twin: preferencias (vino tinto, vegetariano, desayuna temprano), afinidades (teatro, fútbol), notas, scoring — **sin notas manuales**. | Engaged → Known → Recognized · `moment.logged`, `preference.captured` |
| **Checkout** | Feedback + —recién acá— un **incentivo** relevante (porque ahora el hotel lo conoce). | Cierre de la estadía; señal para proponer. | `moment.logged` (checkout) → `incentive.proposed/approved/delivered` |
| **Reserva directa** | Vuelve **directo**, sin OTA, con una propuesta que le importa. | Ingreso directo recuperado, atribución. | **Returning** · `directbooking.confirmed` |

---

## Los 3 cambios de narrativa

1. **El check-in NO es un onboarding — es un cambio de contrato.** Recepción transmite: *"Durante toda tu estadía este será tu canal oficial para comunicarte con el hotel."* El huésped adopta el canal (comunicarse, pedir ayuda, descubrir, reservar, recibir beneficios/propuestas, comentar). No es "escaneá este QR".
2. **Cada NFC da valor ANTES de pedir información.** Nunca se siente como un formulario. Cada punto responde siempre dos preguntas — *¿qué recibe el huésped?* y *¿qué aprende el hotel?*:

   | Punto | El huésped recibe | El hotel aprende |
   |---|---|---|
   | **Recepción** | Bienvenida · info del hotel · agenda de la ciudad · chat con recepción · concierge · eventos · restaurantes · transporte | Idioma · consentimiento · canal preferido · inicio de la relación |
   | **Restaurante** | Carta · vinos · promociones · reservas | Gustos gastronómicos · restricciones · bebidas favoritas · preferencias |
   | **Habitación** | Room service · housekeeping · amenities · información | Preferencias de habitación · necesidades · incidencias · horarios |
   | **Spa** | Reservas · promociones · disponibilidad | Intereses · frecuencia · afinidad |
   | **Checkout** | Beneficio · incentivo · próxima experiencia | Satisfacción · probabilidad de volver · probabilidad de reservar directo |

3. **El conocimiento se construye solo — el Twin es una consecuencia, no un concepto aislado.** Cada interacción enriquece **automáticamente** el conocimiento del huésped, que alimenta CRM · perfil · preferencias · notas · IA · personalización · segmentación · scoring · incentivos. **El CRM deja de ser una base de datos: pasa a ser memoria viva** (prefiere tinto · siempre pide checkout tarde · viaja por negocios · le gustan los teatros · es vegetariano · se hospedó 3 veces · abrió todas las comunicaciones · reservó siempre por Booking). Eso no lo carga un recepcionista — lo construye la plataforma.

## STAI como canal principal (futuro, no ahora)

Desde el check-in el huésped entiende que STAI es el canal oficial de la estadía: hablar con recepción, amenities, reportar problemas, limpieza, reservar restaurante/spa, room service, consultas. **Arranque: integrar WhatsApp. Después: chat propio.**

## Los incentivos son consecuencia

Cena, desayuno, upgrade, drink, spa, late checkout, 15% en la próxima, entradas a un show… **no son el producto.** Aparecen **al final**, cuando el hotel ya conoce al huésped, y **con un objetivo**: que la próxima reserva llegue directa. (El loop de IncentiveProposal de Sprint 3 es *esta* pieza — el final del recorrido.)

---

## Reconciliación

- **No cambia** el Relationship Lifecycle de 8 estados (`04` FROZEN) ni el dominio (`Relationship`, `Moment`, `IncentiveProposal`, AD-B022). La v2 re-narra el Hotel Journey y **eleva el check-in** de "opt-in por QR" a "adopción del canal".
- **Realiza** la Core Product Thesis v2 y el North Star (Direct Guest Relationship Rate) / Business Outcome (OTA Revenue Recaptured).
- **Product Principle** (filtro de la tesis): *¿ayuda a recuperar/fortalecer/mantener la relación directa? Sí → STAI.*

## Qué NO está construido (Artículo 6 — futuros, sprint por sprint)

Onboarding-como-adopción-de-canal en el check-in · los NFC informativos (doble vía) · el Twin del huésped · la auto-enriquecimiento por IA · el canal de comunicación (WhatsApp→chat) · la mayoría de los touchpoints. Cada uno entra cuando su hipótesis toque construirlo, bajo la pregunta rectora de Sprint 3+:

> **¿Cómo convierte STAI un huésped OTA en un cliente directo del hotel durante toda su estadía?**
