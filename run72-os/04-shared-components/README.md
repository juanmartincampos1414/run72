# 04 — Shared Components

> Capacidades reutilizables del ecosistema RUN72. **Reutilizar antes de construir**
> (Principio 3 del POS). Antes de crear algo nuevo en cualquier producto, revisar acá.

## Las tres capas del ecosistema (Founder Decision, 2026-07-05)

Tras la consolidación del worker (AD-B027), RUN72 se describe en tres capas:

```
RUN72
├── Shared Packages   → capacidades reutilizables (código que los productos consumen). Este doc.
├── Shared Runtime    → la ejecución del ecosistema. Ver `run72-runtime.md`.
└── Shared Knowledge  → decisiones, patrones, capability catalog, lessons. Ver `06-knowledge-library`.
```

El **Runtime** (Event Bus, Worker Runtime, Scheduler, Observabilidad, Timeline/Lifecycle/Knowledge/Analytics Projectors) NO pertenece a ningún producto. Detalle arquitectónico completo en [`run72-runtime.md`](run72-runtime.md).

## Catálogo (origen Tips+ / Margin)

Componentes ya desarrollados que Stay debe reutilizar antes de construir nuevos:

| Componente | Origen | Qué provee |
|---|---|---|
| Guest Profiles | Tips+ | Perfil/identidad del huésped (Core Entity: Guest) |
| NFC Platform | Tips+ | Puntos de contacto físicos NFC |
| QR Entry Points | Tips+ | Captura/activación vía QR |
| Wallet | Tips+ | Billetera / rewards del huésped |
| Campaign Engine | Tips+ | Campañas y comunicación segmentada |
| Notification Engine | Tips+ | Notificaciones multicanal |
| Review Engine | Tips+ | Flujo de reseñas (Google/TripAdvisor) |
| Dashboard Framework | Tips+ | Tableros y métricas |
| Authentication | Tips+ | Login, sesiones |
| Roles & Permissions | Tips+ | Control de acceso |
| Organizations | Tips+ | Multi-tenant / cuentas |
| Analytics | Tips+ | Métricas de producto |
| Event Tracking | Tips+ | Eventos del funnel |
| Metodología (Engines, Core Entities, Business Rules, Stage Gates, AI-first) | Margin | Cómo se construye (POS) |

## Reglas

- Si un componente de esta lista cubre la necesidad → **se reutiliza**, no se reconstruye.
- Cuando una solución nueva demuestra ser reutilizable (Regla del Tres), se **promueve** acá
  como Shared Component oficial.
- Nota: estos componentes viven hoy en los repos de Tips+/Margin. La consolidación técnica
  (cómo se comparten entre productos) es trabajo de `08 API & Ecosystem` + Arquitectura de
  cada producto.
