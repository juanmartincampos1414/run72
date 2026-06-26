# 05 — Product Engines Playbook

| | |
|---|---|
| **Producto** | Framework (aplica a todos) |
| **Documento** | Product Engines Playbook |
| **Versión** | v0.1 |
| **Estado** | Draft |
| **Owner** | RUN72 |
| **Última actualización** | Junio 2026 |

> Etapa 05. Diseñamos **capacidades permanentes** (Engines), no funcionalidades. Las pantallas
> cambian; los Engines permanecen. **Los Engines nacen del Relationship Lifecycle** (AD-002).

## Principios de arquitectura (AD-003)

- **Engines ejecutan, Business Rules deciden.** Los Engines son deterministas y no contienen
  lógica de decisión; las decisiones viven en `07 Business Rules`.
- **Connectors / Plugins conectan.** QR/NFC/WiFi/WhatsApp/Wallet/PMS/POS… **no son Engines**:
  son mecanismos de entrada que traducen el mundo externo a eventos normalizados.
- **Shared Components se reutilizan** antes de construir.
- Los Engines se comunican por **eventos**, no por llamadas directas.

## 1. Objetivo

Definir las capacidades internas del producto: qué hace cada Engine, qué consume y produce,
cómo se mide y qué eventos maneja.

> Pregunta única: **"¿Qué capacidades permanentes necesita el producto, y cómo se conectan por eventos?"**

## 2. ¿Por qué existe?

- Separa la lógica del producto de la UI (las pantallas son una vista de los Engines).
- Hace explícita la **reutilización** (qué Engine ya existe en el ecosistema).
- Conecta el modelo conceptual (Lifecycle) con la arquitectura event-driven.

## 3. Entradas

- `04 Journey Map` **FROZEN** (Lifecycle + eventos).

## 4. Plantilla por Engine

Cada Engine se documenta con: **Nombre · Objetivo · Inputs · Outputs · KPIs · Dependencias ·
APIs · Eventos (consume / emite)**. Indicar siempre si es **NUEVO** o **REUTILIZADO**.

## 5. Cómo ejecutar

1. Partir de los eventos del Lifecycle: cada transición sugiere un Engine.
2. Para cada Engine candidato: **¿ya existe en `04 Shared Components`?** Si sí → reutilizar.
3. Diseñar los Engines nuevos con la plantilla; conectar por eventos (no por llamadas directas).
4. Marcar el Engine **core** (el que orquesta el modelo).
5. Revisión del Founder.

## 6. Entregables

`05 Product Engines`: catálogo de Engines (nuevos + reutilizados) con la plantilla y el mapa de eventos.

## 7. Salidas

Habilita `06 Core Entities`.

## 8. Componentes Reutilizables

Engines existentes del ecosistema (Tips+): Campaign, Notification, Review, Wallet/Rewards,
CRM/Guest Profile, Analytics/Event Tracking, Auth/Roles/Orgs.

## 9. Errores Frecuentes

- Diseñar features en vez de capacidades.
- Reconstruir un Engine que ya existe en Tips+.
- Acoplar Engines por llamadas directas en lugar de eventos.
- Bajar a detalle de implementación/código (eso es Build Specs / Arquitectura).

## 10. Definition of Ready
- [ ] Journey Map FROZEN.

## 11. Definition of Done
- [ ] Todos los Engines (nuevos y reutilizados) documentados con la plantilla.
- [ ] Mapa de eventos consistente con el Lifecycle.
- [ ] Marcado qué se reutiliza y qué es nuevo.

## 12. Freeze Checklist
- [ ] Aprobado por el Founder.
- [ ] Reutilización maximizada.
- [ ] Encabezado estándar + estado Frozen + versión.
