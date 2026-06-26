# Stay — 11 Sprint Planning (MVP)

| | |
|---|---|
| **Producto** | Stay |
| **Documento** | 11 Sprint Planning |
| **Versión** | v1.0 |
| **Estado** | **FROZEN** |
| **Owner** | RUN72 |
| **Última actualización** | Junio 2026 |
| **Modificaciones** | Ninguna (mejoras futuras → nueva versión, sin reabrir la etapa) |

> El MVP (09/10) en **4 sprints autocontenidos**, secuenciados **por riesgo**. Cada sprint
> documenta las **4 cosas RUN72**: Hipótesis · Capacidad · DONE · Aprendizaje esperado. ♻️ reutiliza Tips+.

---

## Sprint 1 — Capture & Identity (Anonymous → Identified) · *el linchpin*
- **Hipótesis:** podemos **identificar** a un huésped OTA durante la estadía y obtener su opt-in.
- **Capacidad funcional:** captura por QR → identidad + opt-in → estado **Identified**.
- **Alcance:** base del proyecto (♻️ Auth/Orgs/Guest Profiles/Event bus) + modelo de datos ·
  Capture Connector (QR) · Guest Identity · Lifecycle Engine (Identified) · Property+config.
- **Definition of Done:** un huésped escanea un QR en Palacio Paz, se identifica + da opt-in,
  queda **Identified** y se registra `stay.guest.identified`.
- **Aprendizaje esperado:** ¿qué % de huéspedes se identifican? ¿qué Entry Point funciona mejor?
  (calibra Guest Capture Rate y valida el supuesto #1).

## Sprint 2 — Moments & Lifecycle (Engaged→Known→Recognized) + Dashboard v1
- **Hipótesis:** las interacciones durante la estadía **profundizan** la relación de forma medible.
- **Capacidad funcional:** registro de Moments + avance del Lifecycle + dashboard v1.
- **Alcance:** Experience/Moment Engine · captura en más momentos (Trufa/habitación) · reglas (07)
  como config · ♻️ Dashboard/Analytics.
- **Definition of Done:** un huésped progresa Identified→Engaged→Known→Recognized según sus
  interacciones, visible en el dashboard.
- **Aprendizaje esperado:** ¿qué momentos generan más engagement? ¿qué datos capturamos realmente?

## Sprint 3 — Direct Relationship & Messaging (incentivo post-stay)
- **Hipótesis:** un **incentivo personalizado** mueve al huésped hacia la relación directa.
- **Capacidad funcional:** envío de Direct Booking Incentive (configurable) por WhatsApp/Email.
- **Alcance:** Messaging Connector (WhatsApp+Email) · Direct Relationship Engine · incentivo
  (regla configurable, manual) · ♻️ Campaign/Notification.
- **Definition of Done:** al checkout/post-stay el huésped recibe el incentivo configurado por el
  hotel; se registra `stay.directbooking.incentive_sent`.
- **Aprendizaje esperado:** ¿qué incentivos responden mejor? ¿qué canal convierte más?

## Sprint 4 — Attribution & ROI + Reviews + Intelligence
- **Hipótesis:** podemos **atribuir** la reserva directa y demostrar el **ROI** (hipótesis completa).
- **Capacidad funcional:** atribución + OTA Revenue Recaptured en dashboard + reseñas + insights.
- **Alcance:** Booking import (CSV) + atribución → `commission_saved` · dashboard completo ·
  Reputation Connector (Google) → `stay.guest.advocated` · Relationship Intelligence (1–2 insights, ♻️ AI Gateway).
- **Definition of Done:** se atribuye la **primera reserva directa**, el dashboard muestra **OTA
  Revenue Recaptured** y Direct Guest Relationship Rate; el flujo de reseña funciona.
- **Aprendizaje esperado:** ¿cuánto revenue recuperamos? ¿se valida la hipótesis OTA→directo?
  (los números reales que calibran el modelo y prueban la tesis).

---

## Notas
- **Atribución manual/CSV** en todos los sprints (sin PMS), coherente con 08/09.
- Tras Sprint 4, el MVP opera el **piloto** en Palacio Paz y **calibra umbrales**.
- Siguiente: `12 Arquitectura` (stack/infra) antes/junto al build real.

## Freeze Checklist
- [x] MVP en 4 sprints autocontenidos, secuenciados por riesgo.
- [x] Cada sprint con las 4 cosas RUN72 (hipótesis · capacidad · DONE · aprendizaje).
- [x] Valor demostrable y DONE binario por sprint; sin reabrir decisiones.
- [x] **Aprobado por el Founder → FROZEN v1.0.** Habilita `12 Arquitectura`.
