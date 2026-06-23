---

description: "Task list template for feature implementation"
---

# Tasks: Registro de Resultados y Avance de Bracket

**Input**: Design documents from `/specs/005-registrar-resultados-bracket/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No solicitados explícitamente en la spec; no se incluyen tareas de
test dedicadas. La validación end-to-end se cubre en el Polish phase
corriendo `quickstart.md`.

**Organization**: Tareas agrupadas por user story para implementación y
prueba independientes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede correr en paralelo (archivos distintos, sin dependencias)
- **[Story]**: A qué user story pertenece (US1, US2)
- Rutas de archivo exactas en cada descripción

## Path Conventions

Reutiliza `client/` y `server/` de 001, `auth.middleware.ts` de 002, y el
esquema Prisma `Bracket`/`Partido` ya creado por 004 (sin migración nueva en
esta feature).

---

## Phase 1: Setup

**Purpose**: Confirmar reutilización de infraestructura existente

- [X] T001 Confirmar que el esquema `Bracket`/`Partido` (004) y `auth.middleware.ts` (002) ya existen; sin dependencias nuevas ni migración de base de datos

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Lectura del bracket completo (usada por ambas user stories y
por el frontend) y wiring de rutas — bloquea las 2 user stories

**⚠️ CRITICAL**: Ninguna user story puede empezar hasta completar esta fase

- [X] T002 Montar `server/src/routes/brackets.routes.ts` (público) y `server/src/routes/partidos.routes.ts` (protegido por `auth.middleware.ts` de 002) en `server/src/index.ts` (depende de 004 esquema, 002 T007, 001 T010)
- [X] T003 Implementar `getBracket(juego)` en `server/src/services/bracket.ts`: lee `Bracket` + todos sus `Partido` ordenados por ronda
- [X] T004 [P] Implementar handler `GET` en `server/src/controllers/brackets.controller.ts` y registrar `GET /api/brackets/:juego` (depende de T003, T002)
- [X] T005 [P] Implementar `getBracket(juego)` en `client/src/services/partidos.ts` (wrapper `fetch`)
- [X] T006 [P] Implementar `client/src/components/brackets/BracketView.tsx`: dibuja rondas y partidos a partir de T005

**Checkpoint**: Fundación lista — lectura del bracket disponible para ambas
user stories

---

## Phase 3: User Story 1 - Registrar resultado y avanzar al ganador (Priority: P1) 🎯 MVP

**Goal**: Admin registra ganador y puntos de un partido (con penales si hubo
empate) y el sistema avanza al ganador, enviando al perdedor al bracket de
perdedores en double-elimination (FR-001 a FR-007).

**Independent Test**: Registrar resultado de un partido con sus dos
jugadores asignados → el ganador aparece en la siguiente ronda; en
double-elimination, el perdedor cae al bracket de perdedores.

### Implementation for User Story 1

- [X] T007 [US1] Implementar `server/src/services/partido-validation.ts`: valida `scoreA`/`scoreB` requeridos, `penaltyScoreA`/`penaltyScoreB` requeridos y distintos si hay empate (FR-002), y que `winnerId` coincida con `jugadorAId` o `jugadorBId`
- [X] T008 [US1] Implementar `avanzarGanador(partidoId, resultado)` en `server/src/services/bracket.ts`: asigna `winnerId`/`resolvedAt`, coloca al ganador en `nextMatchId`, y al perdedor en `nextLoserMatchId` si el partido era `WINNERS` (double-elimination) o lo elimina si era `LOSERS`/single-elimination (FR-003, FR-004, FR-005) (depende de T003, T007)
- [X] T009 [US1] Implementar `puedeEditarResultado(partido)` en `server/src/services/bracket.ts`: verdadero si el/los partido(s) siguiente(s) (`nextMatchId`, `nextLoserMatchId`) no tienen `winnerId` asignado (FR-007) (depende de T003)
- [X] T010 [US1] Rechazar en `avanzarGanador()` cuando `jugadorAId` o `jugadorBId` es `null` (partido todavía no definido) (FR-006) (depende de T008)
- [X] T011 [US1] Implementar handler `PATCH` en `server/src/controllers/partidos.controller.ts`: distingue alta (sin `winnerId` previo) de corrección (usa T009), mapea errores a `400`/`404`/`409` (depende de T008, T009, T010, T007)
- [X] T012 [US1] Registrar `PATCH /api/partidos/:id/resultado` en `server/src/routes/partidos.routes.ts` (depende de T011, T002)
- [X] T013 [P] [US1] Implementar `registrarResultado(id, payload)` en `client/src/services/partidos.ts` (wrapper `fetch`)
- [X] T014 [P] [US1] Implementar `client/src/components/brackets/ResultadoForm.tsx`: campos de puntos, penales condicionales si hay empate, selección de ganador
- [X] T015 [US1] Integrar `BracketView.tsx` (T006) y `ResultadoForm.tsx` (T014) en `client/src/pages/AdminBracketPage.tsx` (depende de T006, T013, T014)

**Checkpoint**: User Story 1 funcional de forma independiente (MVP)

---

## Phase 4: User Story 2 - Resultado determina el campeón (Priority: P2)

**Goal**: Al registrar el resultado del partido final, el sistema identifica
al campeón del juego (FR-008).

**Independent Test**: Completar el registro de resultados de todas las
rondas hasta el partido final → el ganador queda expuesto como campeón.

### Implementation for User Story 2

- [X] T016 [US2] En `avanzarGanador()` (`server/src/services/bracket.ts`), cuando el partido resuelto no tiene `nextMatchId` (es el final), exponer su `winnerId` como campeón en la respuesta y en `getBracket()` (depende de T008, T003)
- [X] T017 [P] [US2] Mostrar al campeón en `client/src/components/brackets/BracketView.tsx` cuando el bracket está completo (depende de T006, T016)

**Checkpoint**: Ambas user stories funcionan de forma independiente y
conjunta

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validación final y limpieza

- [X] T018 [P] Ejecutar manualmente los 5 escenarios de `quickstart.md` — verificado contra Postgres real con backend del usuario corriendo (puerto 3000): Escenario 1 (sin empate, avance a ronda 2) OK; Escenario 2 (empate sin penales → 400, con penales → 200) OK; Escenario 3 (double-elim, perdedor de WB cae a LB vía `nextLoserMatchId`) OK; Escenario 4 (corrección con ventana abierta → 200 y slot reasignado en el lugar correcto; ventana cerrada tras resolver el siguiente → 409) OK; Escenario 5 (partido final resuelto → `campeonId` expuesto en la respuesta y en `GET /api/brackets/:juego`) OK; además FR-006 (`409` con jugador faltante) verificado. Datos de prueba (7 inscripciones + 2 brackets) limpiados al final, estado reabierto — bracket original del usuario (1 jugador FC25) intacto
- [X] T019 [P] Revisar que no haya `any` ni `fetch` embebido en componentes (principios I y III) en `client/src/components/brackets/` y `server/src/services/bracket.ts` — `tsc --noEmit`/`tsc -b` y `eslint` limpios en ambos proyectos para los archivos nuevos
- [X] T020 Documentar en `server/src/services/bracket.ts` que `avanzarGanador()`/`puedeEditarResultado()` operan sobre el esquema canónico creado por 004

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias, pero requiere 001, 002 y 004 ya
  existentes
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA las 2 user stories
- **User Stories (Phase 3-4)**: dependen de Foundational
  - US1 (P1): sin dependencia de otras stories de esta feature
  - US2 (P2): extiende `avanzarGanador()` creado en US1 — implementarla
    después
- **Polish (Phase 5)**: depende de que ambas stories estén completas

### Within Each User Story

- Validación de payload → avance de bracket → ventana de edición →
  controlador → ruta
- Wrapper de cliente → componente que lo consume
- US1 completa antes de agregar la detección de campeón de US2

### Parallel Opportunities

- T004, T005, T006 (Foundational) en paralelo entre sí tras T002-T003
- T013, T014 (US1) en paralelo entre sí mientras T007-T012 avanzan en
  backend
- T017 (US2) puede avanzar en paralelo con el resto de US1 una vez exista
  T006

---

## Parallel Example: User Story 1

```bash
# Backend (secuencial: validación → avance → ventana de edición → controlador → ruta)
Task: "Implementar server/src/services/partido-validation.ts"
Task: "Implementar avanzarGanador() en server/src/services/bracket.ts"
Task: "Implementar puedeEditarResultado() en server/src/services/bracket.ts"
Task: "Implementar handler PATCH en partidos.controller.ts"
Task: "Registrar PATCH /api/partidos/:id/resultado"

# Frontend (en paralelo entre sí)
Task: "Implementar registrarResultado() en client/src/services/partidos.ts"
Task: "Implementar client/src/components/brackets/ResultadoForm.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (lectura del bracket)
3. Completar Phase 3: User Story 1
4. **STOP and VALIDATE**: registrar resultado y ver avance (incluyendo
   double-elimination y penales), de forma independiente
5. Deploy/demo si está listo

### Incremental Delivery

1. Setup + Foundational → lectura del bracket lista
2. User Story 1 → registro de resultados y avance funcionando (MVP)
3. User Story 2 → detección de campeón al completar el bracket
4. Cada historia agrega valor sin romper la anterior

---

## Notes

- [P] = archivos distintos, sin dependencias entre sí
- [Story] mapea cada tarea a su user story para trazabilidad
- Sin migración Prisma nueva: esta feature opera sobre el esquema canónico
  creado por 004
- Commit después de cada tarea o grupo lógico
- Detenerse en cada checkpoint para validar la historia de forma
  independiente
