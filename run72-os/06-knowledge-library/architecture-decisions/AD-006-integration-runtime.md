# AD-006 — Integration Runtime (Connector Platform)

| | |
|---|---|
| **Estado** | Aceptada · build diferido (cuando aparezca el 2º Provider/Producto) |
| **Fecha** | Junio 2026 |
| **Autor** | Founder + CTO review |
| **Ámbito** | Todo RUN72 · complementa AD-005 |

## Contexto

AD-005 (Capability → Connector → Provider) define la forma **estática** de las integraciones.
Pero un ecosistema **multi-provider y multi-producto** necesita una capa **operativa** que el
modelo estático no nombra. Si cada Connector resuelve por su cuenta autenticación, sincronización,
reintentos y normalización, vamos a duplicar los bugs de integración por cada provider × producto.

## Decisión

Crear un **Shared Component transversal: "Connector Platform / Integration Runtime"**. Los
Connectors quedan delgados (contrato + mapping); el runtime resuelve, una sola vez:

1. **Auth & credenciales** — tokens/secretos **por tenant**, OAuth, rotación.
2. **Sincronización & confiabilidad** — webhooks vs polling, **idempotencia**, reintentos,
   dead-letter, reconciliación. (Sobre el bus de eventos ya elegido.)
3. **Normalización / Anti-Corruption Layer** — provider → **Core Entities + Events** (acá viven
   la mayoría de los bugs de integración).
4. **Capability flags / feature detection** — no todo Provider implementa todo el contrato; el
   producto debe **degradar con gracia** ("este provider no soporta X").
5. **Observabilidad** — salud/latencia/errores **por provider**; un connector caído no tira el producto.

## Governance de contratos (clave a 5–10 productos)

- Los **contratos de Connector compartidos** se tratan como **APIs versionadas** (semver +
  deprecación + **contract tests**). Cada producto **fija** una versión.
- El **Capability Catalog** es un artefacto **gobernado a nivel Framework** (única fuente de
  verdad). Un producto nuevo **reutiliza/extiende** el catálogo; no inventa capabilities en paralelo.
- **Congelar el principio, no los contratos:** AD-005 (el principio) puede ser POS; los
  **contratos concretos** quedan Draft→Certified hasta validarse con **≥2–3 providers reales**
  (Regla del Tres). El contrato correcto **emerge del 2º y 3º provider**, no del 1º.

## Las preguntas que guían toda integración (ampliadas)

1. ¿Qué **Capability** del negocio resolvemos?
2. ¿Qué **Connector** la abstrae?
3. ¿Qué **contrato** cumple ese Connector?
4. ¿Qué **Providers** pueden implementarlo?
5. ¿Qué **eventos** produce dentro del ecosistema?
6. ¿Es **read / write / both**? (escribir en un PMS es mucho más riesgoso que leer → reglas de consistencia/ownership.)
7. ¿Cuál es el **failure mode** si el provider cambia o cae, y el producto **degrada con gracia**?

## Riesgo a evitar

No reconstruir un **iPaaS** por orgullo. Para algunas capabilities el "Provider" correcto puede
ser un **agregador** existente (mensajería, pagos, channel managers). Preguntar build-vs-buy por
Connector, sobre todo **antes del PMF**.
