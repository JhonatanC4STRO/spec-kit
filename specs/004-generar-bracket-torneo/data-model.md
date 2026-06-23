# Data Model: Generación de Bracket del Torneo

Esquema canónico de `Bracket` y `Partido` en
`/server/prisma/schema.prisma` — esta feature es quien los crea por primera
vez; 005-registrar-resultados-bracket los consume para registrar resultados
y avanzar ganadores (su data-model.md ya documentó el mismo esquema de forma
anticipada). El frontend los consume vía tipos espejo en
`/shared/types/bracket.ts`, nunca con acceso directo a Prisma. También lee
(sin modificar) `Inscripcion` y `EstadoInscripciones` de 001.

## Bracket

| Campo | Tipo | Notas |
|-------|------|-------|
| id | string (uuid) | PK |
| juego | enum `FC25` \| `COD_BO2` | único por juego (un bracket por juego) — constraint único |
| formato | enum `SINGLE_ELIMINATION` \| `DOUBLE_ELIMINATION` | fijado por esta feature al generar |
| createdAt | datetime | fecha de generación |

**Validación (de esta feature)**:

- `formato` MUST ser `SINGLE_ELIMINATION` cuando `juego = FC25`,
  `DOUBLE_ELIMINATION` cuando `juego = COD_BO2` (FR-002, FR-003) — no es
  configurable por el admin, se deriva del juego.
- No se puede crear un `Bracket` para un `juego` que ya tiene uno (constraint
  único + chequeo explícito) — FR-008.

## Partido

| Campo | Tipo | Notas |
|-------|------|-------|
| id | string (uuid) | PK |
| bracketId | string | FK → Bracket |
| ronda | int | número de ronda dentro de su sub-bracket |
| lado | enum `WINNERS` \| `LOSERS` \| null | null en single-elimination |
| jugadorAId | string \| null | `null` si la posición es "bye" (FR-006) |
| jugadorBId | string \| null | idem |
| scoreA | int \| null | sin uso en esta feature; lo escribe 005 |
| scoreB | int \| null | idem |
| penaltyScoreA | int \| null | idem |
| penaltyScoreB | int \| null | idem |
| winnerId | string \| null | en partidos de "bye" puro, esta feature lo asigna automáticamente al único jugador presente |
| nextMatchId | string \| null | calculado por esta feature al generar (FR-004) |
| nextLoserMatchId | string \| null | calculado por esta feature al generar, solo double-elimination |
| resolvedAt | datetime \| null | seteado por esta feature solo en partidos resueltos automáticamente por "bye" |

**Reglas de generación (de esta feature, 004)**:

- Jugadores inscritos (`Inscripcion` de un juego) MUST asignarse de forma
  aleatoria (Fisher-Yates con `crypto.randomInt`, ver research.md) a los
  slots de la primera ronda.
- Si la cantidad de inscriptos no es potencia de 2, los slots sobrantes
  quedan como "bye" (`jugadorBId = null` en ese partido); el partido se
  marca `winnerId = jugadorAId`, `resolvedAt = now()` automáticamente, sin
  intervención del admin (FR-006, edge case "bye").
- Requiere mínimo 2 inscriptos en el juego; si no se cumple, no se crea
  ningún `Bracket` ni `Partido` (FR-005).
- Una vez creados, `Bracket` y todos sus `Partido` (incluyendo
  `nextMatchId`/`nextLoserMatchId`) MUST NOT modificarse por esta feature ni
  por ninguna otra acción fuera del flujo de resultados de 005 (FR-007).

## Estados / Transiciones

```text
Bracket: no existe → GENERADO (creación atómica de Bracket + todos sus
  Partido en una transacción) — sin transición de vuelta, sin regeneración.

Partido (creado por esta feature):
  - con "bye": nace directamente RESUELTO (winnerId = único jugador)
  - sin "bye" (ambos jugadores): nace DEFINIDO, sin resolver — pasa a
    RESUELTO vía 005, no por esta feature.
```
