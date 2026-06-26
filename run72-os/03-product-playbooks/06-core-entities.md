# 06 — Core Entities Playbook

| | |
|---|---|
| **Producto** | Framework (aplica a todos) |
| **Documento** | Core Entities Playbook |
| **Versión** | v0.1 |
| **Estado** | Draft |
| **Owner** | RUN72 |
| **Última actualización** | Junio 2026 |

> Etapa 06. Definimos las **entidades del dominio** (el modelo de datos). Las entidades
> **no contienen lógica** (eso es `07 Business Rules`): son la estructura sobre la que operan
> los Engines. Deben pensarse **reutilizables** por el resto del ecosistema RUN72.

## 1. Objetivo

Modelar las entidades principales del dominio, sus atributos y relaciones, marcando cuáles son
**compartidas** (reutilizables entre productos) y cuáles son **propias** del producto.

> Pregunta única: **"¿Cuáles son las cosas del dominio, cómo se relacionan, y cuáles se reutilizan?"**

## 2. ¿Por qué existe?

- Da una base de datos estable y consistente para todos los Engines.
- Maximiza reutilización: una **Core Entity compartida** (ej. Guest) sirve a varios productos.
- Evita que la lógica se cuele en el modelo (separación con Business Rules).

## 3. Entradas
- `04 Journey Map` y `05 Product Engines` **FROZEN** (las entidades emergen de ahí).

## 4. Plantilla por entidad
**Nombre · Definición · Atributos clave · Relaciones · Reutilizable (compartida/propia + origen) ·
Engine dueño · Eventos relacionados.**

## 5. Cómo ejecutar
1. Listar las entidades que aparecen en Journey + Engines.
2. Para cada una: ¿ya existe en el ecosistema (Tips+)? → reutilizar/extender.
3. Definir atributos y relaciones (sin lógica).
4. Marcar **compartidas vs propias** y el Engine dueño.
5. Revisión del Founder.

## 6. Entregables
`06 Core Entities`: el modelo de entidades con la plantilla + diagrama de relaciones.

## 7. Salidas
Habilita `07 Business Rules`.

## 8. Componentes Reutilizables
Entidades compartidas del ecosistema (Tips+): Guest, Organization/Property, Event, Reward/Wallet, etc.

## 9. Errores Frecuentes
- Meter lógica de negocio en la entidad (va en 07).
- Duplicar una entidad que ya existe en el ecosistema.
- Modelar tablas de implementación en vez de entidades de dominio (eso es Arquitectura, etapa 12).

## 10. Definition of Ready
- [ ] Journey Map y Product Engines FROZEN.

## 11. Definition of Done
- [ ] Todas las entidades con la plantilla + relaciones.
- [ ] Marcadas compartidas vs propias.

## 12. Freeze Checklist
- [ ] Aprobado por el Founder.
- [ ] Sin lógica en las entidades.
- [ ] Encabezado estándar + estado Frozen + versión.
