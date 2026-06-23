# Quickstart: Formulario Público de Inscripción al Torneo

## Prerrequisitos

- Base de datos PostgreSQL migrada con el esquema de
  `server/prisma/schema.prisma` (incluye `Inscripcion` y
  `EstadoInscripciones`, ver [data-model.md](./data-model.md)).
- `EstadoInscripciones` seedeado con `abierta: true`.
- Backend Express (`/server`) y frontend Vite (`/client`) corriendo
  localmente.

## Escenario 1 — Inscripción exitosa

1. `GET /api/inscripciones/estado` → confirmar `{ "abierta": true }`.
2. `POST /api/inscripciones` con
   `{ "nombreCompleto": "Juan Pérez", "nickname": "Player1", "juego": "FC25" }`.
3. **Esperado**: `201 Created`; el frontend muestra mensaje de éxito (FR-006).

## Escenario 2 — Campos incompletos

1. `POST /api/inscripciones` con `nickname` vacío.
2. **Esperado**: `400 Bad Request`; el frontend señala el campo faltante
   (FR-003, FR-007).

## Escenario 3 — Nickname duplicado en el mismo juego

1. Repetir el `POST` del Escenario 1 con el mismo `nickname` ("Player1",
   "PLAYER1 " también cuenta) y el mismo `juego` ("FC25").
2. **Esperado**: `409 Conflict` (FR-004).
3. Repetir con el mismo `nickname` pero `juego: "COD_BO2"`.
4. **Esperado**: `201 Created` — la unicidad es por juego, no global
   (FR-005).

## Escenario 4 — Cierre de inscripciones

1. Como admin autenticado, `PATCH /api/inscripciones/estado` con
   `{ "abierta": false }`.
2. `GET /api/inscripciones/estado` → `{ "abierta": false }`.
3. Intentar `POST /api/inscripciones` con datos válidos.
4. **Esperado**: `423 Locked` (FR-009); el frontend muestra mensaje de
   inscripciones cerradas en vez del formulario.
5. `PATCH /api/inscripciones/estado` con `{ "abierta": true }` → el flujo del
   Escenario 1 vuelve a funcionar.
