# STAI — Channel Strategy v1

| | |
|---|---|
| **Estado** | Estrategia de canal (Founder, 2026-07-05) — el eslabón que faltaba antes del Design Language |
| **Relación** | Deriva de [Core Product Thesis v2](./CORE-PRODUCT-THESIS.md) y [Guest Journey v2](./GUEST-JOURNEY-V2.md) |
| **Secuencia** | `Core Product Thesis → Guest Journey → **Channel Strategy** → Design Language → UI` (nunca al revés) |

> Este documento congela **qué es** STAI antes de decidir **cómo se ve** (Design Language) o **qué se construye** (UI/sprints). Todo lo que venga después se valida contra estas cuatro respuestas.

---

## 1. ¿Qué es STAI?

**El canal propietario de relación entre el hotel y el huésped.** No un QR, no un CRM, no un motor de incentivos, no un sistema de reservas — el **canal**. Todo lo demás (CRM, Twin, IA, scoring, incentivos, reserva directa) **nace como consecuencia** de haber construido ese canal.

## 2. ¿Qué papel ocupa?

**Acompañar toda la estadía** — desde el check-in (cambio de ownership: la relación pasa de la OTA al hotel) hasta la reserva directa siguiente, y a lo largo de todo el ciclo de vida del huésped.

## 3. ¿Qué capacidades debe tener?

- **Comunicación** (huésped ↔ hotel; arranque WhatsApp, después chat propio)
- **Información** (agenda de la ciudad, menú, guía, servicios — valor antes de pedir datos)
- **Servicios** (reservas, room service, housekeeping, amenities)
- **Feedback** (comentarios por experiencia)
- **CRM** (memoria viva, construida automáticamente)
- **IA** (aprendizaje continuo sobre cada Moment)
- **Personalización** (trato distinto según lo que el hotel conoce)
- **Incentivos** (consecuencia, con un objetivo: la próxima reserva directa)
- **Reserva directa** (el desenlace medible)

## 4. ¿Qué NUNCA debe hacer?

- ❌ Ser un **QR vacío**.
- ❌ Ser un **formulario**.
- ❌ Ser una herramienta **solo para captar emails**.
- ❌ Ser una **plataforma de descuentos**.
- ❌ **Molestar** al huésped.

---

## Product Principle (gobierna todas las decisiones)

> **Cada nueva capacidad debe fortalecer el canal.** Nunca agregamos funcionalidades porque "serían útiles" — solo si fortalecen la relación entre el hotel y el huésped.
>
> **La pregunta que gobierna todo:**
> **¿Esta funcionalidad hace que el huésped tenga más motivos para seguir utilizando el canal del hotel?**
>
> Sí → pertenece a STAI. No → aunque sea útil, probablemente pertenece a otro producto.

Corolario: ninguna capacidad puede violar los "nunca" (§4). Si pide información sin dar valor primero, o convierte el canal en un formulario o un cupón, **no pertenece** — aunque técnicamente funcione.

## El KPI verdadero (a descubrir, no a inventar)

El activo que construye STAI **no es** una base de datos, un CRM, un perfil ni un incentivo. **El activo es el canal.** Por eso métricas como Direct Guest Relationship Rate, Guest Capture Rate o Lifecycle Distribution pasan a ser **indicadores secundarios**. La verdadera pregunta es:

> **¿Qué tan fuerte se está volviendo el canal propietario del hotel?**

Todavía no sabemos cómo medir eso, y no hace falta inventarlo ahora. Queda **registrado como el KPI verdadero que algún día vamos a descubrir** — no construir, descubrir. (Nace de la evidencia, como todo en RUN72.)
