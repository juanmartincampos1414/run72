# Radar de IA (CESSI) — Relevamiento para copiar y mejorar

> Fuente: https://radaria.appcenter.ar/ · "Radar de IA para Empresas" del Espacio de Innovación con IA de CESSI.
> Objetivo: construir **nuestro propio radar** para que un potencial cliente entienda dónde está parado en IA **antes de una call** con RUN72.
> Capturé el modelo completo (flujo + 28 preguntas + dimensiones + lógica de resultado) desde el código de la app, no solo screenshots.

---

## 1. Qué es y cómo se posiciona

- **Promesa:** "En 10 minutos, sepa en qué estadio está su organización —uso, adopción, innovación o reinvención con IA— y qué hacer en los próximos 90 días."
- **Tono:** sobrio, institucional, "es una foto para trabajar", **sin ranking ni certificación**.
- **Definición de IA (acotada):** asistentes conversacionales, generación de texto/imágenes, lectura de documentos/imágenes, pronósticos automáticos y funciones de IA de sistemas que ya se usan. **No cuenta** la automatización con reglas fijas (macros).
- **Diseño:** minimalista, blanco/negro + amarillo de acento. Mucho aire, tipografía grande.

---

## 2. Flujo completo (pantalla por pantalla)

1. **Portada** — título, promesa, 3 sellos ("Unos 10 minutos", "Puede pausar y retomar", "Sin ranking ni certificación"), caja "Qué es IA en este radar", CTA **Comenzar**, link "Cómo funciona el Radar", y "Retomar donde lo dejé".
2. **Antes de empezar** — metodología + bloque **"Cómo usamos sus datos"** (6 aclaraciones: Quién / Para qué / Qué se publica / Qué no se hace / Qué se pide / Sus derechos) + **gate de datos**: Nombre y apellido, Correo (recomiendan corporativo), **checkbox de consentimiento**, 2 opt-ins (recibir informe; que CESSI lo contacte con el ecosistema) y leyenda legal (Ley 25.326).
3. **Verificar correo** — **código OTP de 6 dígitos** enviado por mail.
4. **Sobre su organización** — "Cuatro datos y una pregunta de uso":
   - **Sector** (17 opciones; internamente etiquetadas con CIIU, grupo y flag "regulado").
   - **Tamaño** (1-9 / 10-49 / 50-199 / 200-999 / 1000+).
   - **Rol** (máxima autoridad / dirección de área / jefatura / analista / otro).
   - **Área** (11 opciones).
   - **Por quién responde** (toda la organización / mi área).
   - **Uso semanal de IA** (Nadie / <25% / 25-50% / 50-75% / >75% / No lo sé).
   - *Nota de branching:* si el sector es "Tecnología y software" muestra un aviso ("existe la autoevaluación de la industria; siga si se parece más a un cliente que a un proveedor").
5. **Cuestionario** — **7 bloques** ("Bloque n de 7", "Cuatro preguntas · menos de dos minutos", botón Empezar). Cada pregunta:
   - Consigna fija **"Cómo elegir"**: *"Las opciones van de menos a más: elija la más alta que se cumpla por completo… ante la duda entre dos, elija la más baja."*
   - Enunciado + **4 opciones (menos → más)** + **"No lo sé"** (máximo 1 por dimensión y 4 en total).
   - Contador global **"Pregunta n de 28"**.
6. **Checkpoint** (a la mitad) — *"Ya completó más de la mitad. Faltan unos 5 minutos… Su avance está guardado."*
7. **Ambición** (opcional, "última pregunta") — a qué estadio apunta la organización.
8. **Perfil final** — "Un poco más sobre su organización" (provincia; incluye tabla de topes de venta MiPyME por sector).
9. **Organización** (último paso) — nombre (sin S.A./S.R.L.) y **CUIT** (11 dígitos, con validación de dígito verificador). Botón **"Ver mi resultado"**.
10. **Resultado** — ver sección 6.

---

## 3. El modelo: estadios, niveles y dimensiones

