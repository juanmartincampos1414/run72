# AD-004 — Stay propone, el hotel decide (automatización progresiva y opt-in)

| | |
|---|---|
| **Estado** | Aceptada |
| **Fecha** | Junio 2026 |
| **Autor** | Founder |
| **Producto** | Stay (candidato a patrón de Framework) |

## Contexto / Pregunta

¿Cuánto control operativo toma Stay por defecto? ¿Las Business Rules ejecutan acciones sobre
el hotel automáticamente, o sugieren?

## Decisión

Por defecto, las **Business Rules generan decisiones o recomendaciones**, pero **no sustituyen
la decisión operativa del hotel**:

- Las **Rules** determinan **qué debería ocurrir**.
- Los **Engines** ejecutan esa lógica.
- **Stay propone** acciones cuando corresponde.
- El **hotel conserva el control operativo**, salvo aquellas **automatizaciones que configure
  explícitamente** (opt-in).

## Justificación

- **Reduce el riesgo** de acciones automáticas no deseadas sobre la operación del hotel.
- **Genera confianza** (el hotel manda; Stay asiste).
- Deja abierta la puerta a una **automatización progresiva** en versiones futuras: a medida que
  el hotel gana confianza, habilita más automatizaciones.

## Impacto

- `07 Business Rules`: cada regla produce, por defecto, una **recomendación/acción propuesta**;
  la ejecución automática es **opt-in por propiedad**.
- Habilita un modelo de **niveles de automatización** a futuro (sugerir → asistir → automatizar).
- Candidato a patrón de Framework (Regla del Tres) para productos RUN72 que operan sobre sistemas de terceros.
