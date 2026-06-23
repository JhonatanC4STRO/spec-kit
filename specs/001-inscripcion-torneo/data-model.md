# Data Model: Formulario Público de Inscripción al Torneo

Ambas entidades viven en `/server/prisma/schema.prisma` (backend); el
frontend las consume vía tipos espejo en `/shared/types/inscripcion.ts`, sin
acceso directo a Prisma.

## Inscripcion

| Campo | Tipo | Notas |
|-------|------|-------|
| id | string (uuid) | PK |
| nombreCompleto | string | requerido, sin normalizar (se muestra tal cual se ingresó) |
| nickname | string | requerido, valor original ingresado por el visitante |
| nicknameNormalizado | string | `nickname.trim().toLowerCase()`, calculado por el backend |
| juego | enum `FC25` \| `COD_BO2` | requerido |
| createdAt | datetime | fecha/hora de registro |

**Constraint**: único compuesto en `(juego, nicknameNormalizado)` — garantiza
FR-004/FR-005 (duplicado solo dentro del mismo juego) de forma atómica (ver
research.md, sección 2).

**Validación de aplicación (antes de llegar al constraint)**:

- `nombreCompleto`, `nickname` y `juego` MUST estar presentes y no vacíos
  (FR-003).
- `juego` MUST ser uno de los dos valores del catálogo fijo (FC25, COD_BO2);
  cualquier otro valor se rechaza (edge case del spec).
- Si las inscripciones están cerradas (`EstadoInscripciones.abierta = false`),
  el backend MUST rechazar la creación aunque el payload sea válido (FR-009 +
  edge case de cierre concurrente al envío).

## EstadoInscripciones

| Campo | Tipo | Notas |
|-------|------|-------|
| id | string | fijo (singleton, ej. `"global"`) |
| abierta | boolean | `true` por defecto al crear el torneo |
| updatedAt | datetime | última vez que el admin cambió el estado |

**Regla**: existe exactamente una fila. El backend la crea con `abierta: true`
si no existe al primer arranque (seed), nunca se borra ni se duplica.

## Estados / Transiciones

```text
Inscripcion: no existe → creada (inmutable; sin edición/cancelación por el
  visitante, según Assumptions del spec)

EstadoInscripciones.abierta: true ⇄ false (reversible, solo admin)
```
