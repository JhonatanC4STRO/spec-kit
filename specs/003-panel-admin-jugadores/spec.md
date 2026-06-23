# Feature Specification: Panel Admin de Jugadores Inscritos

**Feature Branch**: `003-panel-admin-jugadores`

**Created**: 2026-06-20

**Status**: Draft

**Input**: User description: "El administrador puede ver el listado completo de jugadores inscritos separados por juego (FC 25 y Call of Duty). Puede ver nombre, nickname y fecha de inscripción. Puede eliminar un jugador antes de generar el bracket. Puede abrir y cerrar las inscripciones."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver listado de jugadores inscritos (Priority: P1)

Admin entra al panel y ve el listado completo de jugadores inscritos, separado
por juego (FC 25 y Call of Duty Black Ops 2), con nombre completo, nickname y
fecha/hora de inscripción de cada uno.

**Why this priority**: Sin visibilidad del listado, el admin no puede gestionar
nada más; es la base de todo el panel.

**Independent Test**: Inscribir jugadores en ambos juegos y verificar que el
panel los muestra separados por juego con sus datos correctos.

**Acceptance Scenarios**:

1. **Given** jugadores inscritos en ambos juegos, **When** admin abre el panel,
   **Then** ve dos listados separados (uno por juego) con nombre, nickname y
   fecha de inscripción de cada jugador.
2. **Given** un juego sin inscriptos, **When** admin abre el panel, **Then** ese
   listado se muestra vacío sin afectar el listado del otro juego.

---

### User Story 2 - Eliminar un jugador inscrito (Priority: P2)

Admin elimina un jugador del listado antes de generar el bracket del torneo.

**Why this priority**: Permite corregir inscripciones erróneas o indebidas antes
de avanzar con la organización del torneo.

**Independent Test**: Eliminar un jugador inscrito y verificar que desaparece
del listado y que su nickname queda libre para una nueva inscripción en ese
juego.

**Acceptance Scenarios**:

1. **Given** un jugador inscrito en el listado, **When** admin lo elimina y
   confirma la acción, **Then** el jugador desaparece del listado de ese juego.
2. **Given** un jugador recién eliminado, **When** alguien se inscribe de nuevo
   con el mismo nickname en el mismo juego, **Then** la inscripción se acepta
   porque el nickname quedó libre.

---

### User Story 3 - Abrir y cerrar inscripciones desde el panel (Priority: P3)

Admin abre o cierra las inscripciones del torneo desde este mismo panel de
gestión.

**Why this priority**: Conveniencia operativa; el control de apertura/cierre ya
existe (especificado en 001-inscripcion-torneo), aquí solo se asegura que sea
accesible desde la vista de jugadores.

**Independent Test**: Cerrar inscripciones desde este panel y verificar que el
formulario público deja de aceptar nuevas inscripciones (comportamiento ya
validado en 001-inscripcion-torneo).

**Acceptance Scenarios**:

1. **Given** inscripciones abiertas, **When** admin las cierra desde este
   panel, **Then** el formulario público pasa a mostrar el mensaje de cierre
   definido en 001-inscripcion-torneo.
2. **Given** inscripciones cerradas, **When** admin las reabre desde este
   panel, **Then** el formulario público vuelve a aceptar inscripciones.

---

### Edge Cases

- ¿Qué pasa si se intenta eliminar un jugador que ya fue eliminado (doble clic)?
  Sistema ignora la segunda solicitud sin mostrar error fatal.
- ¿Qué pasa si se elimina el único jugador inscrito en un juego? El listado de
  ese juego queda vacío; el listado del otro juego no se afecta.
- ¿Qué pasa si admin intenta eliminar un jugador sin confirmar? La eliminación
  no se ejecuta hasta confirmar explícitamente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema MUST mostrar al admin el listado completo de jugadores
  inscritos, separado por juego (FC 25 y Call of Duty Black Ops 2).
- **FR-002**: Para cada jugador inscrito, sistema MUST mostrar nombre completo,
  nickname y fecha/hora de inscripción.
- **FR-003**: Sistema MUST permitir al admin eliminar un jugador inscrito del
  listado.
- **FR-004**: Sistema MUST exigir confirmación explícita del admin antes de
  eliminar un jugador, dado que la acción es irreversible.
- **FR-005**: Tras eliminar un jugador, su nickname MUST quedar disponible para
  una nueva inscripción en ese mismo juego.
- **FR-006**: Sistema MUST exponer en este panel el control de apertura y
  cierre de inscripciones ya definido en 001-inscripcion-torneo, sin alterar su
  comportamiento.
- **FR-007**: Listado MUST reflejar altas (nuevas inscripciones) y bajas
  (eliminaciones) sin pasos adicionales más allá de recargar la vista del
  panel.

### Key Entities *(include if feature involves data)*

- **Jugador Inscrito**: nombre completo, nickname, juego, fecha/hora de
  inscripción (entidad ya definida en 001-inscripcion-torneo; esta feature la
  consume para listar y eliminar).
- **Panel de Gestión**: vista admin que agrupa el listado por juego y los
  controles de eliminación y apertura/cierre de inscripciones.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin ubica y elimina un jugador específico en menos de 30
  segundos desde que abre el panel.
- **SC-002**: El 100% de los jugadores eliminados deja de aparecer en el
  listado y libera su nickname para reinscripción en ese juego.
- **SC-003**: Admin distingue sin ambigüedad a qué juego pertenece cada jugador
  listado (separación 100% clara entre los dos listados).

## Assumptions

- La generación del "bracket" es una feature futura, fuera de alcance de esta
  spec; por ahora el sistema no tiene un estado de "bracket generado" que
  bloquee la eliminación. Cuando se construya esa feature, deberá agregarse la
  regla de bloqueo post-generación mencionada por el usuario.
- El comportamiento de apertura/cierre de inscripciones es el mismo ya
  especificado en 001-inscripcion-torneo; esta feature no introduce un segundo
  mecanismo, solo lo expone en este panel.
- No hay paginación del listado en esta versión, dado el volumen esperado bajo
  de un torneo.
- Eliminar un jugador es una acción irreversible: no existe papelera ni
  recuperación posterior en esta versión.
