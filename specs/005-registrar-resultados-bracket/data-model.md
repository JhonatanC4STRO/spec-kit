# Data Model: Registro de Resultados y Avance de Bracket

Incluye las entidades `Bracket` y `Partido`, cuyo esquema canónico pertenece a
[004-generar-bracket-torneo/data-model.md](../004-generar-bracket-torneo/data-model.md)
(quien las crea); esta feature solo las consume para registrar resultados y
avanzar ganadores, más los campos propios de 005. Ambas viven en
`/server/prisma/schema.prisma` (backend); el frontend (`/client`) las consume
vía tipos espejo en `/shared/types/bracket.ts`, nunca con acceso directo a
Prisma.

## Bracket

| Campo | Tipo | Notas |
|-------|------|-------|
| id | string (uuid) | PK |
| juego | enum `FC25` \| `COD_BO2` | único por juego (un bracket por juego) |
| formato | enum `SINGLE_ELIMINATION` \| `DOUBLE_ELIMINATION` | fijado al generar (004) |
| createdAt | datetime | fecha de generación |

**Validación**: `formato` es `SINGLE_ELIMINATION` cuando `juego = FC25`,
`DOUBLE_ELIMINATION` cuando `juego = COD_BO2` (regla de 004, no de esta
feature, documentada aquí por dependencia).

## Partido

| Campo | Tipo | Notas |
|-------|------|-------|
| id | string (uuid) | PK |
| bracketId | string | FK → Bracket |
| ronda | int | número de ronda dentro de su sub-bracket |
| lado | enum `WINNERS` \| `LOSERS` \| null | null en single-elimination |
| jugadorAId | string \| null | null si la posición es "bye" o aún no definida |
| jugadorBId | string \| null | idem |
| scoreA | int \| null | puntos del jugador A, null hasta registrar resultado |
| scoreB | int \| null | puntos del jugador B |
| penaltyScoreA | int \| null | solo si `scoreA === scoreB` |
| penaltyScoreB | int \| null | solo si `scoreA === scoreB` |
| winnerId | string \| null | siempre explícito, nunca derivado automáticamente |
| nextMatchId | string \| null | partido de la ronda siguiente al que avanza el ganador |
| nextLoserMatchId | string \| null | solo double-elimination: partido al que cae el perdedor |
| resolvedAt | datetime \| null | momento del registro del resultado |

**Reglas de validación (de esta feature, 005)**:

- `winnerId` MUST ser `jugadorAId` o `jugadorBId` del mismo partido.
- Si `scoreA === scoreB`, `penaltyScoreA` y `penaltyScoreB` MUST estar
  presentes y ser distintos entre sí (FR-002); si son distintos, ambos pueden
  quedar `null`.
- No se puede registrar resultado si `jugadorAId` o `jugadorBId` es `null`
  (partido todavía no definido) — FR-006.
- No se puede registrar resultado si el partido ya tiene `winnerId` (debe
  pasar por el flujo de corrección, no por el de alta) — ver regla de edición.
- Corrección de un `winnerId` ya existente solo se permite si el `Partido`
  referenciado por `nextMatchId` (y por `nextLoserMatchId` cuando aplica) no
  tiene `winnerId` asignado todavía — FR-007.
- En `DOUBLE_ELIMINATION`: si el partido perdido por el jugador ya era de
  `lado = LOSERS`, el perdedor queda eliminado (no se le asigna
  `nextLoserMatchId`); si era de `lado = WINNERS`, el perdedor avanza al
  partido de `nextLoserMatchId`.
- En `SINGLE_ELIMINATION`: el perdedor siempre queda eliminado (`lado` es
  `null`, no existe `nextLoserMatchId`).

## Estados / Transiciones de un Partido

```text
PENDIENTE (jugadorAId o jugadorBId null)
   → DEFINIDO (ambos jugadores asignados, winnerId null)
       → RESUELTO (winnerId asignado, resolvedAt seteado)
           → RESUELTO (corregido) [solo si nextMatch* sin winnerId]
```

No existe transición de vuelta a `PENDIENTE` ni `DEFINIDO` una vez `RESUELTO`.
