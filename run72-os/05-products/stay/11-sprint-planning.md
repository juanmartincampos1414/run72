# Stay — 11 Sprint Planning (MVP)

| | |
|---|---|
| **Producto** | Stay |
| **Documento** | 11 Sprint Planning |
| **Versión** | v0.1 |
| **Estado** | Draft |
| **Owner** | RUN72 |
| **Última actualización** | Junio 2026 |

> El MVP (09/10) cortado en **4 sprints autocontenidos**, secuenciados **por riesgo**: primero la
> captura/identidad (supuesto #1). Cada sprint = valor demostrable + DONE binario. Sin nuevas
> decisiones de producto. ♻️ reutiliza Tips+.

---

## Sprint 1 — Capture & Identity (Anonymous → Identified) · *el linchpin*
- **Objetivo:** validar que podemos **identificar** a un huésped OTA durante la estadía.
- **Alcance:** base del proyecto (♻️ Auth/Orgs/Guest Profiles/Event bus de Tips+) + modelo de
  datos · **Capture Connector (QR)** · Guest Identity (opt-in) · Lifecycle Engine (estado
  Identified) · Property con config.
- **Reutiliza:** ♻️ Auth, Organizations, Guest Profiles, Event Tracking.
- **DONE:** un huésped escanea un QR en Palacio Paz, se identifica + da opt-in, queda como
  **Identified** y se registra el evento `stay.guest.identified`.
- **Valor demostrable:** el supuesto más riesgoso, validado en vivo.
- **Fuera:** mensajería, incentivos, atribución, reviews.

## Sprint 2 — Moments & Lifecycle (Engaged → Known → Recognized) + Dashboard v1
- **Objetivo:** que la relación **avance** con cada interacción y se vea.
- **Alcance:** Experience/Moment Engine · captura en más momentos (Trufa/habitación) · reglas de
  transición (07) como config · Dashboard v1 (distribución por estado, Guest Capture Rate).
- **Reutiliza:** ♻️ Dashboard framework, Analytics/Event Tracking.
- **DONE:** un huésped progresa de Identified→Engaged→Known→Recognized según sus interacciones,
  visible en el dashboard.
- **Valor demostrable:** el Lifecycle "vivo" + primeras métricas.
- **Fuera:** incentivos/atribución/reviews.

## Sprint 3 — Direct Relationship & Messaging (incentivo post-stay)
- **Objetivo:** activar el **mecanismo** de relación directa (incentivo personalizado).
- **Alcance:** **Messaging Connector (WhatsApp + Email)** · Direct Relationship Engine ·
  **Direct Booking Incentive** (regla configurable, tipo de beneficio por propiedad, manual) ·
  ♻️ Campaign/Notification.
- **DONE:** al checkout/post-stay, el huésped recibe un incentivo de reserva directa configurado
  por el hotel; se registra `stay.directbooking.incentive_sent`.
- **Valor demostrable:** el hotel puede ofrecer y enviar incentivos directos.
- **Fuera:** atribución automática, reviews.

## Sprint 4 — Attribution & ROI + Reviews (Returning/Advocate) + Intelligence básico
- **Objetivo:** **cerrar el loop** y demostrar el ROI (la hipótesis completa).
- **Alcance:** **Booking import (CSV manual)** + atribución → `commission_saved` · **OTA Revenue
  Recaptured** en dashboard · Reputation Connector (Google) → reseña/`stay.guest.advocated` ·
  Relationship Intelligence (1–2 insights vía ♻️ AI Gateway) · Dashboard completo.
- **DONE:** se importa/atribuye la **primera reserva directa**, el dashboard muestra **OTA Revenue
  Recaptured** y Direct Guest Relationship Rate; el flujo de reseña funciona.
- **Valor demostrable:** la hipótesis OTA→directo **medida** end-to-end.
- **Fuera:** PMS/Payments/automatizaciones (post-MVP).

---

## Notas
- **Atribución manual/CSV** en todos los sprints (no PMS) — coherente con 08/09.
- Tras Sprint 4, el MVP está listo para **operar el piloto** en Palacio Paz y **calibrar umbrales**.
- Siguiente etapa del Stage Gate: `12 Arquitectura` (stack/infra) antes/junto al build real.

## Para pasar a Frozen (faltante)
- [ ] OK del Founder + Engineering a la secuencia y los DONE.
- [ ] Aprobación → **Frozen v1.0** → habilita `12 Arquitectura`.
