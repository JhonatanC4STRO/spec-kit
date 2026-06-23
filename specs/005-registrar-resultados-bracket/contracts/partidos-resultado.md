# Contract: Registrar / Corregir Resultado de Partido

## `PATCH /api/partidos/:id/resultado`

Implementado en `server/src/routes/partidos.routes.ts` →
`server/src/controllers/partidos.controller.ts` →
`server/src/services/bracket.ts`. Requiere sesión admin válida (JWT, ver
002-login-admin). Sin ella: `401`.

### Request Body

```json
{
  "scoreA": 3,
  "scoreB": 3,
  "penaltyScoreA": 5,
  "penaltyScoreB": 4,
  "winnerId": "jugador-a-uuid"
}
```

- `scoreA`, `scoreB`: enteros ≥ 0, requeridos.
- `penaltyScoreA`, `penaltyScoreB`: requeridos únicamente si `scoreA === scoreB`;
  deben ser distintos entre sí. Omitidos (o `null`) si no hubo empate.
- `winnerId`: requerido; debe coincidir con `jugadorAId` o `jugadorBId` del
  partido.

### Responses

- `200 OK` — resultado registrado o corregido; devuelve el `Partido`
  actualizado y, si corresponde, el/los partido(s) siguientes afectados
  (avance del ganador y, en double-elimination, caída del perdedor).
- `400 Bad Request` — payload inválido (campos faltantes, `winnerId` no
  coincide con ninguno de los dos jugadores, empate sin penales o con
  penales iguales).
- `404 Not Found` — el `id` de partido no existe.
- `409 Conflict` — alguno de estos casos:
  - el partido todavía no tiene ambos jugadores asignados (FR-006);
  - es una corrección y el partido siguiente del ganador (o del perdedor en
    double-elimination) ya tiene `winnerId` asignado (FR-007).
- `401 Unauthorized` — sin sesión admin válida o token expirado.

### Comportamiento de avance

Al confirmar un resultado válido (lógica en
`server/src/services/bracket.ts`):

1. Se asigna `winnerId` y `resolvedAt` en el partido actual.
2. El ganador se coloca en el slot correspondiente del partido referenciado
   por `nextMatchId` (si existe; el partido final no tiene siguiente).
3. En `DOUBLE_ELIMINATION`, si el partido era de `lado = WINNERS`, el perdedor
   se coloca en el slot correspondiente del partido referenciado por
   `nextLoserMatchId`. Si era de `lado = LOSERS`, el perdedor queda eliminado
   sin asignación adicional.
4. Si el partido resuelto es el último del bracket (sin `nextMatchId`), el
   `winnerId` se expone como campeón del juego (FR-008) en la respuesta y en
   la lectura del bracket.

## `GET /api/brackets/:juego`

Lectura del bracket completo de un juego (rondas, partidos, resultados,
campeón si ya está definido). Consumido desde el frontend vía
`client/src/services/partidos.ts` (función `getBracket(juego)`), nunca con
`fetch` directo dentro de un componente — conforme al principio III de la
constitución (Capa de Servicios para Fetching). El componente
`AdminBracketPage.tsx` invoca ese servicio desde un hook y renderiza el
resultado con `BracketView`.
