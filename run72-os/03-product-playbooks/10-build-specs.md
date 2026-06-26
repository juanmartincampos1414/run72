# 10 — Build Specs Playbook

| | |
|---|---|
| **Producto** | Framework (aplica a todos) |
| **Documento** | Build Specs Playbook |
| **Versión** | v0.1 |
| **Estado** | Draft |
| **Owner** | RUN72 |
| **Última actualización** | Junio 2026 |

> Etapa 10. Traducimos la estrategia (01–09) en **especificaciones técnicas**: cómo construir
> cada módulo. **Solo implementación, no estrategia.** Acá empieza a oler a código.

## 1. Objetivo
Especificar qué se construye, módulo por módulo, con el detalle suficiente para que Engineering
arranque sin reabrir decisiones — y reutilizando todo lo posible (Tips+, Shared Components).

> Pregunta única: **"¿Cómo se construye cada módulo del MVP, y qué reutiliza?"**

## 2. ¿Por qué existe?
- Separa el "qué/por qué" (01–09) del "cómo" (10).
- Hace explícita la **reutilización** a nivel técnico (no reconstruir Tips+).
- Da una base estable para Sprint Planning (11) y Arquitectura (12).

## 3. Entradas
- `05`–`09` **FROZEN** (engines, entities, rules, integraciones, MVP scope).

## 4. Plantilla por módulo
**Módulo · Responsabilidad · Datos (entidades/campos) · APIs/Endpoints · Eventos (consume/emite) ·
Reutiliza (Tips+/Shared) · Dependencias · Simplificaciones del MVP (qué se hace mínimo).**

## 5. Cómo ejecutar
1. Tomar el **MVP Scope (09)** — solo eso se especifica.
2. Por cada módulo/engine/connector del MVP: completar la plantilla.
3. Marcar explícitamente lo **reutilizado** y lo **nuevo**.
4. La **doble pregunta** (LL-002): ¿el spec deja algo reutilizable para el ecosistema?
5. Revisión (Founder + Engineering).

## 6. Entregables
`10 Build Specs`: specs por módulo + modelo de datos del MVP + contratos de los Connectors del MVP.

## 7. Salidas
Habilita `11 Sprint Planning`.

## 8. Errores Frecuentes
- Meter estrategia/decisiones nuevas (van en etapas anteriores).
- Especificar fuera del MVP Scope.
- Reconstruir algo que Tips+ ya provee.
- Bajar a detalle de infraestructura/deploy (eso es `12 Arquitectura`).

## 9–12. DoR / DoD / Freeze
- DoR: 05–09 FROZEN.
- DoD: todos los módulos del MVP especificados; reutilización marcada; modelo de datos del MVP definido.
- Freeze: aprobado por Founder + Engineering · sin estrategia nueva · encabezado + estado + versión.
