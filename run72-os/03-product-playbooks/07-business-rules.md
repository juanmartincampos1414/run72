# 07 — Business Rules Playbook

| | |
|---|---|
| **Producto** | Framework (aplica a todos) |
| **Documento** | Business Rules Playbook |
| **Versión** | v0.1 |
| **Estado** | Draft |
| **Owner** | RUN72 |
| **Última actualización** | Junio 2026 |

> Etapa 07. Acá vive **toda la lógica de decisión** (AD-003): los Engines la **ejecutan**, las
> reglas la **deciden**. Las reglas se expresan de forma **declarativa** (condición → resultado)
> y **configurable por cliente** (cada propiedad puede ajustar umbrales).

## Principio (AD-004): proponer por defecto

Las Business Rules **proponen** decisiones/recomendaciones; **no sustituyen** la decisión
operativa del cliente. La ejecución automática es **opt-in**. Esto reduce riesgo y habilita
**automatización progresiva** (sugerir → asistir → automatizar).

## 1. Objetivo
Definir, antes de desarrollar, todas las reglas: transiciones de estado, qué puede hacer cada
actor, restricciones, automatizaciones y qué eventos disparan qué.

> Pregunta única: **"¿Qué decide el sistema, bajo qué condiciones, y qué dispara?"**

## 2. ¿Por qué existe?
- Saca la lógica de los Engines (que quedan simples y deterministas).
- Permite versionar y configurar reglas sin tocar el código de los Engines.
- Evita desarrollar sobre supuestos: las reglas se acuerdan antes.

## 3. Entradas
- `04 Journey Map`, `05 Product Engines`, `06 Core Entities` **FROZEN**.

## 4. Cómo expresar una regla
`CUANDO <evento/condición> [Y <condición>] ENTONCES <resultado: transición / acción / evento>`.
Cada regla indica: **disparador · condición · resultado · parámetros configurables · actor**.

## 5. Cómo ejecutar
1. Tomar cada transición del Lifecycle → escribir su regla.
2. Agregar reglas de incentivos, beneficios, consentimiento, atribución, guardrails.
3. Marcar **parámetros configurables** (umbrales) y los que se **validan en el piloto**.
4. Marcar las **decisiones de negocio del Founder** (montos, incentivos, ventanas).
5. Revisión del Founder.

## 6. Entregables
`07 Business Rules`: catálogo de reglas declarativas + tabla de parámetros configurables.

## 7. Salidas
Habilita `08 API & Ecosystem Strategy`.

## 8. Errores Frecuentes
- Esconder reglas dentro de un Engine.
- Hardcodear umbrales en vez de hacerlos configurables por propiedad.
- Reglas ambiguas (sin disparador o sin resultado claro).

## 9–12. DoR / DoD / Freeze
- DoR: etapas 04/05/06 FROZEN.
- DoD: toda transición del Lifecycle tiene regla; parámetros marcados; decisiones del Founder resueltas o marcadas.
- Freeze: aprobado por el Founder · sin lógica fuera de acá · encabezado + estado + versión.
