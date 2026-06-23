# Quickstart: Panel Admin de Jugadores Inscritos

## Prerrequisitos

- Esquema y datos de 001-inscripcion-torneo disponibles (`Inscripcion`,
  `EstadoInscripciones`).
- Sesión admin válida (token JWT de 002-login-admin).
- Algunas inscripciones de prueba en ambos juegos (FC25 y COD_BO2).

## Escenario 1 — Ver listado separado por juego

1. `GET /api/admin/inscripciones` con `Authorization: Bearer <token>`.
2. **Esperado**: `200 OK` con dos arrays (`FC25`, `COD_BO2`), cada uno con
   `nombreCompleto`, `nickname`, `createdAt` de sus inscriptos.
3. Repetir contra un juego sin inscriptos.
4. **Esperado**: array vacío para ese juego, sin afectar al otro.

## Escenario 2 — Eliminar un jugador

1. Tomar un `id` de inscripción del listado del Escenario 1.
2. `DELETE /api/admin/inscripciones/<id>`.
3. **Esperado**: `204 No Content`; al volver a pedir el listado, ese jugador
   ya no aparece.
4. `POST /api/inscripciones` (de 001) con el mismo `nickname` y `juego` del
   jugador eliminado.
5. **Esperado**: `201 Created` — el nickname quedó libre (FR-005 del spec).

## Escenario 3 — Doble eliminación (idempotencia)

1. Repetir el `DELETE` del Escenario 2 sobre el mismo `id` ya eliminado.
2. **Esperado**: `204 No Content` (no-op), sin error fatal.

## Escenario 4 — Abrir/cerrar inscripciones desde este panel

1. `PATCH /api/inscripciones/estado` con `{ "abierta": false }` (mismo
   contrato de 001).
2. **Esperado**: `200 OK`; el formulario público de 001 deja de aceptar
   inscripciones.
3. `PATCH /api/inscripciones/estado` con `{ "abierta": true }` → vuelve a
   aceptar.
