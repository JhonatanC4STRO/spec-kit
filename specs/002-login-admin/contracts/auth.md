# Contract: Login de Administrador

Implementado en `server/src/routes/auth.routes.ts` →
`server/src/controllers/auth.controller.ts` →
`server/src/services/auth.ts`.

## `POST /api/admin/login`

Público (es el propio endpoint de autenticación).

### Request Body

```json
{ "email": "admin@torneo.com", "password": "cualquier-valor" }
```

- `email`, `password`: string no vacío, requeridos. `password` sin
  restricciones de formato (FR-008).

### Responses

- `200 OK` — credenciales correctas:
  ```json
  { "token": "<jwt>", "expiresInSeconds": 600 }
  ```
- `400 Bad Request` — `email` o `password` ausentes/vacíos.
- `401 Unauthorized` — credenciales incorrectas (email inexistente o
  password incorrecta); mensaje genérico idéntico en ambos casos (FR-005):
  ```json
  { "error": "Credenciales inválidas" }
  ```

Consumido desde `client/src/services/auth.ts` (`login()`) por
`LoginForm.tsx`.

## Middleware de autenticación (rutas protegidas)

`server/src/middleware/auth.middleware.ts` se aplica a toda ruta bajo
`/api/admin/*` que no sea el propio login (incluye las rutas de 003, 004 y
005). Lee el header `Authorization: Bearer <token>`:

- Sin header o formato inválido → `401 Unauthorized`.
- Firma inválida o `exp` ya pasado → `401 Unauthorized` (FR-007: exige
  reautenticación).
- Válido → inyecta `adminId` en el request y continúa al controlador.
