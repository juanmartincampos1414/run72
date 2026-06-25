# 01 — Product Discovery Playbook

| | |
|---|---|
| **Producto** | Framework (aplica a todos) |
| **Documento** | Product Discovery Playbook |
| **Versión** | v0.1 |
| **Estado** | Draft |
| **Owner** | RUN72 |
| **Última actualización** | Junio 2026 |

> **Qué es un Playbook.** El POS define *qué* es cada etapa. El Playbook define
> *cómo se ejecuta*. Este es el de la Etapa 01 del Stage Gate. Es genérico y
> reutilizable; su primera aplicación real es **Stay** (Direct Guest Platform).

---

## 1. Objetivo

Entender el problema **tan profundamente** que la solución se vuelva casi obvia.
Discovery no produce pantallas ni features: produce **claridad y convicción** sobre
qué problema resolvemos, para quién, y por qué vale la pena.

> La pregunta única que esta etapa debe dejar respondida:
> **"¿Cuál es el problema crítico, de quién es, y por qué resolverlo crea una categoría?"**

## 2. ¿Por qué existe esta etapa?

- Evita el error más caro de RUN72: **construir la solución equivocada con excelencia**.
- Reduce la incertidumbre antes de invertir en marca, diseño o ingeniería.
- Garantiza que el producto resuelva **un único problema** (Principio 1) y que el
  problema —no la solución— sea el centro (Principio 2).

Si Discovery está mal hecho, **todas las etapas siguientes heredan el error**.

## 3. Entradas

- `01 Product Constitution` (leída).
- `02 Product Operating System` (leído).
- Una **idea** o intuición del Founder sobre un problema y un mercado.
- Acceso a fuentes reales: posibles usuarios, datos, competidores, el dominio.

## 4. Preguntas Obligatorias

Discovery no termina hasta que **todas** estén respondidas con evidencia, no con opinión.

**El problema**
- ¿Cuál es el problema crítico, en una frase?
- ¿Qué tan doloroso es hoy? ¿Cómo lo resuelven actualmente (la alternativa real)?
- ¿Con qué frecuencia ocurre? ¿Cuánto les cuesta (tiempo / plata / riesgo)?

**Las personas**
- ¿Quién **paga**? (ICP — perfil de cliente ideal)
- ¿Quién **usa** el producto? (puede no ser quien paga)
- ¿Quién decide la compra? ¿Quién la bloquea?

**El porqué y la categoría**
- ¿Por qué este producto debe existir?
- ¿Qué **categoría** crea o redefine? (no competimos por features)
- ¿Cuál es el **North Star** (la métrica única que prueba que estamos ganando)?

**Los límites**
- ¿Qué **NO** hace este producto? (tan importante como lo que sí)
- ¿Cuál es el **momento mágico** (el instante en que el usuario "lo entiende")?

**Viabilidad**
- ¿Hay disposición a pagar? ¿Cuánto?
- ¿Por qué RUN72 puede ganar acá? (ventaja: dominio, datos, IA, velocidad, ecosistema)
- ¿Qué tiene que ser cierto para que esto funcione? (supuestos críticos)

## 5. Cómo ejecutar (flujo recomendado)

Discovery es un trabajo de campo corto y enfocado, no un documento de escritorio.

1. **Encuadre (Founder).** El Founder escribe el problema en 1 frase + por qué le
   importa. Sin solución todavía.
2. **Inmersión.** Investigación real: 5–8 conversaciones con usuarios/clientes
   potenciales, mirar cómo resuelven hoy el problema, revisar competidores y datos
   del dominio. Buscamos **patrones de dolor**, no validación de nuestra idea.
3. **Síntesis.** Convertir lo aprendido en respuestas a las Preguntas Obligatorias.
   Donde no haya evidencia, marcarlo como **supuesto a validar** (no inventarlo).
4. **Definición de categoría y North Star.** Nombrar la categoría y elegir la
   métrica única de éxito.
5. **Recorte de alcance.** Escribir explícitamente **qué NO hace** y el momento mágico.
6. **Revisión.** Founder + Product Intelligence revisan. Si una respuesta es débil,
   se vuelve a campo. No se avanza con incertidumbre (Principio 4 del Framework).

> Regla: **una sola pregunta por vez** en las entrevistas; escuchar el problema,
> no pitchear la solución.

## 6. Entregables

Un único documento: **`01 Product Discovery`** dentro de la carpeta del producto
(`05 Products/<producto>/01-product-discovery.md`), con esta estructura:

1. **Problema** (1 frase + contexto + alternativa actual + costo del problema)
2. **ICP y usuarios** (quién paga / quién usa / quién decide)
3. **Por qué existe** + **categoría**
4. **North Star** (métrica única)
5. **Momento mágico**
6. **Qué NO hace** (no-objetivos explícitos)
7. **Supuestos críticos** y cómo se validarán
8. **Por qué RUN72 puede ganar** (ventaja + componentes reutilizables candidatos)
9. **Evidencia** (resumen de entrevistas/datos)

## 7. Salidas

Habilita la Etapa **02 Brand System**. Sin un Discovery FROZEN, Brand System no
puede empezar (Stage Gate, Regla 01).

## 8. Componentes Reutilizables

Antes de imaginar nada nuevo, revisar `04 Shared Components` y `06 Knowledge Library`:
- ¿Algún **Engine** existente aplica? (Auth, Notifications, Campaign, Review, Wallet, NFC, Analytics…)
- ¿Hay **Core Entities** reutilizables del ecosistema? (p. ej. Guest, Product, Staff)
- ¿Hay **Lessons Learned / Patterns** de productos previos (Margin, Tips+) relevantes?

## 9. Errores Frecuentes

- Diseñar pantallas o features durante Discovery. ❌ (Lesson Learned oficial.)
- Validar la propia idea en vez de investigar el problema.
- Confundir "lo que la gente dice" con "lo que la gente hace".
- Dejar el problema vago para "verlo en el camino".
- Inventar el ICP o el willingness-to-pay sin evidencia.
- Querer que el producto resuelva varios problemas a la vez.

## 10. Definition of Ready (para empezar)

- [ ] El Founder enunció el problema en 1 frase.
- [ ] Constitution y POS están leídos por quienes participan.
- [ ] Hay acceso a usuarios/datos reales para investigar.

## 11. Definition of Done (para cerrar)

- [ ] Todas las Preguntas Obligatorias respondidas (con evidencia o supuesto marcado).
- [ ] Documento `01 Product Discovery` completo con las 9 secciones.
- [ ] Categoría y North Star definidos.
- [ ] "Qué NO hace" escrito explícitamente.
- [ ] Supuestos críticos listados con plan de validación.

## 12. Freeze Checklist

- [ ] Founder aprobó el documento.
- [ ] Product Intelligence revisó que no haya saltos de lógica ni huecos de evidencia.
- [ ] No quedan preguntas obligatorias sin responder.
- [ ] El documento tiene encabezado estándar y estado **Frozen** + versión.
- [ ] Cualquier excepción al Framework quedó registrada como Architecture Decision.

---

## Próximo paso: aplicar a Stay

Cuando arranquemos, este Playbook guía el Discovery de **Stay** (Direct Guest
Platform, Core Entity = *Guest*). El entregable vivirá en
`05 Products/stay/01-product-discovery.md` y deberá quedar **FROZEN** antes de
pasar a Brand System.
