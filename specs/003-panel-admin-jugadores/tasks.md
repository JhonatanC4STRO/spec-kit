---

description: "Task list template for feature implementation"
---

# Tasks: Panel Admin de Jugadores Inscritos

**Input**: Design documents from `/specs/003-panel-admin-jugadores/`

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

Reutiliza `client/` y `server/` de 001-inscripcion-torneo y
`auth.middleware.ts` de 002-login-admin. Sin tablas nuevas (ver
data-model.md).

---

## Phase 1: Setup

**Purpose**: Confirmar reutilización de infraestructura existente

- [X] T001 Confirmar que `auth.middleware.ts` (002-login-admin) y los modelos `Inscripcion`/`EstadoInscripciones` (001-inscripcion-torneo) ya existen; sin dependencias nuevas ni cambios de esquema

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Router admin protegido y tipo de listado agrupado — bloquea las
3 user stories

**⚠️ CRITICAL**: Ninguna user story puede empezar hasta completar esta fase

- [X] T002 Montar `server/src/routes/admin-inscripciones.routes.ts` bajo `/api/admin`, protegido por `auth.middleware.ts` de 002, en `server/src/index.ts` (depende de 002 T007 y 001 T010)
- [X] T003 [P] Definir tipo compartido `ListadoPorJuego` (`{ FC25: Inscripcion[]; COD_BO2: Inscripcion[] }`) en `shared/types/inscripcion.ts` (extiende 001)

**Checkpoint**: Fundación lista — las 3 user stories pueden empezar

---

## Phase 3: User Story 1 - Ver listado de jugadores inscritos (Priority: P1) 🎯 MVP

**Goal**: Admin ve el listado completo de jugadores separado por juego, con
nombre, nickname y fecha de inscripción (FR-001, FR-002).

**Independent Test**: Con inscriptos en ambos juegos (de 001), `GET
/api/admin/inscripciones` devuelve ambos listados correctamente separados;
un juego sin inscriptos devuelve lista vacía sin afectar al otro.

### Implementation for User Story 1

- [X] T004 [US1] Implementar `listarAgrupadoPorJuego()` en `server/src/services/inscripciones.ts` (una consulta Prisma + `groupBy` en memoria, ver research.md sección 4)
- [X] T005 [US1] Implementar handler `GET` en `server/src/controllers/admin-inscripciones.controller.ts` (depende de T004)
- [X] T006 [US1] Registrar `GET /api/admin/inscripciones` en `server/src/routes/admin-inscripciones.routes.ts` (depende de T005, T002)
- [X] T007 [P] [US1] Implementar `getListadoAdmin()` en `client/src/services/inscripciones.ts` (wrapper `fetch`)
- [X] T008 [P] [US1] Implementar `client/src/components/admin/ListadoJugadores.tsx`: tabla separada por juego con nombre, nickname, fecha
- [X] T009 [US1] Implementar `client/src/pages/AdminJugadoresPage.tsx`: carga el listado vía T007 y renderiza T008 (depende de T007, T008)

**Checkpoint**: User Story 1 funcional de forma independiente (MVP)

---

## Phase 4: User Story 2 - Eliminar un jugador inscrito (Priority: P2)

**Goal**: Admin elimina un jugador con confirmación previa, liberando su
nickname (FR-003, FR-004, FR-005).

**Independent Test**: Eliminar un jugador del listado → desaparece; volver a
inscribir el mismo nickname en el mismo juego → aceptado. Repetir el delete
sobre el mismo `id` → no-op sin error.

### Implementation for User Story 2

- [X] T010 [US2] Implementar `eliminar(id)` en `server/src/services/inscripciones.ts`, idempotente si el `id` ya no existe (ver data-model.md) (depende de T004)
- [X] T011 [US2] Implementar handler `DELETE` en `server/src/controllers/admin-inscripciones.controller.ts` → `204 No Content` (depende de T010)
- [X] T012 [US2] Registrar `DELETE /api/admin/inscripciones/:id` en `server/src/routes/admin-inscripciones.routes.ts` (depende de T011, T002)
- [X] T013 [P] [US2] Implementar `eliminarJugador(id)` en `client/src/services/inscripciones.ts` (wrapper `fetch`)
- [X] T014 [P] [US2] Implementar `client/src/components/admin/ConfirmarEliminacion.tsx`: modal de confirmación antes de eliminar (FR-004)
- [X] T015 [US2] Integrar T013/T014 en `ListadoJugadores.tsx` / `AdminJugadoresPage.tsx`: botón eliminar → confirmar → llamar servicio → refrescar listado (depende de T013, T014, T008, T009)

