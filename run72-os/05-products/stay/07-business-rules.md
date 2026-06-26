# Stay — 07 Business Rules

| | |
|---|---|
| **Producto** | Stay |
| **Documento** | 07 Business Rules |
| **Versión** | v0.1 |
| **Estado** | Draft |
| **Owner** | RUN72 |
| **Última actualización** | Junio 2026 |

> Toda la **lógica de decisión** (AD-003). Los Engines la ejecutan. Reglas **declarativas** y
> **configurables por propiedad**. `⚙️` = parámetro configurable · `🧪` = umbral a validar en el
> piloto · `❓` = decisión de negocio del Founder. Guía: *Business Rules Playbook*.

---

## 1. Reglas de transición del Relationship Lifecycle

> El Lifecycle es **profundidad**, no secuencia (AD-002): un huésped puede alcanzar Returning o
> Advocate sin pasar por los estados intermedios. El **estado vigente = el más profundo alcanzado**;
> el historial guarda todas las transiciones.

| # | CUANDO (disparador + condición) | ENTONCES estado | Evento |
|---|---|---|---|
| R-L1 | El huésped se identifica **y** da **opt-in** | → **Identified** | `stay.guest.identified` |
| R-L2 | Registra ≥1 interacción de valor (Moment) | → **Engaged** | `stay.guest.engaged` |
| R-L3 | Se capturan ≥ `N` preferencias `⚙️🧪` | → **Known** | `stay.guest.known` |
| R-L4 | El hotel le aplica personalización/beneficio reconocible | → **Recognized** | `stay.guest.recognized` |
| R-L5 | Engagement sostenido: ≥ `M` interacciones en ventana `T₁` **o** miembro activo del club `⚙️🧪` | → **Loyal** | `stay.guest.loyal` |
| R-L6 | Se confirma una **reserva directa atribuible** (ver §3) | → **Returning** | `stay.directbooking.confirmed` |
| R-L7 | Deja reseña o refiere a alguien | → **Advocate** | `stay.guest.advocated` |

## 2. Identidad y consentimiento
- **R-ID1 (consentimiento obligatorio):** sin **opt-in** explícito, Stay **no** contacta al
  huésped por canales directos ni lo suma al club. (Sin opt-in, queda Anonymous.)
- **R-ID2 (merge):** dos perfiles se unifican cuando coinciden señales fuertes (email/teléfono/doc).
  Criterios de match `⚙️`.
- **R-ID3 (ownership):** los datos del huésped pertenecen al **hotel** (filosofía RUN72: sin dependencia).

## 3. Atribución (Booking → Business Outcome)
- **R-AT1 (reserva directa atribuible):** una reserva cuenta como recapturada por Stay CUANDO la
  realiza un **Guest identificado por Stay**, por **canal directo**, dentro de una ventana de
  `T₂` días `⚙️🧪` desde la última estadía/identificación.
- **R-AT2 (cálculo):** `OTA Revenue Recaptured` = valor de la reserva directa × **tasa de comisión
  OTA evitada** `⚙️` (por propiedad). ❓ ¿Contamos el revenue directo total o solo la comisión evitada?

## 4. Incentivos (Direct Relationship Engine)
- **R-IN1:** CUANDO checkout **y** el huésped no tiene reserva futura ENTONCES enviar incentivo de
  reserva directa (respetando guardrails §6).
- **R-IN2:** elegibilidad y **tipo/monto del incentivo** `⚙️` por propiedad. ❓ ¿Qué incentivo
  ofrecemos en Palacio Paz (descuento %, beneficio en Trufa/spa, late checkout…)?

## 5. Beneficios / Club (Loyalty Engine)
- **R-BN1:** los beneficios se otorgan **por estado/membresía** (catálogo `⚙️` por propiedad):
  qué reward corresponde en Recognized vs Loyal. ❓ Catálogo de beneficios de Palacio Paz.
- **R-BN2:** un beneficio solo aplica si el huésped está en el estado/membresía requerido.

## 6. Guardrails (siempre)
- **R-G1 (frecuencia):** tope máximo de comunicaciones por huésped/período `⚙️`.
- **R-G2 (opt-out):** respetar baja/consentimiento en todo momento; un opt-out frena toda comunicación.
- **R-G3 (privacidad):** datos tratados según la política vigente; nunca compartir entre propiedades.

---

## Parámetros configurables (por propiedad — validar en piloto)

| Param | Significado | Default propuesto | Estado |
|---|---|---|---|
| `N` | preferencias para **Known** | 2 | 🧪 |
| `M` / `T₁` | interacciones / ventana para **Loyal** | 3 en 90 días | 🧪 |
| `T₂` | ventana de atribución de reserva directa | 90 días | 🧪 |
| comisión OTA | tasa evitada para el cálculo | 15–20% | ⚙️❓ |
| incentivo | tipo/monto de reserva directa | a definir | ❓ |
| frecuencia | tope de comunicaciones | a definir | ⚙️ |

## Decisiones del Founder a cerrar
1. **Atribución (R-AT2):** ¿revenue directo total o solo comisión evitada como Business Outcome?
2. **Incentivo (R-IN2):** qué ofrece Palacio Paz para la reserva directa.
3. **Beneficios (R-BN1):** catálogo del Guest Club en Palacio Paz.

> Los umbrales `🧪` se calibran con datos reales del piloto; arrancamos con los defaults.

## Para pasar a Frozen (faltante)
- [ ] OK del Founder a las reglas (transiciones + atribución + guardrails).
- [ ] Resolver (o marcar como "a calibrar en piloto") las 3 decisiones de negocio.
- [ ] Aprobación → **Frozen v1.0** → habilita `08 API & Ecosystem Strategy`.
