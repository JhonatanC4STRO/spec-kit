# Data Model: Login de Administrador

## Administrador

| Campo | Tipo | Notas |
|-------|------|-------|
| id | string (uuid) | PK |
| email | string | único, requerido |
| passwordHash | string | hash bcrypt (costo 10), nunca se expone en respuestas |
| createdAt | datetime | fecha de creación de la cuenta |

**Constraint**: único en `email`.

**Validación de aplicación**:

- `email` y `password` MUST estar presentes y no vacíos antes de intentar
  autenticar (FR-002).
- `password` MUST aceptarse sin validar formato ni complejidad (FR-008,
  decisión explícita del usuario).

## Token de Sesión (JWT, no persistido)

| Campo del payload | Tipo | Notas |
|--------------------|------|-------|
| adminId | string | id del `Administrador` autenticado |
| iat | number (unix seconds) | momento de emisión |
| exp | number (unix seconds) | `iat + 600` (10 minutos) |

**Regla**: el token es stateless (no hay tabla `Sesion` en la base de
datos); la validez se determina únicamente verificando la firma y `exp` en
cada request (ver research.md, sección 2).

## Estados / Transiciones

```text
Administrador: cuenta existente (no hay alta de cuentas en esta feature; se
  asume seed o proceso fuera de alcance)

Token: emitido (válido) → expirado (exp pasado) — sin renovación automática,
  el admin debe volver a hacer login (consistente con Assumptions del spec)
```
