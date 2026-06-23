# Research: Formulario Público de Inscripción al Torneo

## 1. Framework de testing

**Decision**: Vitest para unit e integration tests del backend; igual decisión
que el resto del proyecto (ver 005-registrar-resultados-bracket/research.md).

**Rationale**: Consistencia entre features; soporte nativo TS/ESM sin
configuración extra, tanto en `/server` como en `/client`.

**Alternatives considered**:
- Jest: requiere configuración adicional para ESM; descartado por
  consistencia con la decisión ya tomada en 005.

## 2. Unicidad de nickname por juego bajo concurrencia

**Decision**: Constraint único compuesto en Prisma sobre
`(juego, nicknameNormalizado)`. `nicknameNormalizado` se calcula en el backend
(`trim().toLowerCase()`) antes de insertar. Si la inserción viola el
constraint, el backend traduce el error de Prisma a `409 Conflict` con
mensaje "nickname ya registrado para este juego".

**Rationale**: Una validación "check-then-insert" en aplicación (buscar si
existe, luego insertar) tiene una condición de carrera real: dos envíos
simultáneos con el mismo nickname pueden pasar ambos el check antes de que
cualquiera inserte. El constraint a nivel de base de datos es atómico y
elimina esa ventana, cumpliendo SC-002 (100% de duplicados detectados) sin
importar concurrencia.

**Alternatives considered**:
- Validar solo en el servicio antes de insertar, sin constraint en DB: simple
  pero no atómico, falla bajo concurrencia real.
- Validar solo en el frontend: insuficiente, cualquier cliente puede saltarse
  la validación llamando directo a la API.

## 3. Representación del estado de inscripciones (abierto/cerrado)

**Decision**: Tabla `EstadoInscripciones` con una única fila (id fijo,
ej. `"global"`) y campo `abierta: boolean`. Lectura pública vía
`GET /api/inscripciones/estado` (sin auth); escritura vía
`PATCH /api/inscripciones/estado` protegida por sesión admin (JWT de
002-login-admin).

**Rationale**: Necesita persistir en runtime (el admin lo cambia sin
redeploy) y ser consultable desde el formulario público sin autenticación.
Una tabla singleton es el patrón más simple que cumple ambos requisitos sin
introducir dependencias nuevas.

**Alternatives considered**:
- Variable de entorno / archivo de configuración: requeriría redeploy para
  cambiar el estado, incompatible con "admin cierra desde su panel" en
  runtime.
- Un flag por juego en lugar de global: el spec (FR-008) define explícitamente
  el cierre como bandera global única, no por juego.
