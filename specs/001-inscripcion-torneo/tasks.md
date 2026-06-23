---

description: "Task list template for feature implementation"
---

# Tasks: Formulario Público de Inscripción al Torneo

**Input**: Design documents from `/specs/001-inscripcion-torneo/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No solicitados explícitamente en la spec; no se incluyen tareas de test dedicadas. La validación end-to-end se cubre en el Polish phase corriendo `quickstart.md`.

**Organization**: Tareas agrupadas por user story para implementación y prueba independientes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede correr en paralelo (archivos distintos, sin dependencias)
- **[Story]**: A qué user story pertenece (US1, US2, US3)
- Rutas de archivo exactas en cada descripción

## Path Conventions

Proyectos separados (constitución v2.0.0): `client/` (React + Vite) y
`server/` (Node.js + Express), tipos compartidos en `shared/types/`. Ver
plan.md para el árbol completo.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialización de los dos proyectos

- [X] T001 Crear estructura de carpetas `client/`, `server/`, `shared/types/` per plan.md
- [X] T002 Inicializar proyecto `server/` (Node.js + Express + TypeScript): `server/package.json`, `server/tsconfig.json`, dependencias `express`, `prisma`, `@prisma/client`, `bcrypt`
- [X] T003 [P] Inicializar proyecto `client/` (React + Vite + TypeScript + Tailwind): `client/package.json`, `client/vite.config.ts`, `client/tailwind.config.js`
- [X] T004 [P] Configurar lint/format (ESLint + Prettier) en `server/.eslintrc.cjs` y `client/.eslintrc.cjs`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestructura base que bloquea a las 3 user stories

**⚠️ CRITICAL**: Ninguna user story puede empezar hasta completar esta fase

- [X] T005 Configurar datasource PostgreSQL y generator en `server/prisma/schema.prisma`
- [X] T006 Definir modelos `Inscripcion` y `EstadoInscripciones` en `server/prisma/schema.prisma` con constraint único compuesto `(juego, nicknameNormalizado)` en `Inscripcion` (ver data-model.md) (depende de T005)
- [X] T007 Ejecutar `prisma migrate dev` para crear las tablas a partir de T006 (depende de T006) — ejecutado contra Postgres local real (`server/.env`), migración `init` aplicada
- [X] T008 [P] Crear `server/prisma/seed.ts` que siembra la fila singleton de `EstadoInscripciones` con `abierta: true` si no existe
- [X] T009 [P] Definir tipos compartidos `Inscripcion`, `Juego`, `EstadoInscripciones` en `shared/types/inscripcion.ts`
- [X] T010 Crear entrypoint Express `server/src/index.ts` con middleware JSON, manejador de errores y montaje del router `/api`
- [X] T011 [P] Crear shell de la app cliente: `client/src/main.tsx`, `client/src/App.tsx`, y wrapper base de `fetch` con URL base en `client/src/services/http.ts`

**Checkpoint**: Fundación lista — las 3 user stories pueden empezar (en paralelo si hay capacidad)

---

## Phase 3: User Story 1 - Inscripción exitosa al torneo (Priority: P1) 🎯 MVP

**Goal**: Cualquier visitante completa nombre completo, nickname y juego, y
recibe confirmación de éxito (FR-001, FR-002, FR-003, FR-006, FR-007).

**Independent Test**: Completar el formulario con datos válidos (estado
`abierta: true` por defecto desde el seed de T008) y verificar que aparece el
mensaje de éxito y que la inscripción queda persistida.

### Implementation for User Story 1

- [X] T012 [US1] Implementar `server/src/services/inscripciones.ts`: `normalizarNickname()` y `crear()` validando que `nombreCompleto`, `nickname` y `juego` estén presentes y que `juego` sea `FC25` o `COD_BO2` (FR-002, FR-003)
- [X] T013 [US1] Implementar `server/src/controllers/inscripciones.controller.ts`: handler `crearInscripcion` (POST), traduce errores de validación a `400` (depende de T012)
- [X] T014 [US1] Implementar `server/src/routes/inscripciones.routes.ts`: registrar `POST /api/inscripciones` (depende de T013)
- [X] T015 [P] [US1] Implementar `client/src/services/inscripciones.ts`: `crearInscripcion()` (wrapper `fetch` sobre `POST /api/inscripciones`)
- [X] T016 [P] [US1] Implementar `client/src/components/inscripcion/InscripcionForm.tsx`: campos nombre completo/nickname/juego, validación de campos vacíos en cliente, mensaje de éxito al confirmar (FR-006)
- [X] T017 [US1] Implementar `client/src/pages/InscripcionPage.tsx` renderizando `InscripcionForm` (depende de T016)
- [X] T018 [US1] Agregar manejo visible de errores de validación (`400`) en `InscripcionForm.tsx` señalando campos faltantes (FR-007) (depende de T016)

**Checkpoint**: User Story 1 funcional de forma independiente (MVP)

---

## Phase 4: User Story 2 - Prevención de nickname duplicado (Priority: P2)

**Goal**: Rechazar un nickname ya registrado en el mismo juego, permitiendo
el mismo nickname en juegos distintos (FR-004, FR-005).

**Independent Test**: Inscribir un nickname en "FC 25"; reintentar el mismo
nickname (incluso con variación de mayúsculas/espacios) en "FC 25" →
rechazado; el mismo nickname en "Call of Duty Black Ops 2" → aceptado.

### Implementation for User Story 2

- [X] T019 [US2] Extender `server/src/services/inscripciones.ts`: capturar la violación del constraint único de Prisma (código `P2002`) en `crear()` y traducirla a un error de conflicto (depende de T012, T006)
- [X] T020 [US2] Extender `server/src/controllers/inscripciones.controller.ts`: mapear ese error de conflicto a `409 Conflict` con mensaje "nickname ya registrado para este juego" (depende de T019)
- [X] T021 [P] [US2] Extender `client/src/components/inscripcion/InscripcionForm.tsx`: mostrar mensaje específico cuando la respuesta es `409` (FR-007) (depende de T016)

**Checkpoint**: User Stories 1 y 2 funcionan juntas e independientemente

---

## Phase 5: User Story 3 - Cierre de inscripciones por el admin (Priority: P3)

**Goal**: El admin cierra/reabre inscripciones (bandera global) y el
formulario público refleja el estado (FR-008, FR-009).

**Independent Test**: `PATCH /api/inscripciones/estado` con
`{ "abierta": false }` → el público ve mensaje de cierre en vez del
formulario; al reabrir, vuelve a funcionar el flujo de US1.

> **Nota de dependencia cruzada**: `PATCH /api/inscripciones/estado` requiere
> sesión admin válida vía `server/src/middleware/auth.middleware.ts`, que es
> propiedad de 002-login-admin. Si ese middleware todavía no está
> implementado al ejecutar esta fase, T024 debe dejar un stub que rechace
> toda request con `501 Not Implemented` hasta integrarlo (no implementar
> autenticación propia aquí — violaría el principio de no duplicar
> comportamiento ya especificado en otra feature).

### Implementation for User Story 3

- [X] T022 [US3] Implementar `server/src/services/inscripciones.ts`: `obtenerEstado()` y `actualizarEstado()` leyendo/escribiendo la fila singleton de `EstadoInscripciones` (depende de T006)
- [X] T023 [US3] Extender `server/src/services/inscripciones.ts` → `crear()`: rechazar con error `423 Locked` si `EstadoInscripciones.abierta === false` (FR-009) (depende de T012, T022)
- [X] T024 [US3] Implementar en `server/src/routes/inscripciones.routes.ts` + `server/src/controllers/inscripciones.controller.ts`: `GET /api/inscripciones/estado` (público) y `PATCH /api/inscripciones/estado` (protegida por `auth.middleware.ts`, ver nota de dependencia arriba) (depende de T022) — **stub `requireAdmin` → 501** hasta que 002-login-admin implemente el middleware real
- [X] T025 [P] [US3] Implementar `client/src/services/inscripciones.ts`: `getEstado()` (wrapper `fetch` sobre `GET /api/inscripciones/estado`)
- [X] T026 [P] [US3] Implementar `client/src/components/inscripcion/InscripcionesCerradas.tsx`: mensaje de "inscripciones cerradas"
- [X] T027 [US3] Actualizar `client/src/pages/InscripcionPage.tsx`: llamar a `getEstado()` y renderizar `InscripcionForm` o `InscripcionesCerradas` según corresponda (depende de T017, T025, T026)

**Checkpoint**: Las 3 user stories funcionan de forma independiente y conjunta

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validación final y limpieza

- [X] T028 [P] Ejecutar manualmente los 4 escenarios de `quickstart.md` — verificado contra Postgres real: 200 (estado), 201 (alta), 409 (duplicado normalizado), 201 (mismo nick otro juego), 423 (cierre); datos de prueba limpiados después
- [X] T029 [P] Revisar que no haya `any` ni `fetch` embebido en componentes (principios I y III de la constitución) en `client/src/components/inscripcion/` y `server/src/services/inscripciones.ts` — verificado por grep, sin coincidencias
- [X] T030 Documentar variables de entorno (`DATABASE_URL`, etc.) en `server/.env.example`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias — puede arrancar de inmediato
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA las 3 user stories
- **User Stories (Phase 3-5)**: dependen de Foundational
  - US1 (P1): sin dependencia de otras stories
  - US2 (P2): depende de la `Inscripcion`/`crear()` de US1 (T012), la extiende
  - US3 (P3): depende del modelo `EstadoInscripciones` de Foundational (T006); integra con la página de US1 (T017) pero no bloquea su implementación inicial
- **Polish (Phase 6)**: depende de que las stories deseadas estén completas

### Within Each User Story

- Servicios antes que controladores; controladores antes que rutas
- Backend antes que el wrapper de fetch del cliente; wrapper antes que el
  componente que lo consume
- Historia completa antes de pasar a la de menor prioridad

### Parallel Opportunities

- T003, T004 (Setup) en paralelo con T002
- T008, T009, T011 (Foundational) en paralelo entre sí tras T005-T007
- T015, T016 (US1) en paralelo entre sí (cliente) mientras T012-T014 avanzan en backend
- T021 (US2) en paralelo con T019-T020 una vez exista T016
- T025, T026 (US3) en paralelo entre sí

---

## Parallel Example: User Story 1

```bash
# Backend (secuencial: servicio → controlador → ruta)
Task: "Implementar server/src/services/inscripciones.ts: normalizarNickname(), crear()"
Task: "Implementar server/src/controllers/inscripciones.controller.ts: crearInscripcion"
Task: "Implementar server/src/routes/inscripciones.routes.ts: POST /api/inscripciones"

# Frontend (en paralelo entre sí, depende del backend para probar end-to-end)
Task: "Implementar client/src/services/inscripciones.ts: crearInscripcion()"
Task: "Implementar client/src/components/inscripcion/InscripcionForm.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (bloquea todo lo demás)
3. Completar Phase 3: User Story 1
4. **STOP and VALIDATE**: probar inscripción exitosa de forma independiente
5. Deploy/demo si está listo

### Incremental Delivery

1. Setup + Foundational → fundación lista
2. User Story 1 → inscripción básica funcionando (MVP)
3. User Story 2 → protección contra nickname duplicado
4. User Story 3 → control de apertura/cierre por el admin
5. Cada historia agrega valor sin romper las anteriores

---

## Notes

- [P] = archivos distintos, sin dependencias entre sí
- [Story] mapea cada tarea a su user story para trazabilidad
- T024 (PATCH estado) depende de que 002-login-admin exponga
  `auth.middleware.ts`; ver nota de dependencia cruzada en Phase 5
- Commit después de cada tarea o grupo lógico
- Detenerse en cada checkpoint para validar la historia de forma
  independiente
