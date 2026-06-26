# Ecosystem Architecture — el baseline que los productos heredan

| | |
|---|---|
| **Estado** | Vivo |
| **Owner** | RUN72 (nivel ecosistema) |
| **Base** | AD-007 (Heredar antes de decidir) |

> La arquitectura **vive acá**, no en cada producto. Todo producto RUN72 **hereda** este baseline
> y solo documenta su alineación (etapa 12). Desviarse requiere una AD.

## Stack heredado

| Capa | Estándar del ecosistema |
|---|---|
| Lenguaje | TypeScript |
| Framework / Web | Next.js (App Router) |
| DB | Supabase (Postgres) · acceso vía API (RLS bloquea anon) |
| Auth / Multi-tenant | Supabase Auth + Roles + Organizations |
| AI | **AI Gateway** (Anthropic / claude) |
| Hosting / Deploy | Vercel + Supabase |
| Memoria técnica | GitHub |
| Diseño | Design System RUN72 |

## Infra / componentes compartidos (ver Capability Catalog + Shared Components)

Auth · Roles & Permissions · Organizations · Guest/User Profiles · Notification Engine ·
Campaign Engine · Review Engine · Wallet/Rewards · Analytics / Event Tracking · AI Gateway ·
(emergiendo) **Integration Runtime** (AD-006) · **Capability/Connector** layer (AD-005).

## Cómo lo usa un producto

1. **Hereda** el stack (no lo re-decide — AD-007).
2. **Reutiliza** componentes (no los reconstruye — Principio 3).
3. Documenta en su etapa 12 **cómo se alinea** (las 5 preguntas).
4. Lo que crea nuevo y resulta reutilizable → se **promueve** acá (Regla del Tres).

> Mantener este documento como única fuente del baseline. Si el ecosistema cambia de stack, se
> cambia acá (con una AD), y los productos lo heredan.