### Estadios (el "camino de la IA")
1. **Sin uso todavía** — nadie usa IA de forma habitual.
2. **Uso de IA** — la gente usa IA en tareas, pero sin incorporarla sistemáticamente.
3. **Adopción de IA** — la organización trabaja distinto puertas adentro (procesos, roles, datos, reglas, medición).
4. **Innovación con IA** — la lleva afuera: rediseña procesos de punta a punta con clientes/proveedores y crea valor nuevo con método (prueba, invierte, escala).
5. **Reinvención con IA** — la IA está en el núcleo de cómo decide, opera y crea valor.

### Niveles por dimensión (N1–N4)
- **N1 Exploración** · **N2 Piloto** · **N3 Adopción sistemática** · **N4 Transformación**

### Dimensiones (orden de bloques: PO → CO → DT → PC → GR → ES → IN)
6 dimensiones puntúan el radar + 1 **Índice de Innovación** aparte:

| Cód | Dimensión | Qué mide |
|-----|-----------|----------|
| **PO** | Procesos y Operaciones | Dónde está la IA en el día a día, cómo se automatiza, cómo se controla y si el proceso cambia o solo suma la herramienta |
| **CO** | Clientes y Oferta | Cómo la IA llega al cliente: atención, ventas y marketing, productos/servicios, decisiones comerciales |
| **DT** | Datos y Tecnología | Sistemas, información del negocio, herramientas de IA y conocimiento organizacional como base |
| **PC** | Personas y Cultura | Quién impulsa, cómo se forma la gente, cómo cambian los puestos y cómo se gestiona el cambio |
| **GR** | Gobernanza, Riesgo y Cumplimiento | Reglas de uso, protección de datos, gestión de riesgos y transparencia |
| **ES** | Estrategia y Liderazgo | Si la dirección conduce la adopción con agenda, prioridades, inversión y medición |
| **IN** | Índice de Innovación (fuera del radar) | Experimentación, recursos, escalado y ecosistema |

> **Transición CO:** "Cuando decimos clientes incluimos pacientes, alumnos, vecinos, asociados o beneficiarios, según su organización."

---

## 4. Las 28 preguntas (completas, con sus 4 opciones N1→N4)

### PO · Procesos y Operaciones
**PO.1 ¿Dónde está la IA en el trabajo diario?** _(ayuda: elija hasta dónde llegó, aunque no sea en la mayoría de las áreas)_
1. No se usa, o solo en tareas individuales y aisladas (redactar, resumir, buscar información).
2. En procesos de una o dos áreas, a prueba o ya de forma habitual.
3. Integrada a procesos clave de varias áreas, con una forma de trabajo definida.
4. La IA está en los procesos principales de todas las áreas, como forma habitual de trabajo.

**PO.2 ¿Cómo se automatizan los procesos?** _(ayuda: agente de IA = herramienta que no solo responde, ejecuta tareas completas con supervisión)_
1. Procesos manuales, o automatizados sin IA.
2. Algunas automatizaciones con IA, sueltas o a prueba.
3. Algunos procesos clave ya funcionan automatizados con IA.
4. Además, agentes de IA ejecutan tareas completas en procesos enteros, con supervisión.

**PO.3 ¿Cómo se controla la calidad de lo que produce la IA?**
1. Todavía no se usa IA, o depende del criterio de cada persona.
2. Se revisa cuando el resultado es importante.
3. Reglas claras de revisión: qué se verifica, quién y cómo, según el riesgo.
4. Verificación sistemática (controles automáticos y revisión experta donde importa) como estándar.

**PO.4 ¿Qué pasa con el proceso cuando se incorpora IA?**
1. Se suma la herramienta al proceso de siempre, o todavía no se incorporó IA.
2. Se ajustan algunas tareas, sin revisar el proceso.
3. Se revisa el proceso completo: qué hace la IA, qué hace la persona y qué tareas se eliminan.
4. Además, se rediseñan procesos completos de principio a fin, aunque crucen varias áreas.

