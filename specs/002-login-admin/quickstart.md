# Quickstart: Login de Administrador

## Prerrequisitos

- Base de datos PostgreSQL migrada con el esquema de
  `server/prisma/schema.prisma` (incluye `Administrador`, ver
  [data-model.md](./data-model.md)).
- Al menos una cuenta `Administrador` seedeada con `email` y `passwordHash`
  (bcrypt) conocidos para pruebas.
- Backend Express (`/server`) y frontend Vite (`/client`) corriendo
  localmente.

## Escenario 1 — Login exitoso

1. `POST /api/admin/login` con `{ "email": "<admin>", "password": "<correcta>" }`.
2. **Esperado**: `200 OK` con `{ "token": "...", "expiresInSeconds": 600 }`.
3. Usar ese `token` en `Authorization: Bearer <token>` contra una ruta
   protegida (ej. `GET /api/brackets/FC25` de 005) → `200 OK`.

## Escenario 2 — Credenciales incorrectas

1. `POST /api/admin/login` con password incorrecta para un email existente.
2. **Esperado**: `401 Unauthorized`, `{ "error": "Credenciales inválidas" }`.
3. Repetir con un email que no existe.
4. **Esperado**: mismo `401` y mismo mensaje genérico (FR-005); el tiempo de
   respuesta no debería ser notablemente menor que en el paso 1 (ver
   research.md, sección 4).

## Escenario 3 — Expiración de sesión a los 10 minutos

1. Obtener un `token` válido (Escenario 1).
2. Esperar (o simular avance de reloj en test) más de 10 minutos.
3. Usar ese `token` contra una ruta protegida.
4. **Esperado**: `401 Unauthorized` (FR-006, FR-007) — el admin debe volver a
   hacer login; no hay renovación automática.

## Escenario 4 — Campos vacíos

1. `POST /api/admin/login` con `email` vacío.
2. **Esperado**: `400 Bad Request`, sin intento de autenticación contra la
   base de datos (FR-002).
