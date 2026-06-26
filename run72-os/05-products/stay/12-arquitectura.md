# Stay — 12 Arquitectura (alineación con el ecosistema)

| | |
|---|---|
| **Producto** | Stay |
| **Documento** | 12 Arquitectura |
| **Versión** | v1.0 |
| **Estado** | **FROZEN** |
| **Owner** | RUN72 |
| **Última actualización** | Junio 2026 |
| **Modificaciones** | Ninguna. Las 3 decisiones de build se resuelven como ADs específicas del build. |

> Stay **no diseña una arquitectura nueva**: **hereda** la del ecosistema (AD-007) y documenta su
> **alineación**. Stack heredado (TS · Next.js · Supabase · Vercel · Anthropic/AI Gateway · GitHub):
> ver [`ecosystem-architecture`](../../04-shared-components/ecosystem-architecture.md). Esta etapa
> responde 5 preguntas.

---

## 1. ¿Qué reutiliza **sin modificaciones**?
Stack heredado completo (TS/Next.js/Supabase/Vercel/AI Gateway/GitHub) · **Auth · Roles ·
Organizations** · **Event Tracking/Analytics** · **Design System** · patrón de acceso por API.

## 2. ¿Qué reutiliza **con extensiones**?
- **Guest Profiles** → extendido con preferencias y opt-in de hospitalidad (base del Guest Identity).
- **Campaign / Notification Engine** → para incentivos y mensajería del Guest Journey.
- **Review Engine** → flujo de reseñas hotelero (→ Advocate).
- **Wallet / Rewards** → Guest Club / Membership.
- **Dashboard framework** → KPIs del Lifecycle.

## 3. ¿Qué **componentes nuevos** incorpora Stay al ecosistema?
- **Relationship Lifecycle Engine** (CORE) · **RelationshipState** entity.
- **Experience / Moment Engine** · **Moment** entity.
- **Direct Relationship Engine** (incentivo + atribución).
- **Relationship Intelligence Engine** (insights sobre la relación).
- **Connectors de hospitality** (PMS, Booking/CRS, Capture) sobre el modelo Capability→Connector→Provider.

## 4. ¿Qué tiene **potencial de Shared Component**?
- **Relationship Lifecycle Engine** y **RelationshipState** (cualquier producto con relación cliente↔negocio).
- **Experience / Moment Engine** y **Moment** (interacciones event-driven).
- **Integration Runtime** (AD-006) y los **contratos de Connector** compartidos (Messaging, Reviews,
  Payments, AI) — ya aparecen en ≥2 productos (ver Capability Catalog).
- Promoción vía **Regla del Tres**.

## 5. ¿Qué **decisiones quedan abiertas** (se resuelven en el build, como ADs específicas)?
1. **Event Bus del MVP:** tabla `events` + workers vs. cola gestionada.
2. **Organización de repositorios:** Stay en el repo del ecosistema vs. repo propio.
3. **Estrategia de paquetes compartidos:** monorepo + paquetes vs. servicios compartidos.

> Estas tres son **decisiones de build**, no prerrequisitos del Stage Gate. Se registran como ADs
> propias del build cuando se resuelvan.

---

## Seguridad (heredada + aplicada)
Aislamiento por tenant (`property_id`), acceso por API, **opt-in a nivel datos**, credenciales de
Connectors cifradas (criterio del ecosistema), auditoría por `events`.

## Anti sobre-ingeniería (pre-PMF)
Sin microservicios ni broker complejo; sin PMS/Payments (atribución CSV). Lo mínimo para el piloto.

## Freeze Checklist
- [x] Stay alineado al stack **heredado** (AD-007); sin re-decidir tecnología.
- [x] 5 preguntas respondidas (reutiliza sin/with extensiones · nuevos · candidatos a shared · abiertas).
- [x] Decisiones de build marcadas como ADs específicas (no bloquean el Stage Gate).
- [x] **Aprobado por el Founder → FROZEN v1.0.** Habilita `13 Roadmap`.
