# Implementation Plan: Formulario Público de Inscripción al Torneo

**Branch**: `001-inscripcion-torneo` | **Date**: 2026-06-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-inscripcion-torneo/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Cualquier visitante completa un formulario público (nombre completo, nickname,
juego) sin necesidad de cuenta. El backend valida campos completos y nickname
no duplicado dentro del mismo juego (normalizado), persiste la inscripción y
confirma éxito. El admin controla una bandera global de apertura/cierre de
inscripciones; cuando está cerrada, el frontend reemplaza el formulario por un
mensaje de cierre. Esta es la primera feature planeada del proyecto: fija la
base de `Inscripcion` y `EstadoInscripciones` que reutilizan 002, 003, 004 y
005.

## Technical Context

**Language/Version**: TypeScript 5.x en dos proyectos separados: React 18 +
Vite (frontend, `/client`) y Node.js + Express (backend, `/server`).

**Primary Dependencies**: Backend: Express, Prisma (acceso a PostgreSQL).
Frontend: React, Vite, Tailwind CSS. Sin librerías nuevas: normalización de
nickname y reglas de unicidad se implementan a mano en
`/server/src/services`, conforme al principio de dependencias aprobadas.

**Storage**: PostgreSQL vía Prisma (`/server/prisma`). Tablas nuevas:
`Inscripcion`, `EstadoInscripciones` (ver data-model.md).

**Testing**: Vitest para unit/integration de validación y normalización de
nickname en `/server/src/services` (ver research.md).

**Target Platform**: Web — backend Express expuesto como API REST bajo
`/api/`, frontend SPA pública servida por Vite, sin login para esta feature.

**Project Type**: Aplicación web con frontend y backend como proyectos
separados: `/client` (React + Vite) y `/server` (Node.js + Express),
comunicados vía API REST.

**Performance Goals**: Completar y enviar la inscripción en menos de 1 minuto
(SC-001); ver mensaje de cierre en menos de 1 segundo tras cerrar
inscripciones (SC-003).

**Constraints**: La unicidad de nickname por juego MUST resolverse con un
constraint a nivel de base de datos (no solo validación en aplicación), para
evitar condiciones de carrera entre dos envíos simultáneos con el mismo
nickname.

**Scale/Scope**: Volumen propio de un torneo comunitario (decenas/cientos de
inscriptos por juego); sin requerimiento de alta concurrencia.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Gate | Estado |
|-----------|------|--------|
| I. Seguridad de Tipos | Sin `any`; toda función con tipo de retorno explícito | PASS — aplica en `server/src/services` y `client/src/services` (ver data-model.md y contracts/) |
| II. Spec-First | Spec aprobada antes de codear | PASS — `spec.md` ya validado (checklist 16/16) |
| III. Capa de Servicios para Fetching | Sin `fetch` embebido en JSX; llamadas vía `/client/src/services` | PASS — `InscripcionForm` llama a `client/src/services/inscripciones.ts`, no hace `fetch` inline |
| IV. Separación de Responsabilidades | Lógica de negocio fuera de componentes UI y controladores | PASS — normalización de nickname y reglas de cierre viven en `server/src/services/inscripciones.ts`; el controlador solo orquesta request/response |
| V. Dependencias y Convenciones Aprobadas | No instalar librerías sin aprobar; rutas bajo `/server/src/routes` con prefijo `/api/`; naming conventions | PASS — sin dependencias nuevas; nombres siguen camelCase/PascalCase/kebab-case definidos |

Sin violaciones. No aplica Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/001-inscripcion-torneo/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
client/
├── src/
│   ├── components/
│   │   └── inscripcion/
│   │       ├── InscripcionForm.tsx        # Componente puro: formulario público
│   │       └── InscripcionesCerradas.tsx  # Componente puro: mensaje de cierre
│   ├── pages/
│   │   └── InscripcionPage.tsx            # decide formulario vs mensaje según estado
│   └── services/
│       └── inscripciones.ts               # wrapper fetch: getEstado(), crearInscripcion()
└── tests/
    └── unit/
        └── InscripcionForm.test.tsx

server/
├── src/
│   ├── routes/
│   │   └── inscripciones.routes.ts        # POST /api/inscripciones, GET/PATCH /api/inscripciones/estado
│   ├── controllers/
│   │   └── inscripciones.controller.ts    # parsea request, llama al service, responde
│   └── services/
│       └── inscripciones.ts               # normalizarNickname(), validar(), crear()
├── prisma/
│   └── schema.prisma                      # Inscripcion, EstadoInscripciones
└── tests/
    ├── contract/
    │   └── inscripciones.test.ts
    ├── integration/
    │   └── nickname-duplicado.test.ts
    └── unit/
        └── inscripciones-validation.test.ts

shared/
└── types/
    └── inscripcion.ts                     # tipos compartidos: Inscripcion, Juego, EstadoInscripciones
```

**Structure Decision**: Dos proyectos separados conforme a la constitución
(Opción 2: `/client` con React + Vite, `/server` con Node.js + Express),
comunicados vía API REST bajo `/api/`. Tipos compartidos en `/shared/types`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Sin violaciones — tabla no aplica.
