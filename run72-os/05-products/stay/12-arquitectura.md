# Stay — 12 Arquitectura (MVP)

| | |
|---|---|
| **Producto** | Stay |
| **Documento** | 12 Arquitectura |
| **Versión** | v0.1 |
| **Estado** | Draft |
| **Owner** | RUN72 |
| **Última actualización** | Junio 2026 |

> Sobre qué corre el modelo. **Propuesta alineada al stack del ecosistema RUN72** (reutilizar
> antes de inventar). ✅ = decisión propuesta · ❓ = a confirmar con Engineering.

---

## Stack propuesto (reutiliza el ecosistema)

| Capa | Decisión propuesta | Reutiliza |
|---|---|---|
| Lenguaje | **TypeScript** | ecosistema RUN72 |
| Framework / API | **Next.js (App Router)** + API routes/serverless | RUN72 |
| DB | **Supabase Postgres**, multi-tenant por `property_id` (acceso vía API service-role) | RUN72/Tips+ |
| Auth & multi-tenant | **Supabase Auth** + Roles + Organizations | ♻️ Tips+ |
| **Event bus** | MVP: **tabla `events` + workers/processors** con idempotencia; evolucionable a broker | patrón RUN72 |
| AI Gateway | **Anthropic (claude)** detrás del AI Connector | ♻️ patrón RUN72 |
| Hosting / Deploy | **Vercel** + Supabase | RUN72 |
| Design System / Dashboard | tokens + componentes RUN72/Tips+ | ♻️ |

## Mapeo modelo → tecnología
- **Engines** = módulos/servicios deterministas (TS) que consumen/emiten eventos del bus.
- **Business Rules (07)** = config declarativa (tabla/JSON por propiedad), no hardcode.
- **Connectors (AD-005)** = adapters detrás de un contrato; cada Provider implementa el contrato.
- **Integration Runtime (AD-006)** = módulo compartido: credenciales por tenant, sync/idempotencia,
  normalización (provider → Core Entities), capability flags, observabilidad.
- **Core Entities** = tablas Postgres (Guest, Stay, RelationshipState, Moment, Booking, Reward, Event).

## Seguridad
- Aislamiento por tenant (`property_id`); todo acceso por API (RLS bloquea anon, como el resto del ecosistema).
- **Consentimiento (opt-in) aplicado a nivel datos**; opt-out frena comunicación.
- Credenciales de Connectors **cifradas** (server-side, fuera de la DB) — mismo criterio que la bóveda del ecosistema.
- Auditoría vía `events`.

## Reutilización física de Shared Components ❓
Decisión de Engineering (a confirmar en build): **monorepo con paquetes compartidos** vs. servicios
compartidos. Recomendación: empezar **monorepo + paquetes** (Auth, Event bus, Connectors, Design
System) para maximizar reutilización con Tips+ sin sobre-ingeniería. Se registra como AD al decidir.

## Anti sobre-ingeniería (pre-PMF)
- **Sin** microservicios ni broker complejo en el MVP (tabla de eventos + workers alcanza).
- **Sin** integraciones PMS/Payments (atribución CSV).
- Lo mínimo para correr el piloto y calibrar.

## Decisiones a confirmar (Engineering)
1. Event bus del MVP: tabla `events` + workers ✅ vs. cola gestionada ❓.
2. Reutilización física: monorepo + paquetes (recomendado) ❓.
3. ¿Stay vive en el repo del ecosistema o repo propio que consume los paquetes compartidos? ❓

## Para pasar a Frozen (faltante)
- [ ] OK del Founder + Engineering al stack y al mapeo.
- [ ] Resolver (o marcar como AD) las 3 decisiones de Engineering.
- [ ] Aprobación → **Frozen v1.0** → habilita `13 Roadmap`.
