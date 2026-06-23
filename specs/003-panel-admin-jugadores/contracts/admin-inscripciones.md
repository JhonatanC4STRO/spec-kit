# Contract: Panel Admin de Jugadores Inscritos

Implementado en `server/src/routes/admin-inscripciones.routes.ts` →
`server/src/controllers/admin-inscripciones.controller.ts` →
`server/src/services/inscripciones.ts`. Todas las rutas requieren sesión
admin válida (middleware de 002-login-admin); sin ella: `401`.

## `GET /api/admin/inscripciones`

### Response

```json
{
  "FC25": [
    { "id": "...", "nombreCompleto": "Juan Pérez", "nickname": "Player1", "createdAt": "2026-06-20T10:00:00Z" }
  ],
  "COD_BO2": []
}
```

- `200 OK` — siempre, incluso con listas vacías (edge case: juego sin
  inscriptos).
- `401 Unauthorized` — sin sesión admin válida.

## `DELETE /api/admin/inscripciones/:id`

### Responses

- `204 No Content` — jugador eliminado (o ya no existía: operación
  idempotente, ver data-model.md).
- `401 Unauthorized` — sin sesión admin válida.

Tras una eliminación exitosa, el `nickname` liberado queda disponible de
inmediato para una nueva inscripción en el mismo juego (vía
`POST /api/inscripciones` de 001), sin pasos adicionales.

## Apertura/cierre de inscripciones (reutilizado de 001)

Este panel consume directamente
`GET /api/inscripciones/estado` y `PATCH /api/inscripciones/estado`,
definidos en
[001-inscripcion-torneo/contracts/inscripciones.md](../001-inscripcion-torneo/contracts/inscripciones.md).
No se define un contrato nuevo aquí (ver research.md, sección 3).
