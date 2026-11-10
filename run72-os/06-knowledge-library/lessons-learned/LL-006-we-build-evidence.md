# LL-006 — Construimos evidencia, no software

| | |
|---|---|
| **Estado** | Decisión metodológica del Founder — regla en Constitución **Artículo 7** |
| **Fecha** | 2026-07-05 |
| **Origen** | Founder, al reabrir Sprint 2 tras la validación simulada del Dashboard |

## El cambio

Hasta hoy, el pipeline de RUN72 terminaba cuando el software funcionaba:

```
Idea → Arquitectura → Dominio → Build → CI Verde → Sprint Cerrado
```

Desde hoy, cambia definitivamente: el último escalón antes de cerrar ya no es CI verde,
es un **usuario real**.

```
Idea → Arquitectura → Dominio → Build → CI Verde → Usuario Real → Sprint Cerrado
```

## Por qué importa

CI en verde, tests, arquitectura correcta y el dashboard construido demuestran que el
**software funciona** — no que el **producto comunica su valor**. Esas son dos cosas distintas,
y solo la segunda hace que alguien quiera comprar. La evidencia final no la produce el equipo (ni
un modelo simulando ser el usuario): **la produce el usuario real reaccionando al producto.**

> "La evidencia final la produce el gerente, no yo."

## Consecuencia

- **El "Done" de todo sprint incluye una validación con un usuario real** de la hipótesis del
  sprint (Constitución Artículo 7). Hasta entonces el sprint está *construido*, no *cerrado*.
- El producto deja de validarse contra **nuestra opinión** y pasa a validarse contra la
  **reacción de un usuario**.
- Es la contracara de [[LL-005]] y del Artículo 6: no basta con no construir de más (altitud) —
  tampoco se da por demostrado lo que todavía no vio un usuario.

Ya no construimos software. **Construimos evidencia.**

## Software factory vs. AI Native Studio

Una **software factory** puede cerrar el sprint cuando el código pasa CI. Un **AI Native Studio**
no: recién termina cuando **el aprendizaje pasa al sistema**. El producto ya no termina en una
feature — termina en evidencia. Esa diferencia define la identidad de RUN72 más que cualquier
decisión técnica.

Corolario metodológico (validamos roles, no identidades): la validación se hace con un **usuario
en un rol** (ej. "Gerente de Palacio Paz"). La cuenta con la que se loguea es un medio, no el
sujeto de la prueba. Lo que se valida es que el rol entienda el valor.

Segundo corolario — la escalera del interlocutor (no confundir escalones):

```
nosotros  →  usuario de validación  →  cliente  →  mercado
(opinión)    (entiende el valor)       (quiere pagar)  (se repite con clientes reales)
```

Cuando una story pasa el gate, "el producto deja de hablar con nosotros y empieza a hablar con un
**usuario real en el rol para el que fue diseñado**" — todavía **no** con un cliente. Un usuario de
validación demuestra que **entiende** el valor; un cliente demuestra que **quiere pagar**; recién
cuando el aprendizaje se repite con clientes reales el producto empieza a hablar con el **mercado**.
Confundir esos escalones es volver a validar contra nuestra opinión.
