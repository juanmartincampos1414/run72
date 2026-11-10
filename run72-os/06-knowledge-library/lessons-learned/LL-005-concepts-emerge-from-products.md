# LL-005 — Los conceptos del ecosistema emergen de los productos

| | |
|---|---|
| **Estado** | Observado — patrón candidato a principio (Regla del Tres holgadamente superada) |
| **Fecha** | 2026-07-05 |
| **Origen** | Founder, tras congelar Moment Taxonomy v1 |

## Observación

Los conceptos más importantes de RUN72 **no se diseñaron top-down**. Nacieron dentro de un
producto, resolviendo una necesidad concreta, y solo entonces se revelaron como compartidos:

```
Producto  →  Necesidad  →  Abstracción  →  Shared Component  →  RUN72 Core
```

Ya ocurrió con **Guest**, **Timeline**, **Event Bus**, **Runtime** — y acaba de ocurrir con
**Moment**. En cada caso el patrón fue idéntico: construir para el producto, ver que la solución
trascendía al producto, promoverla.

## Consecuencia

- **No forzar la abstracción antes de tiempo.** El concepto compartido correcto emerge del uso
  real, no del pizarrón. (Coherente con AD-005: congelar el principio, no los contratos, hasta
  tener 2–3 usos reales.)
- **Sí registrar el candidato temprano** (Architectural Watch, ver `architectural-watches.md`)
  para no olvidarlo cuando aparezca el 2º uso.
- Este patrón **es** el Compound Product System en acción (AD-B008): cada producto no solo
  entrega features — entrega abstracciones que hacen más fácil el siguiente producto.

Se repite lo suficiente como para dejar de ser casualidad. Candidato a Product Principle cuando
un 5º concepto siga el mismo camino.
