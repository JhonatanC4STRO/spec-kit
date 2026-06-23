# Feature Specification: Generación de Bracket del Torneo

**Feature Branch**: `004-generar-bracket-torneo`

**Created**: 2026-06-20

**Status**: Draft

**Input**: User description: "El administrador puede generar el bracket de cada juego una vez cerradas las inscripciones. FC 25 usa single-elimination, Call of Duty usa double-elimination. Los jugadores se asignan aleatoriamente a las posiciones del bracket. Una vez generado no se puede modificar la estructura."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generar el bracket de un juego (Priority: P1)

Admin genera el bracket de un juego una vez cerradas las inscripciones, con los
jugadores asignados aleatoriamente a las posiciones, usando el formato de
eliminación correspondiente a ese juego.

**Why this priority**: Es el propósito central de la feature; sin esto no hay
manera de organizar las llaves del torneo.

**Independent Test**: Cerrar inscripciones con jugadores ya inscritos en un
juego, generar su bracket y verificar que todos los jugadores quedan asignados
a una posición con el formato correcto (single o double elimination).

**Acceptance Scenarios**:

1. **Given** inscripciones cerradas y jugadores inscritos en FC 25, **When**
   admin genera el bracket de FC 25, **Then** sistema crea un bracket de
   eliminación simple con todos los jugadores asignados aleatoriamente a una
   posición.
2. **Given** inscripciones cerradas y jugadores inscritos en Call of Duty Black
   Ops 2, **When** admin genera su bracket, **Then** sistema crea un bracket de
   doble eliminación con todos los jugadores asignados aleatoriamente a una
   posición.

---

### User Story 2 - Bloqueo de generación con inscripciones abiertas (Priority: P2)

Sistema impide generar el bracket de un juego mientras las inscripciones siguen
abiertas, para evitar dejar fuera a jugadores que aún pueden inscribirse.

**Why this priority**: Evita brackets incompletos o inválidos; es una guarda
necesaria antes de habilitar la generación real.

**Independent Test**: Con inscripciones abiertas, intentar generar el bracket de
un juego y verificar que el sistema lo rechaza sin crear estructura alguna.

**Acceptance Scenarios**:

1. **Given** inscripciones abiertas, **When** admin intenta generar el bracket
   de cualquier juego, **Then** sistema rechaza la acción y no crea ningún
   bracket.

---

### User Story 3 - Inmutabilidad del bracket generado (Priority: P3)

Una vez generado el bracket de un juego, su estructura no puede modificarse ni
regenerarse.

**Why this priority**: Garantiza la integridad del torneo una vez que las
llaves quedaron definidas y comunicadas a los participantes.

**Independent Test**: Generar el bracket de un juego e intentar generarlo de
nuevo o alterar sus emparejamientos, verificando que el sistema lo rechaza.

**Acceptance Scenarios**:

1. **Given** un bracket ya generado para un juego, **When** admin intenta
   generarlo de nuevo, **Then** sistema rechaza la acción indicando que ya
   existe un bracket para ese juego.

---

### Edge Cases

- ¿Qué pasa si un juego tiene menos de 2 jugadores inscritos al cerrar las
  inscripciones? Sistema rechaza la generación del bracket de ese juego e
  indica que falta cantidad mínima de jugadores.
- ¿Qué pasa si la cantidad de jugadores inscritos no es potencia de 2? Sistema
  completa las posiciones faltantes con "bye" asignados aleatoriamente, dando
  avance automático de primera ronda a quien le toque.
- ¿Qué pasa si se intenta generar el bracket de un juego que ya tiene uno
  generado? Sistema rechaza la acción, el bracket existente no se altera.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema MUST permitir al admin generar el bracket de un juego
  únicamente cuando las inscripciones estén cerradas.
- **FR-002**: Sistema MUST generar el bracket de FC 25 con formato de
  eliminación simple (single-elimination).
- **FR-003**: Sistema MUST generar el bracket de Call of Duty Black Ops 2 con
  formato de doble eliminación (double-elimination).
- **FR-004**: Sistema MUST asignar a los jugadores inscritos a las posiciones
  del bracket de forma aleatoria.
- **FR-005**: Sistema MUST requerir un mínimo de 2 jugadores inscritos en el
  juego para poder generar su bracket, rechazando la generación si no se
  cumple.
- **FR-006**: Cuando el número de jugadores inscritos no sea potencia de 2,
  sistema MUST completar las posiciones faltantes con "bye" asignados
  aleatoriamente, otorgando avance automático de primera ronda a quien
  corresponda.
- **FR-007**: Una vez generado el bracket de un juego, sistema MUST impedir
  cualquier modificación posterior de su estructura (emparejamientos y
  posiciones).
- **FR-008**: Sistema MUST rechazar un nuevo intento de generación de bracket
  para un juego que ya tiene uno generado.

### Key Entities *(include if feature involves data)*

- **Bracket**: juego al que pertenece, formato (single-elimination o
  double-elimination), fecha/hora de generación, estado inmutable tras su
  creación.
- **Posición de Bracket**: jugador asignado (o "bye"), ronda y lugar dentro del
  cuadro al que pertenece.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin genera el bracket de un juego en menos de 10 segundos desde
  que confirma la acción.
- **SC-002**: El 100% de los jugadores inscritos en un juego queda asignado a
  una posición del bracket generado.
- **SC-003**: El 100% de los intentos de generar un bracket con inscripciones
  abiertas son rechazados sin crear estructura parcial.
- **SC-004**: El 100% de los intentos de modificar o regenerar un bracket ya
  generado son rechazados.

## Assumptions

- El cierre de inscripciones es la bandera global ya definida en
  001-inscripcion-torneo; basta con que esté cerrada para habilitar la
  generación del bracket de cualquiera de los dos juegos.
- La distribución de "bye" para completar potencias de 2 es aleatoria, sin
  priorizar a ningún jugador, dado que esta versión no tiene sistema de
  seeding ni ranking.
- Regenerar un bracket desde cero no está soportado en esta versión; si se
  generó por error, su corrección queda fuera de alcance de esta feature.
- El avance de rondas posteriores a la generación (registro de resultados,
  progreso de ganadores) es una feature futura fuera de alcance; esta spec
  cubre únicamente la generación inicial de la estructura.
