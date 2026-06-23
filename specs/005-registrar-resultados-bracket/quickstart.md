# Quickstart: Registro de Resultados y Avance de Bracket

## Prerrequisitos

- Base de datos PostgreSQL migrada con el esquema de
  `server/prisma/schema.prisma` (incluye `Bracket` y `Partido`, ver
  [data-model.md](./data-model.md)).
- Backend Express (`/server`) y frontend Vite (`/client`) corriendo
  localmente.
- Un bracket generado para al menos un juego (dependencia de
  004-generar-bracket-torneo) con jugadores ya asignados a sus posiciones.
- Sesión admin válida (token JWT de 002-login-admin) para llamar al endpoint
  protegido.

## Escenario 1 — Registrar resultado sin empate y ver avance

1. Identificar un `Partido` de ronda 1 con `jugadorAId` y `jugadorBId`
   asignados (vía `GET /api/brackets/:juego`).
2. `PATCH /api/partidos/:id/resultado` con
   `{ "scoreA": 3, "scoreB": 1, "winnerId": "<jugadorAId>" }`.
3. **Esperado**: `200 OK`; al volver a leer el bracket, el ganador aparece en
   el slot correspondiente del partido de la siguiente ronda
   (`nextMatchId`). Ver contrato en
   [contracts/partidos-resultado.md](./contracts/partidos-resultado.md).

## Escenario 2 — Empate resuelto a penales

1. Tomar otro `Partido` definido (ambos jugadores asignados).
2. `PATCH .../resultado` con
   `{ "scoreA": 2, "scoreB": 2, "penaltyScoreA": 5, "penaltyScoreB": 4, "winnerId": "<jugadorAId>" }`.
3. **Esperado**: `200 OK`; el partido queda resuelto con los puntajes de
   penales guardados y el ganador avanza igual que en el escenario 1.
4. Repetir el mismo `PATCH` sin `penaltyScoreA`/`penaltyScoreB` (dejándolos
   fuera del body) → **Esperado**: `400 Bad Request` (FR-002).

## Escenario 3 — Double-elimination: perdedor cae al bracket de perdedores

1. Sobre un bracket de Call of Duty Black Ops 2 (`DOUBLE_ELIMINATION`),
   registrar el resultado de un partido del bracket de ganadores
   (`lado = WINNERS`).
2. **Esperado**: el ganador avanza vía `nextMatchId`; el perdedor aparece en
   el partido referenciado por `nextLoserMatchId` del bracket de perdedores.

## Escenario 4 — Ventana de corrección de resultado

1. Sobre el partido del Escenario 1 (ya resuelto, ganador todavía sin jugar su
   siguiente partido), volver a `PATCH .../resultado` con un `winnerId`
   distinto.
2. **Esperado**: `200 OK`; el resultado se sobrescribe y el slot del partido
   siguiente se actualiza con el nuevo ganador (FR-007).
3. Registrar ahora el resultado del partido siguiente (donde quedó el
   ganador corregido).
4. Intentar corregir de nuevo el partido del paso 1.
5. **Esperado**: `409 Conflict` — la ventana de edición ya se cerró porque el
   partido siguiente tiene resultado registrado.

## Escenario 5 — Campeón del juego

1. Completar el registro de resultados de todas las rondas restantes de un
   bracket hasta el partido final (sin `nextMatchId`).
2. **Esperado**: la respuesta del `PATCH` del partido final y la lectura del
   bracket exponen al `winnerId` de ese partido como campeón del juego
   (FR-008).
