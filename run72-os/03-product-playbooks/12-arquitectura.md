# 12 — Arquitectura Playbook

| | |
|---|---|
| **Producto** | Framework (aplica a todos) |
| **Documento** | Arquitectura Playbook |
| **Versión** | v0.1 |
| **Estado** | Draft |
| **Owner** | RUN72 |
| **Última actualización** | Junio 2026 |

> Etapa 12. Recién acá decidimos **stack e infraestructura**. Conectamos el modelo conceptual
> (engines/entities/rules/connectors) con tecnología concreta. **Reutilizar el stack del ecosistema**
> antes de introducir tecnología nueva.

## 1. Objetivo
Definir sobre qué se construye: lenguaje, framework, DB, hosting, event bus, cómo se materializan
Connectors e Integration Runtime, multi-tenancy, seguridad, observabilidad y deploy.

> Pregunta única: **"¿Sobre qué tecnología corre el modelo, reutilizando el ecosistema?"**

## 2. Entradas
- `05`–`11` **FROZEN**.

## 3. Qué definir
- Stack (lenguaje/framework) · DB · Auth/multi-tenant · **Event bus** · Connectors/Runtime (AD-006) ·
  AI Gateway · Hosting/Deploy · Seguridad · Observabilidad · **Reutilización** (qué se comparte con el ecosistema y cómo).

## 4. Cómo ejecutar
1. Partir del stack del ecosistema (no inventar) y justificar cualquier desvío con una AD.
2. Mapear cada engine/connector del MVP a su realización técnica.
3. Decidir cómo se **comparten físicamente** los Shared Components (monorepo / paquetes / servicios).
4. Doble pregunta (LL-002): ¿la arquitectura deja base reutilizable para el ecosistema?
5. Revisión Founder + Engineering.

## 5. Entregables
`12 Arquitectura`: decisiones de stack/infra + mapeo modelo→tecnología + ADs si hay desvíos.

## 6. Salidas
Habilita `13 Roadmap` (y el build real).

## 7. Errores Frecuentes
- Elegir tecnología por moda y no por reutilización/encaje.
- Sobre-ingeniería antes del PMF (broker complejo, microservicios prematuros).
- Romper el desacople Capability→Connector→Provider con dependencias directas a un proveedor.

## 8–10. DoR / DoD / Freeze
- DoR: 05–11 FROZEN.
- DoD: stack/infra definidos; modelo mapeado a tecnología; reutilización resuelta.
- Freeze: aprobado por Founder + Engineering · desvíos documentados como AD · encabezado + estado + versión.
