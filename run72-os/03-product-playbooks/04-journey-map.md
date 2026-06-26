# 04 — Journey Map Playbook

| | |
|---|---|
| **Producto** | Framework (aplica a todos) |
| **Documento** | Journey Map Playbook |
| **Versión** | v0.1 |
| **Estado** | Draft |
| **Owner** | RUN72 |
| **Última actualización** | Junio 2026 |

> Etapa 04 del Stage Gate. **No es un customer journey clásico.** Mapea el **ciclo completo
> de la relación** y, sobre todo, hace que **cada momento emita un evento** que alimenta los
> Engines, el CRM y el conocimiento. Si el Journey Map está bien hecho, los Product Engines
> (etapa 05) **emergen solos**.

## 1. Objetivo

Mapear todos los momentos de la relación y, en cada uno, detectar la oportunidad del producto
y el **evento** que genera para el ecosistema.

> Pregunta única: **"¿En qué momentos vive la relación, y qué evento produce cada uno?"**

## 2. ¿Por qué existe?

- Convierte la estrategia (Discovery/Brand/Formula) en **diseño accionable**.
- Hace explícito el modelo **event-driven**: nada termina en una pantalla; todo produce datos
  y conocimiento reutilizable.
- Es la fuente de la que se derivan los **Product Engines**, las **Core Entities** y las
  **Business Rules**.

## 3. Entradas

- `01 Discovery`, `02 Brand System`, `03 Product Formula` **FROZEN**.

## 4. Las 9 preguntas obligatorias por momento

Cada momento del journey **debe** responder, como mínimo:

1. ¿Qué intenta lograr el **huésped**?
2. ¿Qué intenta lograr el **hotel**?
3. ¿Qué **oportunidad** detecta Stay?
4. ¿Cuál es el **Entry Point**? (NFC / QR / WiFi / WhatsApp / Wallet / …)
5. ¿Qué **datos** se capturan?
6. ¿Qué **acción** propone Stay?
7. ¿Qué **valor** obtiene el huésped?
8. ¿Qué **valor** obtiene el hotel?
9. ¿Qué **evento** genera para el ecosistema RUN72? (alimenta Engines / CRM / conocimiento)

## 5. Cómo ejecutar

1. Listar los momentos del ciclo completo (pre-stay → … → post-stay), no solo la estadía.
2. Para cada momento, responder las 9 preguntas (proponer y marcar lo que se valida en el piloto).
3. Nombrar el **evento** de cada momento (verbo en pasado: `stay.guest.identified`, etc.).
4. Al final, **sintetizar qué Engines/Entities/Reglas anticipa** el journey (puntero a etapa 05),
   sin diseñarlos todavía.
5. Revisión del Founder + (idealmente) contraste con el piloto real.

## 6. Entregables

`04 Journey Map`: la grilla de momentos con las 9 respuestas + el catálogo de eventos +
los Engines/Entities que el journey anticipa.

## 7. Salidas

Habilita `05 Product Engines`.

## 8. Componentes Reutilizables

Entry Points y motores de Tips+ (NFC, QR, Wallet, Campaign/Notification/Review Engine,
Event Tracking, CRM, Analytics — ver `04 Shared Components`). El journey debe apoyarse en
ellos antes de inventar nada.

## 9. Errores Frecuentes

- Hacer un customer journey "de marketing" sin eventos ni datos.
- Que un momento termine en una pantalla y no en un evento.
- Diseñar Engines acá (eso es la etapa 05; acá solo se anticipan).
- Olvidar los momentos invisibles para el huésped pero valiosos para el hotel (post-stay, datos).

## 10. Definition of Ready
- [ ] Discovery, Brand y Formula FROZEN.

## 11. Definition of Done
- [ ] Todos los momentos del ciclo mapeados con las 9 preguntas.
- [ ] Cada momento tiene un evento nombrado.
- [ ] Síntesis de Engines/Entities anticipados.

## 12. Freeze Checklist
- [ ] Aprobado por el Founder.
- [ ] Eventos consistentes y reutilizables.
- [ ] Encabezado estándar + estado Frozen + versión.
