# Feature Specification: Registro de Resultados y Avance de Bracket

**Feature Branch**: `005-registrar-resultados-bracket`

**Created**: 2026-06-20

**Status**: Draft

**Input**: User description: "El administrador puede registrar el resultado de cada partido del bracket: quién ganó, por cuántos puntos, o si hubo empate. El sistema actualiza automáticamente el bracket avanzando al ganador a la siguiente ronda."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar resultado y avanzar al ganador (Priority: P1)

Admin registra el resultado de un partido del bracket (ganador y puntos de cada
jugador) y el sistema avanza automáticamente al ganador a la posición
correspondiente de la siguiente ronda.

**Why this priority**: Es el propósito central de la feature; sin esto el
torneo no puede progresar tras generarse el bracket.

**Independent Test**: Registrar el resultado de un partido con dos jugadores
asignados y verificar que el ganador aparece en la siguiente ronda del bracket.

**Acceptance Scenarios**:

1. **Given** un partido del bracket con sus dos jugadores asignados, **When**
   admin registra el resultado indicando ganador y puntos de cada jugador,
   **Then** sistema guarda el resultado y avanza al ganador a la posición que
   le corresponde en la siguiente ronda.
2. **Given** un bracket de doble eliminación, **When** admin registra el
   resultado de un partido, **Then** el perdedor cae al bracket de perdedores en
   lugar de quedar eliminado del torneo (salvo que ya estuviera en el bracket de
   perdedores).

---

### User Story 2 - Resultado determina el campeón (Priority: P2)

Admin registra el resultado del último partido del bracket y el sistema
determina al campeón del juego.

**Why this priority**: Es el cierre natural del torneo para cada juego; depende
de que el registro de resultados funcione en todas las rondas anteriores.

**Independent Test**: Completar el registro de resultados de todas las rondas
de un bracket y verificar que el sistema identifica un único campeón para ese
juego.

**Acceptance Scenarios**:

1. **Given** un bracket donde solo falta el resultado del partido final,
   **When** admin lo registra, **Then** sistema marca al ganador de ese
   partido como campeón del juego.

---

### Edge Cases

- ¿Qué pasa si se intenta registrar el resultado de un partido cuyas dos
  posiciones aún no tienen jugador asignado (ronda futura no definida)? Sistema
  rechaza el registro.
- ¿Qué pasa con los partidos que ya quedaron resueltos automáticamente por
  "bye" en la generación del bracket? No requieren registro de resultado; el
  avance ya ocurrió en esa instancia.
- ¿Qué pasa si hay empate en un partido de un bracket eliminatorio, donde se
  necesita un ganador único para avanzar? Se resuelve a penales; el ganador de
  penales es quien avanza.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema MUST permitir al admin registrar el resultado de un
  partido del bracket, incluyendo el ganador y los puntos obtenidos por cada
  jugador.
- **FR-002**: Sistema MUST registrar, cuando el marcador en tiempo regular
  termina en empate, una tanda de penales con su resultado, y usar al ganador de
  penales como el ganador del partido a efectos de avance del bracket.
- **FR-003**: Sistema MUST avanzar automáticamente al ganador registrado a la
  posición correspondiente de la siguiente ronda del bracket.
- **FR-004**: En brackets de doble eliminación (Call of Duty Black Ops 2),
  sistema MUST enviar al perdedor de un partido al bracket de perdedores en
  lugar de eliminarlo, salvo que ya estuviera compitiendo en el bracket de
  perdedores, en cuyo caso queda eliminado del torneo.
- **FR-005**: En brackets de eliminación simple (FC 25), sistema MUST eliminar
  del torneo al jugador que pierde cada partido.
- **FR-006**: Sistema MUST impedir registrar el resultado de un partido cuyas
  dos posiciones todavía no tienen jugador asignado.
- **FR-007**: Sistema MUST permitir al admin corregir un resultado ya
  registrado únicamente mientras el ganador de ese partido todavía no haya
  jugado (ni tenga resultado registrado en) su partido siguiente. Sistema MUST
  rechazar la corrección si el ganador ya avanzó y participó en un partido
  posterior.
- **FR-008**: Cuando se registra el resultado del partido final de un bracket,
  sistema MUST identificar al ganador como campeón de ese juego.

### Key Entities *(include if feature involves data)*

- **Partido**: bracket al que pertenece, ronda, jugador A, jugador B (o
  "bye"), puntos de cada jugador, ganador, estado (pendiente/resuelto).
- **Resultado**: puntos por jugador, resultado de penales (si hubo empate en
  tiempo regular), ganador final y fecha/hora de registro, asociado a un
  partido específico.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin registra el resultado de un partido y el sistema avanza al
  ganador en menos de 5 segundos.
- **SC-002**: El 100% de los partidos con resultado registrado muestran al
  ganador correctamente avanzado (siguiente ronda o bracket de perdedores
  según corresponda).
- **SC-003**: El 100% de los partidos sin resultado registrado no permiten que
  el bracket avance más allá de esa ronda.

## Assumptions

- Los partidos resueltos automáticamente por "bye" durante la generación del
  bracket (ver 004-generar-bracket-torneo) no requieren registro de resultado.
- El avance en double-elimination respeta el mecanismo estándar: perder en el
  bracket de ganadores envía al jugador al bracket de perdedores; perder en el
  bracket de perdedores elimina al jugador del torneo.
- Un empate en tiempo regular siempre se resuelve a penales en el mismo
  registro de resultado; el sistema no admite un partido sin ganador final.
- La ventana de corrección de un resultado se cierra en cuanto el ganador de
  ese partido tiene registrado un resultado en su partido siguiente; pasado ese
  punto, corregir el resultado anterior queda fuera de alcance (requeriría
  intervención fuera del producto).