### CO · Clientes y Oferta
**CO.1 ¿Cómo se usa la IA en la atención y la experiencia del cliente?**
1. No se usa.
2. En algún canal o tipo de consulta (por ejemplo, un asistente que responde mensajes).
3. En los canales principales de atención, con su efecto medido (tiempos o satisfacción).
4. Además, la atención se adapta a cada cliente y se adelanta a lo que necesita.

**CO.2 ¿Cómo se usa la IA para llegar a clientes (ventas, marketing, comunicación)?**
1. No se usa.
2. Apoyo puntual a contenidos, campañas o propuestas.
3. Integrada a la forma de captar y seguir a clientes, con resultados medidos.
4. Además, ayuda a decidir a quién ofrecer o comunicar, qué y en qué momento.

**CO.3 ¿La IA cambió los productos o servicios que ofrece la organización?**
1. No cambió la oferta.
2. Se está probando una mejora con IA en algún producto/servicio, todavía sin lanzar.
3. Al menos un producto o servicio mejorado o nuevo gracias a la IA.
4. Además, hay nuevos servicios o líneas de negocio que no existirían sin la IA.

**CO.4 ¿Cómo se toman las decisiones sobre demanda, oferta, precios o capacidad?**
1. Por experiencia e intuición.
2. Con reportes históricos.
3. Con pronósticos automáticos en las decisiones clave (demanda, abandono, precios).
4. Además, esas decisiones se apoyan de forma continua en IA y se revisan por sus resultados.

### DT · Datos y Tecnología
**DT.1 ¿Cómo están los sistemas centrales de la organización?**
1. Planillas, papel y sistemas aislados.
2. Sistema de gestión (facturación, ERP u otro), pero con información dispersa entre áreas.
3. Sistemas integrados: la información fluye entre áreas y está disponible cuando se necesita.
4. Además, se pueden sumar herramientas de IA a los sistemas de forma segura y sin rehacerlos.

**DT.2 ¿Qué tan confiable y disponible es la información del negocio?**
1. Dispersa en planillas y sistemas; nadie sabe cuánto confiar en ella.
2. Ordenada para algunos usos puntuales, sin responsables ni control de calidad.
3. Tiene responsables y calidad controlada, y está disponible para quien la necesita.
4. Además, las decisiones importantes se toman habitualmente con esa información.

**DT.3 ¿Con qué herramientas de IA se trabaja?**
1. No se usan, o solo cuentas personales sueltas, sin criterio común.
2. Licencias pagas o de prueba para algunas personas, sin gestión común.
3. Herramientas corporativas definidas, con accesos, seguridad y datos gestionados.
4. Además, herramientas de IA integradas a los sistemas, con reglas de uso y capacidad de crecer.

**DT.4 ¿Dónde vive el conocimiento de la organización?**
1. En la cabeza de las personas.
2. En documentación parcial y dispersa.
3. Documentado, ordenado y fácil de encontrar.
4. Además, alimenta asistentes de IA que responden consultas del equipo.

### PC · Personas y Cultura
**PC.1 ¿Quién impulsa el uso de IA?**
1. Nadie en particular, o entusiastas por iniciativa propia.
2. Referentes reconocidos de manera informal.
3. Un modelo definido: responsables por área o un equipo dedicado.
4. Además, impulsar la IA forma parte de los objetivos de cada jefatura.

**PC.2 ¿Cómo se forma la gente en IA?**
1. No hay formación; quien quiere aprende por su cuenta.
2. Capacitaciones puntuales cuando aparece una necesidad.
3. Programa de formación continua, adaptado a cada tipo de puesto.
4. Además, hay tiempo asignado para practicar y se comparten los aprendizajes.

**PC.3 ¿Cómo cambiaron las tareas y los puestos?**
1. No cambiaron.
2. Algunas tareas se aceleraron, sin rediseñar los puestos.
3. Puestos ajustados: más supervisión, criterio y análisis; menos tareas repetitivas.
4. Además, cambió la organización del trabajo: equipos, funciones o perfiles.

