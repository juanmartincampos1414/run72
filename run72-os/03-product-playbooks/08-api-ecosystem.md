# 08 — API & Ecosystem Strategy Playbook

| | |
|---|---|
| **Producto** | Framework (aplica a todos) |
| **Documento** | API & Ecosystem Strategy Playbook |
| **Versión** | v0.1 |
| **Estado** | Draft |
| **Owner** | RUN72 |
| **Última actualización** | Junio 2026 |

> Etapa 08. Recién acá hablamos de integraciones. **El producto ya existe** (etapas 01–07): las
> APIs/PMS/WhatsApp/Booking/Stripe son **implementaciones**, no el producto.

## Modelo de 3 capas (AD-005): Capability → Connector → Provider

- **Capability** — capacidad del negocio de la que depende el producto (ej. Property Management, Payments).
- **Connector** — el contrato/interfaz que implementa la capability (independiente del proveedor).
- **Provider** — implementación concreta e intercambiable (Cloudbeds, Stripe, WhatsApp…).

**Los productos de RUN72 dependen de capacidades, nunca de proveedores.** Modelar siempre por
Capability; el Provider se elige por cliente/piloto y se puede cambiar sin tocar el producto.
El catálogo de Capabilities + contratos vive en `04 Shared Components` (reutilizable por todo RUN72).

## 1. Objetivo
Definir todas las integraciones necesarias y cómo se conectan al modelo: qué sistemas, qué datos
entran/salen, qué eventos/webhooks, qué infraestructura compartida — y su prioridad (MVP vs post).

> Pregunta única: **"¿Con qué se conecta el producto, qué intercambia y por qué evento?"**

## 2. ¿Por qué existe?
- Las integraciones son **parte del producto** y gran parte de la ventaja competitiva.
- Diseñarlas como Connectors mantiene el modelo independiente del proveedor (intercambiable).

## 3. Entradas
- `05 Product Engines`, `06 Core Entities`, `07 Business Rules` **FROZEN**.

## 4. Qué definir (por integración)
**Sistema · Categoría · Connector · Dirección (in/out) · Qué aporta · Alimenta (Engine/Entity) ·
Eventos/Webhooks · Prioridad (MVP/post) · Proveedor (a definir por propiedad).**

## 5. Cómo ejecutar
1. Listar sistemas del Brief + los que exigen los Engines/Rules.
2. Mapear cada uno como **Connector** (in/out) → a qué Engine/Entity alimenta y con qué evento.
3. Definir webhooks entrantes (ej. PMS: reserva creada → atribución) y acciones salientes (ej. enviar WhatsApp).
4. Marcar **MVP vs post** y dejar el **proveedor abierto** (implementación, se elige en piloto).
5. Revisión del Founder.

## 6. Entregables
`08 API & Ecosystem`: catálogo de integraciones (Connectors) + estrategia de eventos/webhooks + prioridades.

## 7. Salidas
Habilita `09 MVP Scope`.

## 8. Errores Frecuentes
- Atar el modelo a un proveedor concreto.
- Tratar integraciones como features sueltas en vez de Connectors event-driven.
- Meter todas las integraciones en el MVP.

## 9–12. DoR / DoD / Freeze
- DoR: 05/06/07 FROZEN.
- DoD: todas las integraciones mapeadas como Connectors con dirección/eventos/prioridad; MVP marcado.
- Freeze: aprobado por el Founder · proveedores marcados como implementación · encabezado + estado + versión.
