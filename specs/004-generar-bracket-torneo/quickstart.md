# Quickstart: Generación de Bracket del Torneo

## Prerrequisitos

- Inscripciones (001) cerradas (`EstadoInscripciones.abierta = false`).
- Al menos 2 `Inscripcion` para el juego a probar.
- Sesión admin válida (token JWT de 002-login-admin).

## Escenario 1 — Generar bracket single-elimination (FC25)

1. Cerrar inscripciones: `PATCH /api/inscripciones/estado` con
   `{ "abierta": false }` (de 001).
2. `POST /api/admin/brackets/FC25/generar`.
3. **Esperado**: `201 Created`; el `Bracket` devuelto tiene `formato:
   "SINGLE_ELIMINATION"` y todos los inscriptos de FC25 aparecen asignados a
   un `Partido` de primera ronda.

## Escenario 2 — Generar bracket double-elimination (Call of Duty)

1. Repetir con `POST /api/admin/brackets/COD_BO2/generar`.
2. **Esperado**: `201 Created`; `formato: "DOUBLE_ELIMINATION"`; existen
   `Partido` con `lado: "WINNERS"` y la estructura del bracket de
   perdedores ya creada (sin jugadores asignados todavía, salvo los que
   caigan ahí tras resultados de 005).

## Escenario 3 — Bloqueo con inscripciones abiertas

1. `PATCH /api/inscripciones/estado` con `{ "abierta": true }`.
2. `POST /api/admin/brackets/FC25/generar`.
3. **Esperado**: `409 Conflict`, sin crear ningún `Bracket` ni `Partido`.

## Escenario 4 — Cantidad no potencia de 2 (bye)

1. Con inscripciones cerradas y, por ejemplo, 5 inscriptos en un juego,
   generar su bracket.
2. **Esperado**: `201 Created`; el bracket tiene 8 slots, 3 de ellos "bye";
   los partidos de "bye" aparecen ya `resolvedAt` no nulo y con `winnerId`
   igual al único jugador de ese partido, sin necesitar registro manual de
   resultado.

## Escenario 5 — Bloqueo de regeneración

1. Sobre un juego que ya tiene bracket generado (Escenario 1 o 2), repetir
   `POST /api/admin/brackets/:juego/generar`.
2. **Esperado**: `409 Conflict`; el bracket existente no se altera (FR-008).

## Escenario 6 — Mínimo de jugadores

1. Con un juego que tiene 0 o 1 inscriptos y las inscripciones cerradas,
   intentar generar su bracket.
2. **Esperado**: `400 Bad Request` (FR-005).
