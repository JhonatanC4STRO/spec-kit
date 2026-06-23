# Contract: Generación de Bracket del Torneo

Implementado en `server/src/routes/admin-bracket.routes.ts` →
`server/src/controllers/admin-bracket.controller.ts` →
`server/src/services/bracket.ts`. Requiere sesión admin válida (middleware de
002-login-admin); sin ella: `401`.

## `POST /api/admin/brackets/:juego/generar`

`:juego` ∈ `{ FC25, COD_BO2 }`.

### Responses

- `201 Created` — bracket generado; devuelve el `Bracket` con todos sus
  `Partido` de primera ronda (y siguientes rondas vacías de jugadores, ya
  enlazadas vía `nextMatchId`).
- `400 Bad Request` — menos de 2 inscriptos en ese juego (FR-005).
- `409 Conflict` — alguno de estos casos:
  - inscripciones todavía abiertas (FR-001);
  - ya existe un `Bracket` para ese juego (FR-008).
- `401 Unauthorized` — sin sesión admin válida.

### Comportamiento

1. Valida en orden: inscripciones cerradas → bracket no existente → mínimo 2
   inscriptos (ver research.md, sección 4).
2. Obtiene todos los `Inscripcion` de ese `juego` y los mezcla con
   Fisher-Yates (`crypto.randomInt`).
3. Calcula el tamaño del bracket (siguiente potencia de 2) y asigna
   jugadores y "bye" a los slots de primera ronda.
4. Crea el `Bracket` (`formato` derivado del `juego`) y todos los `Partido`
   de todas las rondas en una transacción, enlazando `nextMatchId` (y
   `nextLoserMatchId` si es `DOUBLE_ELIMINATION`).
5. Los partidos de "bye" puro quedan resueltos automáticamente (ver
   data-model.md).

## `GET /api/brackets/:juego` (ya consumido por 005)

Esta feature no redefine esta lectura — ver
[005-registrar-resultados-bracket/contracts/partidos-resultado.md](../005-registrar-resultados-bracket/contracts/partidos-resultado.md).
Una vez generado el bracket, esa misma lectura expone la estructura recién
creada.
