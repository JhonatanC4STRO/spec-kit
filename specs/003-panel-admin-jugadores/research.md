# Research: Panel Admin de Jugadores Inscritos

## 1. Framework de testing

**Decision**: Vitest, igual que el resto del proyecto.

**Rationale**: Consistencia con 001, 002 y 005.

## 2. Confirmación antes de eliminar (FR-004)

**Decision**: La confirmación es responsabilidad del frontend (modal
`ConfirmarEliminacion.tsx`) antes de invocar
`eliminarJugador(id)`; el backend no implementa un paso de pre-confirmación
ni soft-delete, ejecuta el `DELETE` real apenas se llama.

**Rationale**: El spec (Assumptions) establece que eliminar es irreversible y
sin papelera; agregar soft-delete con recuperación sería resolver un problema
que el spec descartó explícitamente para esta versión.

**Alternatives considered**: Soft-delete con flag `eliminado` + confirmación
en dos pasos en el backend — descartado, sobre-ingeniería sin requerimiento.

## 3. Reutilización del control de apertura/cierre (FR-006)

**Decision**: Esta feature no agrega un endpoint nuevo para abrir/cerrar
inscripciones. El frontend del panel consume directamente
`GET /api/inscripciones/estado` y `PATCH /api/inscripciones/estado`, ya
definidos en
[001-inscripcion-torneo/contracts/inscripciones.md](../001-inscripcion-torneo/contracts/inscripciones.md).

**Rationale**: El spec de 003 es explícito: "no introduce un segundo
mecanismo, solo lo expone en este panel". Duplicar el endpoint violaría esa
restricción y el principio de spec-first (la spec de 001 ya es la fuente de
verdad para ese comportamiento).

**Alternatives considered**: Endpoint espejo `/api/admin/inscripciones/estado`
— redundante y contradice el spec de 003.

## 4. Listado agrupado por juego

**Decision**: Un único endpoint `GET /api/admin/inscripciones` devuelve las
inscripciones ya agrupadas por juego en la respuesta (`{ FC25: [...],
COD_BO2: [...] }`), calculado en `server/src/services/inscripciones.ts` con
una sola consulta Prisma seguida de un `groupBy` en memoria (volumen bajo, no
amerita dos queries separadas).

**Rationale**: Evita que el frontend tenga que hacer dos llamadas (una por
juego) o reagrupar él mismo; el agrupado es trivial de calcular en el backend
dado el catálogo fijo de dos juegos.

**Alternatives considered**: Dos endpoints (`?juego=FC25`,
`?juego=COD_BO2`) — más llamadas de red sin beneficio dado que el panel
siempre necesita ambos listados a la vez.