**Checkpoint**: User Stories 1 y 2 funcionan juntas e independientemente

---

## Phase 5: User Story 3 - Abrir y cerrar inscripciones desde el panel (Priority: P3)

**Goal**: Exponer en este panel el control de apertura/cierre ya definido en
001, sin redefinirlo (FR-006).

**Independent Test**: Cerrar inscripciones desde este panel → el formulario
público de 001 deja de aceptar inscripciones; reabrir desde aquí → vuelve a
aceptarlas.

### Implementation for User Story 3

- [X] T016 [P] [US3] Implementar `client/src/components/admin/ToggleInscripciones.tsx`: switch abierta/cerrada que reutiliza `getEstado()`/`actualizarEstado()` en `client/src/services/inscripciones.ts` (sin crear endpoints nuevos, ver research.md sección 3) — `actualizarEstado()` no existía del lado cliente, se agregó ahora como wrapper de `httpPatch` ya soportado por 001
- [X] T017 [US3] Integrar `ToggleInscripciones.tsx` en `client/src/pages/AdminJugadoresPage.tsx` (depende de T016, T009)

**Checkpoint**: Las 3 user stories funcionan de forma independiente y
conjunta

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validación final y limpieza

- [X] T018 [P] Ejecutar manualmente los 4 escenarios de `quickstart.md` — verificado contra Postgres real: 401 sin auth, 200 listado agrupado, 201 alta, 204 eliminar (x2, idempotente), 201 reinscripción con nickname liberado; datos de prueba limpiados
- [X] T019 [P] Revisar que no haya `any` ni `fetch` embebido en componentes (principios I y III) en `client/src/components/admin/` y `server/src/services/inscripciones.ts` — verificado por grep, sin coincidencias
- [X] T020 Confirmar que no se duplicó el contrato de apertura/cierre de 001 (principio V / Assumption del spec) — revisión de código, sin endpoint nuevo en `admin-inscripciones.routes.ts`: solo `GET`/`DELETE` de inscripciones, el toggle usa `/api/inscripciones/estado` de 001

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias, pero requiere que 001 y 002 ya
  existan
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA las 3 user stories
- **User Stories (Phase 3-5)**: dependen de Foundational
  - US1 (P1): sin dependencia de otras stories de esta feature
  - US2 (P2): extiende el mismo `inscripciones.ts`/`admin-inscripciones.*` que crea US1 — implementarla después
  - US3 (P3): solo frontend, reutiliza servicios ya existentes de 001; no depende de US1/US2 para funcionar, pero comparte la misma página (`AdminJugadoresPage.tsx`)
- **Polish (Phase 6)**: depende de que las stories deseadas estén completas

### Within Each User Story

- Servicio → controlador → ruta en el backend
- Wrapper de cliente → componente que lo consume en el frontend
- US1 completa antes de extender con la eliminación de US2

### Parallel Opportunities

- T007, T008 (US1) en paralelo entre sí mientras T004-T006 avanzan en backend
- T013, T014 (US2) en paralelo entre sí
- T016 (US3) en paralelo con todo lo de US1/US2 (no comparte archivos hasta T017)

---

## Parallel Example: User Story 2

```bash
# Backend (secuencial: servicio → controlador → ruta)
Task: "Implementar eliminar(id) en server/src/services/inscripciones.ts"
Task: "Implementar handler DELETE en server/src/controllers/admin-inscripciones.controller.ts"
Task: "Registrar DELETE /api/admin/inscripciones/:id"

# Frontend (en paralelo entre sí)
Task: "Implementar eliminarJugador(id) en client/src/services/inscripciones.ts"
Task: "Implementar client/src/components/admin/ConfirmarEliminacion.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational
3. Completar Phase 3: User Story 1
4. **STOP and VALIDATE**: listado separado por juego, de forma independiente
5. Deploy/demo si está listo

### Incremental Delivery

1. Setup + Foundational → router admin protegido listo
2. User Story 1 → listado visible (MVP)
3. User Story 2 → eliminación de jugadores
4. User Story 3 → apertura/cierre accesible desde este panel
5. Cada historia agrega valor sin romper la anterior

---

## Notes

- [P] = archivos distintos, sin dependencias entre sí
- [Story] mapea cada tarea a su user story para trazabilidad
- Sin tablas Prisma nuevas; toda la persistencia ya existe en 001
- Commit después de cada tarea o grupo lógico
- Detenerse en cada checkpoint para validar la historia de forma
  independiente
