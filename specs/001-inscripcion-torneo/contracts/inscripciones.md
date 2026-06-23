# Contract: Inscripción al Torneo

Implementado en `server/src/routes/inscripciones.routes.ts` →
`server/src/controllers/inscripciones.controller.ts` →
`server/src/services/inscripciones.ts`.

## `GET /api/inscripciones/estado`

Público, sin autenticación.

### Response

```json
{ "abierta": true }
```

- `200 OK` siempre (no hay caso de error esperado más allá de fallas de
  infraestructura).

Consumido desde `client/src/services/inscripciones.ts` (`getEstado()`) por
`InscripcionPage.tsx` para decidir si renderizar `InscripcionForm` o
`InscripcionesCerradas`.

## `PATCH /api/inscripciones/estado`

Requiere sesión admin válida (JWT, ver 002-login-admin). Sin ella: `401`.

### Request Body

```json
{ "abierta": false }
```

### Responses

- `200 OK` — devuelve el nuevo estado `{ "abierta": false }`.
- `400 Bad Request` — `abierta` ausente o no booleano.
- `401 Unauthorized` — sin sesión admin válida o token expirado.

## `POST /api/inscripciones`

Público, sin autenticación.

### Request Body

```json
{
  "nombreCompleto": "Juan Pérez",
  "nickname": "Player1",
  "juego": "FC25"
}
```

- `nombreCompleto`, `nickname`: string no vacío, requeridos.
- `juego`: `"FC25"` o `"COD_BO2"`, requerido.

### Responses

- `201 Created` — inscripción registrada; devuelve la `Inscripcion` creada
  (incluye `id`, `createdAt`).
- `400 Bad Request` — campos faltantes/vacíos o `juego` fuera del catálogo
  (FR-003, edge case de juego inválido).
- `409 Conflict` — nickname ya registrado para ese juego, tras normalizar
  (FR-004; ver research.md sección 2 sobre el constraint atómico).
- `423 Locked` — inscripciones cerradas en el momento del envío (FR-009; usa
  423 para distinguir de un 400 de validación de campos).

Consumido desde `client/src/services/inscripciones.ts` (`crearInscripcion()`)
por `InscripcionForm.tsx`, que traduce cada código de error a un mensaje
visible (FR-007).