**PC.4 ¿Cómo se gestiona el cambio y la confianza del equipo?**
1. No se habla del tema: conviven entusiasmo, temor y desconfianza.
2. Se comunica, pero sin un plan sostenido.
3. Plan de gestión del cambio activo, con participación y espacio para dudas.
4. Además, los equipos proponen y lideran los cambios en su forma de trabajar.

### GR · Gobernanza, Riesgo y Cumplimiento
**GR.1 ¿Qué reglas existen para el uso de IA?**
1. No hay reglas explícitas; el uso es informal o silencioso.
2. Lineamientos mínimos comunicados.
3. Política vigente, conocida y aplicada, con excepciones gestionadas.
4. Además, su cumplimiento se revisa y se puede demostrar ante clientes o reguladores.

**GR.2 ¿Cómo se protegen los datos personales y confidenciales frente a la IA?**
1. No se evalúa qué datos se exponen.
2. Restricciones básicas (qué no se puede cargar).
3. Controles técnicos y contractuales: datos protegidos, acuerdos con proveedores, accesos.
4. Además, cada nuevo uso de IA se evalúa en privacidad y seguridad antes de ponerlo en marcha.

**GR.3 ¿Cómo se gestionan los riesgos de la IA (errores, sesgos, dependencia)?**
1. No hay mapa de riesgos de IA.
2. Riesgos identificados, sin plan de acción.
3. Riesgos principales con responsable y medidas (revisión humana en decisiones sensibles).
4. Además, se revisan periódicamente junto con los demás riesgos.

**GR.4 ¿Cómo se informa a clientes cuando interviene la IA?**
1. No se informa.
2. En casos puntuales, cuando alguien pregunta.
3. Criterios definidos de transparencia y cómo pedir revisión humana.
4. Además, esos criterios son públicos y se controla que se cumplan.

### ES · Estrategia y Liderazgo
**ES.1 ¿Qué lugar ocupa la IA en la agenda de la dirección?**
1. Se sigue con interés, pero no hay agenda formal.
2. Hay un directivo que impulsa iniciativas puntuales.
3. Es prioridad formal del año, con responsable y recursos.
4. Además, orienta las decisiones centrales (qué se ofrece, cómo se opera, dónde se invierte).

**ES.2 ¿Cómo se decide dónde aplicar IA?**
1. No se aplica, o cada área prueba por su cuenta sin criterio común.
2. Se aprueban casos puntuales, uno por uno.
3. Se priorizan con criterios explícitos (impacto, esfuerzo, riesgo) y caso de negocio simple.
4. Además, la lista de iniciativas se revisa y reordena según resultados.

**ES.3 ¿Cómo se gestiona la inversión en IA?**
1. No hay presupuesto; se usa lo gratuito o lo que cada uno paga.
2. Gastos puntuales o presupuesto, sin seguimiento de lo que se obtiene.
3. Presupuesto con seguimiento de costos y beneficios por iniciativa.
4. Además, se decide junto con las demás inversiones, según resultados.

**ES.4 ¿Cómo se mide el impacto de la IA en los resultados?**
1. No se mide.
2. Se mide el uso (quién usa qué).
3. Se miden ahorros de tiempo/costos o mejoras de calidad en las iniciativas principales.
4. Además, se mide su efecto en resultados generales (ventas, satisfacción, metas).

### IN · Índice de Innovación (fuera del radar)
**IN.1 ¿Cómo experimenta la organización con IA?**
1. No se hacen pruebas.
2. Pruebas aisladas cuando surge una oportunidad.
3. Programa de pruebas/pilotos con cadencia y criterios de éxito.
4. Además, siempre hay varias pruebas en curso y se revisan juntas para priorizar.

**IN.2 ¿Qué recursos hay para innovar con IA?**
1. Nadie dedica tiempo ni presupuesto.
2. Algunas personas le dedican tiempo quitándolo a la operación.
3. Tiempo o presupuesto asignados y protegidos para explorar.
4. Además, al menos una persona con tiempo dedicado y metas propias.

