---

description: "Task list template for feature implementation"
---

# Tasks: Generación de Bracket del Torneo

**Input**: Design documents from `/specs/004-generar-bracket-torneo/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No solicitados explícitamente en la spec; no se incluyen tareas de
test dedicadas. La validación end-to-end se cubre en el Polish phase
corriendo `quickstart.md`.

**Organization**: Tareas agrupadas por user story para implementación y
prueba independientes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede correr en paralelo (archivos distintos, sin dependencias)
- **[Story]**: A qué user story pertenece (US1, US2, US3)
- Rutas de archivo exactas en cada descripción

## Path Conventions

Reutiliza `client/` y `server/` de 001 y `auth.middleware.ts` de 002. Esta
feature es la propietaria canónica del esquema Prisma `Bracket`/`Partido`
(ver data-model.md), consumido luego por 005.

---

## Phase 1: Setup

**Purpose**: Confirmar reutilización de infraestructura existente

- [X] T001 Confirmar que `auth.middleware.ts` (002) y `Inscripcion`/`EstadoInscripciones` (001) ya existen; sin dependencias nuevas — el shuffle usa `crypto.randomInt` nativo (ver research.md)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Esquema canónico `Bracket`/`Partido`, tipos compartidos y router
admin protegido — bloquea las 3 user stories y es prerequisito de 005

**⚠️ CRITICAL**: Ninguna user story puede empezar hasta completar esta fase

- [X] T002 Agregar modelos `Bracket` y `Partido` (con enums `Juego`, `FormatoBracket`, `LadoBracket`) a `server/prisma/schema.prisma`, incluyendo `nextMatchId`/`nextLoserMatchId` (ver data-model.md)
- [X] T003 Ejecutar `prisma migrate dev` para crear las tablas a partir de T002 (depende de T002) — migración `add_bracket_partido` aplicada contra Postgres real
- [X] T004 [P] Definir tipos compartidos `Bracket`, `Partido`, `FormatoBracket` en `shared/types/bracket.ts` (consumidos también por 005)
- [X] T005 Montar `server/src/routes/admin-bracket.routes.ts` bajo `/api/admin`, protegido por `auth.middleware.ts` de 002, en `server/src/index.ts` (depende de 002 T007 y 001 T010)

**Checkpoint**: Fundación lista — esquema disponible para 005

---

## Phase 3: User Story 1 - Generar el bracket de un juego (Priority: P1) 🎯 MVP

**Goal**: Generar el bracket de un juego con jugadores asignados al azar,
usando el formato correcto por juego (FR-002, FR-003, FR-004, FR-006).

**Independent Test**: Con inscripciones cerradas y jugadores inscritos,
generar el bracket de FC25 (single-elimination) y de Call of Duty
(double-elimination); todos los inscriptos quedan asignados a una posición.

### Implementation for User Story 1

- [X] T006 [US1] Implementar shuffle Fisher-Yates con `crypto.randomInt` en `server/src/services/bracket.ts` (ver research.md, sección 2)
- [X] T007 [US1] Implementar construcción del árbol de ganadores (slots = siguiente potencia de 2, asignación de "bye") con `nextMatchId` en `server/src/services/bracket.ts` (depende de T006)
- [X] T008 [US1] Implementar construcción del bracket de perdedores y `nextLoserMatchId` para `DOUBLE_ELIMINATION` en `server/src/services/bracket.ts` (depende de T007)
- [X] T009 [US1] Implementar `generarBracket(juego)`: transacción Prisma que crea `Bracket` + todos los `Partido`, resolviendo automáticamente los partidos de "bye" (depende de T002, T003, T007, T008)
- [X] T010 [US1] Implementar handler `POST` en `server/src/controllers/admin-bracket.controller.ts` (depende de T009)
- [X] T011 [US1] Registrar `POST /api/admin/brackets/:juego/generar` en `server/src/routes/admin-bracket.routes.ts` (depende de T010, T005)
- [X] T012 [P] [US1] Implementar `generarBracket(juego)` en `client/src/services/bracket.ts` (wrapper `fetch`)
- [X] T013 [P] [US1] Implementar `client/src/components/admin/GenerarBracketButton.tsx`: confirma y dispara la generación
- [X] T014 [US1] Integrar `GenerarBracketButton.tsx` en `client/src/pages/AdminBracketPage.tsx` (depende de T012, T013) — página y ruta `/admin/bracket` no existían, se crearon ahora

**Checkpoint**: User Story 1 funcional de forma independiente (MVP)

---

## Phase 4: User Story 2 - Bloqueo de generación con inscripciones abiertas (Priority: P2)

**Goal**: Rechazar la generación si las inscripciones siguen abiertas
(FR-001).

**Independent Test**: Con inscripciones abiertas, intentar generar el
bracket de cualquier juego → rechazado, sin crear ningún `Bracket`.

### Implementation for User Story 2

- [X] T015 [US2] Validar `EstadoInscripciones.abierta === false` antes de generar, dentro de `generarBracket()` en `server/src/services/bracket.ts` (depende de T009)
- [X] T016 [US2] Mapear ese rechazo a `409 Conflict` en `server/src/controllers/admin-bracket.controller.ts` (depende de T015, T010)
- [X] T017 [P] [US2] Mostrar el mensaje de error correspondiente en `GenerarBracketButton.tsx` al recibir `409` (depende de T013)

**Checkpoint**: User Stories 1 y 2 funcionan juntas e independientemente

---

## Phase 5: User Story 3 - Inmutabilidad del bracket generado (Priority: P3)

**Goal**: Rechazar regeneración de un bracket existente y exigir mínimo de
jugadores (FR-005, FR-007, FR-008).

**Independent Test**: Generar el bracket de un juego y volver a intentarlo →
rechazado, el bracket existente no se altera; intentar generar con menos de
2 inscriptos → rechazado con error distinto.

### Implementation for User Story 3

- [X] T018 [US3] Validar que no exista ya un `Bracket` para ese `juego` antes de generar, dentro de `generarBracket()` en `server/src/services/bracket.ts` (depende de T009)
- [X] T019 [US3] Validar mínimo 2 inscriptos en el juego antes de generar, respondiendo distinto de T018 (FR-005) en `server/src/services/bracket.ts` (depende de T009)
- [X] T020 [US3] Aplicar el orden de validación de research.md sección 4 (cerrado → no-existe-ya → mínimo de jugadores) combinando T015, T018, T019 en `generarBracket()` (depende de T015, T018, T019)
- [X] T021 [P] [US3] Mostrar mensajes distintos en el frontend para "ya existe bracket" vs. "faltan jugadores" en `GenerarBracketButton.tsx` (depende de T017) — ambos llegan como `err.message` del backend, ya distinguidos por texto

**Checkpoint**: Las 3 user stories funcionan de forma independiente y
conjunta

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validación final y limpieza

- [X] T022 [P] Ejecutar manualmente los 6 escenarios de `quickstart.md` — verificado contra Postgres real: 409 (abiertas), 400 (<2 jugadores en ambos juegos), 201+201 (FC25 single-elim 4 jugadores sin bye, COD_BO2 double-elim 5 jugadores con 3 byes), 409 (regenerar), 0 punteros `nextMatchId`/`nextLoserMatchId` huérfanos; datos de prueba limpiados, estado reabierto
- [X] T023 [P] Revisar que no haya `any` ni `fetch` embebido en componentes (principios I y III) en `client/src/components/admin/` y `server/src/services/bracket.ts` — verificado por grep, sin coincidencias
- [X] T024 Documentar en `shared/types/bracket.ts` que el esquema es compartido y consumido también por 005-registrar-resultados-bracket — comentario ya presente en el archivo

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias, pero requiere 001 y 002 ya
  existentes
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA las 3 user stories
  y es prerequisito de 005
- **User Stories (Phase 3-5)**: dependen de Foundational
  - US1 (P1): sin dependencia de otras stories de esta feature
  - US2 (P2): extiende `generarBracket()` creado en US1 — implementarla
    después
  - US3 (P3): extiende `generarBracket()` igual que US2; las tres
    validaciones (US2 + US3) se combinan en T020
- **Polish (Phase 6)**: depende de que las stories deseadas estén completas

### Within Each User Story

- Shuffle → construcción de árbol → transacción de generación → controlador
  → ruta
- Wrapper de cliente → componente que lo consume
- US1 completa antes de agregar las validaciones de bloqueo de US2/US3

### Parallel Opportunities

- T012, T013 (US1) en paralelo entre sí mientras T006-T011 avanzan en
  backend
- T017 (US2) en paralelo con T021 (US3) una vez exista T013

---

## Parallel Example: User Story 1

```bash
# Backend (secuencial: shuffle → árbol → transacción → controlador → ruta)
Task: "Implementar shuffle Fisher-Yates en server/src/services/bracket.ts"
Task: "Implementar construcción de árbol de ganadores con nextMatchId"
Task: "Implementar generarBracket() como transacción Prisma"
Task: "Implementar handler POST en admin-bracket.controller.ts"
Task: "Registrar POST /api/admin/brackets/:juego/generar"

# Frontend (en paralelo entre sí)
Task: "Implementar generarBracket(juego) en client/src/services/bracket.ts"
Task: "Implementar client/src/components/admin/GenerarBracketButton.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (esquema canónico Bracket/Partido)
3. Completar Phase 3: User Story 1
4. **STOP and VALIDATE**: generación de bracket en ambos formatos, de forma
   independiente
5. Deploy/demo si está listo

### Incremental Delivery

1. Setup + Foundational → esquema y router listos
2. User Story 1 → generación funcionando (MVP)
3. User Story 2 → bloqueo con inscripciones abiertas
4. User Story 3 → inmutabilidad y mínimo de jugadores
5. Cada historia agrega valor sin romper la anterior

---

## Notes

- [P] = archivos distintos, sin dependencias entre sí
- [Story] mapea cada tarea a su user story para trazabilidad
- El esquema `Bracket`/`Partido` creado aquí (T002) es prerequisito directo
  de 005-registrar-resultados-bracket
- Commit después de cada tarea o grupo lógico
- Detenerse en cada checkpoint para validar la historia de forma
  independiente
