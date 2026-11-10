# Architectural Watches — RUN72

> Preguntas arquitectónicas **abiertas a propósito**. No se responden hoy: se **observan**.
> Cuando la evidencia se acumule (Regla del Tres, o una necesidad concreta de un 2º producto),
> se convierten en una Architecture Decision. Registrarlas evita decidir antes de tiempo — y
> evita olvidarlas.

| # | Watch | Estado | Origen |
|---|---|---|---|
| **AW-001** | **¿`Relationship` pertenece a Stay, o terminará siendo un componente compartido de RUN72?** El aggregate nació en Stay (Domain Model §6.2), pero al construirlo apareció como un activo que cualquier producto con vínculo persona↔organización podría necesitar (igual que Guest, Timeline o el Runtime dejaron de ser de un producto). **No mover hoy.** Observar: si un 2º producto necesita modelar la evolución de una relación, promover `Relationship` + Lifecycle Engine a Shared Package (Regla del Tres). | 🔭 Observando | Founder, tras Story 2.1 (2026-07-05) |

---

## Cómo se resuelve un Watch

1. Aparece un segundo (idealmente tercer) caso real que necesita lo mismo.
2. Se evalúa: ¿el patrón es genuinamente compartido o es coincidencia?
3. Si es compartido → se promueve a Shared Package/Runtime + se abre la AD correspondiente.
4. El Watch se cierra apuntando a la AD que lo resolvió.