**IN.3 ¿Qué pasa con las ideas que funcionan?**
1. No hay pruebas, o no pasan de la prueba.
2. Algunas se implementan, sin proceso claro.
3. Forma definida de extender lo que funciona y cortar lo que no.
4. Además, se registra cuántas pruebas llegan a la operación y se trabaja para que sean más.

**IN.4 ¿Cómo innova junto con otros (clientes, proveedores, socios, universidades, reguladores)?**
1. No innova con otros; todo puertas adentro.
2. Contactos ocasionales cuando aparece una necesidad.
3. Proyectos con IA junto a clientes/proveedores/socios, elegidos con criterio.
4. Además, con ellos rediseñaron procesos completos que empiezan o terminan afuera.

---

## 5. Lógica de puntaje (cómo arma el resultado)

- Cada **dimensión** se puntúa **N1–N4** a partir de sus 4 preguntas.
- **Estadio "Adopción": "la dimensión más baja manda"** → se gatilla por el **mínimo** de las 6 dimensiones (es un piso, no un promedio).
- **Estadio "Uso"**: sale de la pregunta de **% de uso semanal**.
- **Estadio "Innovación"**: requiere **Clientes (CO) en Nn** + **Índice de Innovación (IN) ≥ 3.0**.
- **Estadio "Reinvención"**: **IN > 3.5**.
- **"No lo sé"**: limitado (1 por dimensión, 4 total). Si se usó, el resultado se marca como "estimado".

---

## 6. La pantalla de resultado (qué muestra)

- **Estadio** alcanzado ("Su resultado · el camino de la IA") con una marca de "objetivo".
- **Arquetipo** ("Su arquetipo") + arquetipos secundarios ("También: …").
- **Perfil en seis dimensiones** (radar) con un **trazo de rayas = nivel mínimo por dimensión para llegar al objetivo**. Opción "Ver qué significa cada nivel".
- **Índice de Innovación (IN)**: "{IN} de 4", va por fuera del radar (objetivo: 3.0 innovación / >3.5 reinvención).
- **Tres movidas para los próximos 90 días** — por dimensión "de N{desde} a N{hasta}", cada una con: **Responsable sugerido · Indicador · Resultado esperado a 90 días**. Son "recomendaciones de base" (adaptables); con salvedad para sectores regulados.
- **Siguiente paso en las demás dimensiones**.
- **Su ambición** (si la cargó).
- **Comparar con otras organizaciones**: Todas / Mi sector / Mi tamaño / Mi tipo (promedio con n ≥ 5).
- **Dónde seguir** + pie institucional.

---

## 7. Qué copiar y qué MEJORAR para la versión RUN72

La base conceptual es muy buena (estadios + 6 dimensiones + rúbrica N1-N4 + movidas 90 días). Pero CESSI es un **índice sectorial anónimo**; nosotros queremos un **imán de leads que caliente la call**. Cambios propuestos:

**Posicionamiento**
- No "medición sectorial anónima" sino **"diagnóstico accionable + qué haría RUN72 con vos"**. El resultado debe empujar a la call.
- Protagonista: **Runit** hace el diagnóstico (conversacional o guiado, con su estética midnight/violeta). Diferencia total vs. el formulario sobrio de CESSI.

**Menos fricción (clave para pre-call)**
- **Sacar el gate de datos + OTP del principio.** Mostrar valor primero; pedir email **al final**, para "recibir el informe + agendar la call". Nada de CUIT ni verificación por código.
- **Acortar**: de 28 a ~10-14 preguntas (1-2 por dimensión) para terminar en <5 min. Mantener la escala "menos→más" (es excelente).
- Mobile-first, instantáneo, sin "pausar/retomar" (no hace falta si es corto).

**Resultado orientado a venta**
- Cada **dimensión floja → un servicio RUN72**: PO bajo → **automatizaciones/agentes**; CO bajo → **web + marketing con IA**; DT bajo → **datos/plataforma**; PC bajo → **formación/implementación**; ES/GR → **consultoría/estrategia**.
- "Tres movidas 90 días" → reframe como **"qué arrancamos en las primeras 72h / primera etapa"** + CTA **"Agendá la call"** y **"Cotizá"**.
- Enviar el resultado **automáticamente a RUN72** (como ya hacemos con `meeting_requests`) para que ventas llegue a la call con contexto. Guardar en Supabase.

