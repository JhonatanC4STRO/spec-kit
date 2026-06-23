# Feature Specification: Formulario Público de Inscripción al Torneo

**Feature Branch**: `001-inscripcion-torneo`

**Created**: 2026-06-20

**Status**: Draft

**Input**: User description: "Formulario público de inscripción al torneo. Cualquier persona puede entrar a la página sin necesidad de cuenta y completar el formulario con: nombre completo, nickname, y elegir el juego al que quiere participar (FC 25 o Call of Duty Black Ops 2). El sistema debe validar que el nickname no esté duplicado dentro del mismo juego, que todos los campos estén completos, y confirmar la inscripción con un mensaje de éxito. El admin puede cerrar las inscripciones desde su panel y cuando estén cerradas el formulario debe mostrar un mensaje indicándolo."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Inscripción exitosa al torneo (Priority: P1)

Cualquier visitante entra a la página pública, completa nombre completo, nickname
y elige uno de los dos juegos disponibles (FC 25 o Call of Duty Black Ops 2), y
recibe confirmación de que su inscripción fue registrada.

**Why this priority**: Es el flujo central de la feature; sin esto no hay producto.

**Independent Test**: Completar el formulario con datos válidos y verificar que
aparece el mensaje de éxito y que la inscripción queda registrada para ese juego.

**Acceptance Scenarios**:

1. **Given** inscripciones abiertas, **When** visitante completa nombre completo,
   nickname único y elige un juego, **Then** sistema confirma la inscripción con
   mensaje de éxito.
2. **Given** inscripciones abiertas, **When** visitante deja algún campo vacío y
   envía el formulario, **Then** sistema rechaza el envío y señala los campos
   faltantes sin registrar la inscripción.

---

### User Story 2 - Prevención de nickname duplicado (Priority: P2)

El sistema impide que dos inscripciones usen el mismo nickname dentro del mismo
juego, evitando confusión de identidad entre participantes.

**Why this priority**: Protege la integridad del torneo; necesario antes de abrir
inscripciones al público.

**Independent Test**: Inscribir un nickname en un juego, luego intentar inscribir
el mismo nickname en el mismo juego y verificar que se rechaza.

**Acceptance Scenarios**:

1. **Given** un nickname ya registrado en "FC 25", **When** otro visitante intenta
   inscribirse con el mismo nickname en "FC 25", **Then** sistema rechaza la
   inscripción indicando que el nickname ya está en uso para ese juego.
2. **Given** un nickname ya registrado en "FC 25", **When** un visitante se
   inscribe con ese mismo nickname en "Call of Duty Black Ops 2", **Then** sistema
   acepta la inscripción porque la unicidad es por juego, no global.

---

### User Story 3 - Cierre de inscripciones por el admin (Priority: P3)

El admin cierra las inscripciones desde su panel y los visitantes que intenten
acceder al formulario público ven un mensaje indicando que las inscripciones
están cerradas en lugar del formulario.

**Why this priority**: Necesario para controlar el ciclo de vida del torneo, pero
el torneo puede lanzarse igualmente sin esta capacidad el primer día.

**Independent Test**: Cerrar inscripciones desde el panel admin y verificar que la
página pública muestra el mensaje de cierre en vez del formulario.

**Acceptance Scenarios**:

1. **Given** inscripciones abiertas, **When** admin cierra las inscripciones desde
   su panel, **Then** la página pública deja de mostrar el formulario y muestra un
   mensaje de "inscripciones cerradas".
2. **Given** inscripciones cerradas, **When** admin las reabre desde su panel,
   **Then** la página pública vuelve a mostrar el formulario normalmente.

---

### Edge Cases

- ¿Qué pasa si el nickname difiere solo en mayúsculas/minúsculas o espacios
  (" Player1" vs "player1")? Se trata como duplicado tras normalizar.
- ¿Qué pasa si el visitante tiene el formulario abierto y el admin cierra las
  inscripciones antes de que envíe? El envío se rechaza y se muestra el mensaje
  de cierre.
- ¿Qué pasa si se intenta inscribir con un juego que no es ninguno de los dos
  disponibles? Sistema rechaza el envío (juego inválido).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema MUST permitir a cualquier visitante acceder al formulario de
  inscripción sin necesidad de cuenta ni autenticación.
- **FR-002**: Formulario MUST solicitar nombre completo, nickname y selección de
  juego, limitado a "FC 25" o "Call of Duty Black Ops 2".
- **FR-003**: Sistema MUST validar que los tres campos (nombre completo, nickname,
  juego) estén completos antes de aceptar la inscripción.
- **FR-004**: Sistema MUST rechazar la inscripción si el nickname ya está
  registrado para el mismo juego, comparando nickname normalizado (sin espacios al
  borde, insensible a mayúsculas/minúsculas).
- **FR-005**: Sistema MUST permitir que el mismo nickname se use en juegos
  distintos (unicidad es por juego, no global).
- **FR-006**: Sistema MUST mostrar un mensaje de éxito al visitante cuando la
  inscripción se registra correctamente.
- **FR-007**: Sistema MUST mostrar un mensaje de error claro cuando la inscripción
  es rechazada, indicando el motivo (campos incompletos o nickname duplicado).
- **FR-008**: Admin MUST poder cerrar y reabrir las inscripciones desde su panel,
  afectando ambos juegos de forma global (cierre único, no independiente por juego).
- **FR-009**: Cuando las inscripciones estén cerradas, el formulario público MUST
  reemplazarse por un mensaje indicando que las inscripciones están cerradas.
- **FR-010**: Sistema MUST aceptar inscripciones sin límite de cupo por juego en
  esta versión.

### Key Entities *(include if feature involves data)*

- **Inscripción**: nombre completo, nickname, juego elegido, fecha/hora de
  registro. Pertenece a un único juego.
- **Juego**: catálogo fijo de dos valores en esta versión — "FC 25" y "Call of Duty
  Black Ops 2".
- **Estado de Inscripciones**: bandera global abierto/cerrado controlada por el
  admin, sin distinción por juego.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un visitante puede completar y enviar su inscripción en menos de 1
  minuto.
- **SC-002**: El sistema detecta el 100% de los intentos de nickname duplicado
  dentro del mismo juego antes de confirmar la inscripción.
- **SC-003**: Tras el cierre de inscripciones, el 100% de los intentos de acceso al
  formulario público muestran el mensaje de cierre en menos de 1 segundo.
- **SC-004**: El 95% de los visitantes completa el formulario sin error de
  validación en el primer intento, gracias a mensajes de campo claros.

## Assumptions

- La inscripción no requiere verificación de identidad; no se valida que el
  nombre ingresado corresponda a una persona real.
- No hay edición ni cancelación de inscripción por parte del visitante en esta
  versión; una vez enviada, la inscripción es definitiva.
- El panel de administración ya cuenta con su propio mecanismo de autenticación
  (login admin); queda fuera de alcance de esta spec.
- El cierre de inscripciones es una bandera global única (no hay cierre
  independiente por juego) y es reversible (el admin puede reabrir).
- No existe límite máximo de inscriptos por juego en esta versión (sin cupo ni
  lista de espera).
- El catálogo de juegos ("FC 25", "Call of Duty Black Ops 2") es fijo para esta
  versión; agregar o quitar juegos queda fuera de alcance.
