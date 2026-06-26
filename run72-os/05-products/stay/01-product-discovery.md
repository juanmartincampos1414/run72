# Stay — 01 Product Discovery

| | |
|---|---|
| **Producto** | Stay |
| **Documento** | 01 Product Discovery |
| **Versión** | v1.0 |
| **Estado** | **FROZEN** |
| **Owner** | RUN72 |
| **Última actualización** | Junio 2026 |
| **Modificaciones** | Ninguna (las mejoras futuras van en una nueva versión, no reabren la etapa) |

> Fuente: `00 Founder Brief` + refinamiento del Founder (Guest Journey + North Star
> económica). ✅ = definido · 🧪 = supuesto a validar en el piloto (Palacio Paz).

---

## 1. Problema

✅ Los hoteles pagan comisiones altas a las OTAs para conseguir huéspedes y, una vez que
el huésped llega, **no logran convertir esa estadía en una relación directa**; cada nueva
reserva vuelve a pagar comisión.

- 🧪 **Alternativa actual** y 🧪 **costo del problema** (comisiones + recompra no capturada):
  a relevar/cuantificar en el piloto.

## 2. ICP y usuarios

- ✅ **Quién paga (ICP):** hoteles, foco inicial **boutique** (piloto: Palacio Paz, + restaurante Trufa).
- 🧪 **Usuarios:** hotel (recepción/management) + **huésped** durante la estadía. Roles a precisar.
- 🧪 **Quién decide:** dueño/dirección del hotel — confirmar.

## 3. Por qué existe + Categoría

- ✅ Romper la dependencia de las OTAs convirtiendo cada estadía en una relación directa.
- ✅ **Categoría: Direct Guest Platform (DGP).** No es PMS, CRM ni Booking Engine.
  **Vive por encima del stack del hotel y lo conecta.**

## 4. Visión del producto — el Guest Journey

✅ Stay no es "capturar un huésped": es **acompañar toda la estadía** y convertir **cada
momento del Guest Journey** en una oportunidad de relación directa con el hotel.

**Momentos (interaction points):** pre-stay → check-in → habitación → desayuno → Trufa →
room service → spa → checkout → post-stay. (La lista exacta se profundiza en `04 Journey Map`.)

**Entry Points (canales hacia cada momento):** NFC · QR · WiFi · WhatsApp · Wallet · etc.
Los Entry Points **no son el producto** — son las puertas de entrada a los momentos. Stay es
la **capa que orquesta el journey** sobre esos canales. Esto evita atarse a una sola tecnología
de captura y prepara los **Product Engines** (etapa 05).

## 5. North Star

Separamos lo que el **producto controla** del **impacto económico** para el hotel:

- ✅ **Visión:** *Turn Every Stay Into a Direct Relationship.*
- ✅ **North Star (Producto):** **Direct Guest Relationship Rate** — % de huéspedes que pasan
  a formar parte de una relación directa con el hotel gracias a Stay. Es la métrica que el
  producto controla y debe maximizar.
- ✅ **Business Outcome (ROI del hotel):** **OTA Revenue Recaptured** — ingresos recuperados +
  comisiones evitadas gracias a Stay. Es el principal indicador de valor económico.

**Métricas operativas (drivers):** Guest Capture Rate · Direct Booking Conversion · CRM Growth.

🧪 Fórmulas/umbrales exactos de cada métrica a cerrar con el piloto.

## 6. Momento mágico

✅ El hotel ve su **primera reserva directa de un huésped que había llegado por OTA**
(comisión evitada) — el instante en que Stay "se paga solo".

## 7. Qué NO hace (límites)

✅ No es PMS, Channel Manager, Booking Engine ni CRM tradicional. No administra reservas ni
reemplaza software existente. **Conecta, no reemplaza.**
- AD a registrar: *"¿Por qué Stay no reemplaza un PMS?"*

## 8. Supuestos críticos y plan de validación (piloto Palacio Paz)

| # | Supuesto | Cómo se valida | Señal de éxito |
|---|---|---|---|
| 1 🔴 | Podemos **identificar/capturar** al huésped OTA durante la estadía | Probar Entry Points en varios momentos (NFC habitación, QR check-in y Trufa, WiFi) | Guest Capture Rate ≥ umbral a definir |
| 2 🟠 | Hay **disposición a pagar** por Stay | Conversación de pricing post-piloto + propuesta a Palacio Paz | Señal clara de willingness-to-pay |
| 3 | El hotel **quiere y puede** ir directo | Entrevista con dirección de Palacio Paz | Compromiso del hotel con captación directa |
| 4 | El **huésped acepta** la relación directa | Medir opt-in en los puntos de captura | Tasa de opt-in ≥ umbral a definir |

🧪 **Evidencia:** pendiente del piloto. Objetivo del piloto = **aprender** (no vender).

## 9. Por qué RUN72 puede ganar

- ✅ **Reutilización masiva** del ecosistema (Tips+/Margin) → velocidad: Guest Profiles, NFC,
  QR, Wallet, Campaign/Notification/Review Engine, Dashboard, Auth, Roles, Orgs, Analytics,
  Event Tracking (ver `04 Shared Components`) + metodología de Margin (POS).
- ✅ AI-Native + piloto real (Palacio Paz) para iterar aprendiendo.

---

## Alcance del MVP (referencia — se profundiza en `09/10 MVP Scope`)

Hipótesis a validar: **¿Podemos convertir huéspedes OTA en huéspedes directos?**
Construir solo: Guest Capture · Guest Club · Direct Booking Incentive · CRM básico ·
Campaigns · Review Flow · Dashboard · Integraciones esenciales. El MVP toca primero los
momentos de mayor palanca del journey (captura en estadía → incentivo directo → post-stay).
Reutilizar de Tips+/Margin.

## Freeze Checklist

- [x] Problema, ICP, categoría definidos.
- [x] Visión del producto (Guest Journey + Entry Points).
- [x] North Star económica + métricas operativas.
- [x] Momento mágico.
- [x] Qué NO hace.
- [x] North Star de Producto + Business Outcome separados.
- [x] Supuestos críticos con **plan de validación** documentado.
- [x] **Aprobado por el Founder → FROZEN v1.0.** Habilita `02 Brand System`.