**Producto / integración**
- Vive en run72.app (ej. `/radar`), con el stack actual (Next + Supabase + Resend).
- Opcional: **benchmark** "empresas como la tuya" (cuando tengamos volumen) como prueba social.
- Branding RUN72: dark, degradé cyan→indigo→violeta, Runit guía.

**Qué conservar tal cual**
- La **consigna "elija la más alta que se cumpla por completo; ante la duda, la más baja"**.
- La **rúbrica N1-N4** y la lógica **"la dimensión más baja manda"** (foco en el cuello de botella).
- La **definición acotada de IA** (excluye macros).
- El **radar de dimensiones con objetivo (trazo de rayas)** — visualmente potente.

---

## 8. Pendiente / siguiente paso

- No completé las 28 pantallas en vivo (capturé el modelo del source, que es más completo). Si querés **ver la pantalla de resultado real** (diseño del radar + movidas), puedo terminar el cuestionario y mandarte screenshots.
- Definir **alcance v1** de nuestro radar (cantidad de preguntas, conversacional vs. guiado, dónde vive) y lo armo.

---

## 9. Resultado REAL (completé el cuestionario)

Respondí las 28 en **nivel 3** (perfil parejo, caso realista de PyME madura). El resultado:

- **URL propia y compartible del resultado:** `/resultado/{id}` (cada diagnóstico queda guardado en una página).
- **Estadio: "Innovación con IA"** (porque las 6 dimensiones dan N3 → Adopción N3, + Clientes N3 + IN 3.0 → Innovación). El marcador **"OBJETIVO"** quedó en Reinvención.
- **Indicadores arriba (3 tiles):** USO "Más del 75% usa IA cada semana" · ADOPCIÓN "N3 — la dimensión más baja manda" · INNOVACIÓN "3.0 — Clientes en N3, innova desde IN 3.0".
- **Arquetipo:** "Perfil parejo en N3" + frase de próxima jugada ("…está en Estrategia y Liderazgo").
- **Radar hexagonal** de las 6 dimensiones (todas N3), relleno amarillo, con escala 1-4.
- **Índice de Innovación** como barra aparte: "3.0 de 4".
- **Lista de dimensiones** con dots de nivel (▪▪▪▫ N3 · Adopción sistemática).
- **Tres movidas 90 días** (tarjetas numeradas): cada una con título "DIMENSIÓN · DE N3 A N4", descripción, y 3 campos: **Responsable sugerido · Indicador · Resultado esperado a 90 días**, + link a **"Guía de una página (PDF · 1 página)"** por dimensión. La 3ª movida es siempre **"Medir antes de empezar"** (definir línea de base).
- **Siguiente paso en las demás dimensiones** (lista con el salto N3→N4 de cada una).
- **Su ambición:** como apunté al mismo estadio, dice "ya está en el estadio al que apunta: el foco es consolidarlo".
- **Comparación con otras organizaciones:** bloqueada ("se habilita cuando respondan al menos 10 organizaciones, y 5 por grupo; se la enviaremos por email").
- **Dónde seguir:** biblioteca de **guías de 1 página en PDF, una por dimensión**, marcando las prioritarias ("Su prioridad").

### Observaciones de diseño del resultado (para nuestra versión)
- Output largo y denso, muy "consultoría". Bueno para credibilidad; para pre-call conviene **acortar y rematar con CTA**.
- La **página de resultado con URL propia** es ideal para compartir internamente y para que ventas la vea antes de la call. **Copiamos eso.**
- Las **guías PDF por dimensión** son un buen gancho de valor. Nuestra versión: PDF con branding RUN72 + "cómo lo hacemos nosotros en 72h".
- Lo que falta (y es nuestra oportunidad): **ningún CTA comercial**. En nuestra versión, cada movida → servicio RUN72 + botón "Agendá la call / Cotizá".
