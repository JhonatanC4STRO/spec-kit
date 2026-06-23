# Implementation Plan: Registro de Resultados y Avance de Bracket

**Branch**: `005-registrar-resultados-bracket` | **Date**: 2026-06-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-registrar-resultados-bracket/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

El admin registra el resultado de cada partido de un bracket ya generado
(feature 004): ganador, puntos por jugador y, si hubo empate en tiempo
regular, resultado de penales. El sistema avanza automáticamente al ganador a
la posición correspondiente de la siguiente ronda (siguiente partido del
bracket de ganadores, o al bracket de perdedores en double-elimination), y
permite corregir un resultado solo mientras el ganador todavía no jugó su
partido siguiente. Esta feature depende de las entidades Bracket/Partido
definidas por 004-generar-bracket-torneo; como ese feature aún no tiene
implementación de código, este plan incluye también el modelo mínimo de esas
entidades necesario para que el registro de resultados funcione.

## Technical Context

**Language/Version**: TypeScript 5.x en dos proyectos separados: React 18 +
Vite (frontend, `/client`) y Node.js + Express (backend, `/server`).

**Primary Dependencies**: Backend: Express, Prisma (acceso a PostgreSQL),
bcrypt (ya usado por 002-login-admin, no por esta feature directamente).
Frontend: React, Vite, Tailwind CSS. Sin librerías nuevas a instalar: la
verificación de sesión JWT y la lógica de avance de bracket se implementan a
mano en `/server/src/services`, conforme al principio de dependencias
aprobadas de la constitución.

**Storage**: PostgreSQL vía Prisma (en `/server/prisma`). Tablas
nuevas/extendidas: `Bracket`, `Partido` (ver data-model.md).

**Testing**: Vitest para unit/integration de la lógica de avance de bracket en
`/server/src/services` (ver research.md, decisión sobre testing).

**Target Platform**: Web — backend Express expuesto como API REST bajo
`/api/`, frontend SPA servida por Vite y consumida vía `fetch` desde
`/client/src/services` (sin requerimiento de escritorio/móvil nativo).

**Project Type**: Aplicación web con frontend y backend como proyectos
separados: `/client` (React + Vite) y `/server` (Node.js + Express),
comunicados vía API REST.

**Performance Goals**: Registrar un resultado y reflejar el avance del ganador
en menos de 5 segundos (SC-001 del spec).

**Constraints**: Edición de un resultado solo permitida si el partido
siguiente del ganador aún no tiene resultado registrado (FR-007); estructura
del bracket en sí (emparejamientos generados por 004) sigue siendo inmutable,
solo los resultados son editables bajo esa ventana.

**Scale/Scope**: Volumen propio de un torneo comunitario (decenas de
jugadores por juego, dos juegos); sin requerimiento de alta concurrencia.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Gate | Estado |
|-----------|------|--------|
| I. Seguridad de Tipos | Sin `any`; toda función con tipo de retorno explícito | PASS — se aplica en diseño de `/server/src/services` y `/client/src/services` (ver data-model.md y contracts/) |
| II. Spec-First | Spec aprobada antes de codear | PASS — `spec.md` ya validado (checklist 16/16) |
| III. Capa de Servicios para Fetching | Sin `fetch` embebido en JSX; llamadas vía `/client/src/services` | PASS — `BracketView`/`ResultadoForm` llaman a funciones de `client/src/services/partidos.ts`, no hacen `fetch` inline |
| IV. Separación de Responsabilidades | Lógica de negocio fuera de componentes UI y de controladores | PASS — avance de bracket y validación de ventana de edición viven en `server/src/services/bracket.ts`; el controlador solo orquesta request/response |
| V. Dependencias y Convenciones Aprobadas | No instalar librerías sin aprobar; rutas bajo `/server/src/routes` con prefijo `/api/`; naming conventions | PASS — sin dependencias nuevas; nombres siguen camelCase/PascalCase/kebab-case definidos |

Sin violaciones. No aplica Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/005-registrar-resultados-bracket/
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
│   │   └── brackets/
│   │       ├── BracketView.tsx        # Componente puro: dibuja rondas y partidos
│   │       └── ResultadoForm.tsx      # Componente puro: formulario de carga de resultado
│   ├── pages/
│   │   └── AdminBracketPage.tsx       # vista admin de un bracket por juego
│   └── services/
│       └── partidos.ts                # wrapper fetch: getBracket(), registrarResultado()
└── tests/
    └── unit/
        └── ResultadoForm.test.tsx

server/
├── src/
│   ├── routes/
│   │   └── partidos.routes.ts         # define PATCH /api/partidos/:id/resultado
│   ├── controllers/
│   │   └── partidos.controller.ts     # parsea request, llama al service, responde
│   └── services/
│       ├── bracket.ts                 # avanzarGanador(), puedeEditarResultado()
│       └── partido-validation.ts      # validar payload (campos, empate→penales)
├── prisma/
│   └── schema.prisma                  # extiende con Bracket, Partido
└── tests/
    ├── contract/
    │   └── partidos-resultado.test.ts
    ├── integration/
    │   └── avance-bracket.test.ts
    └── unit/
        └── bracket.test.ts

shared/
└── types/
    └── bracket.ts                     # tipos compartidos: Partido, ResultadoPartido, FormatoBracket
```

**Structure Decision**: Dos proyectos separados conforme a la constitución
(Opción 2: `/client` con React + Vite, `/server` con Node.js + Express),
comunicados vía API REST bajo `/api/`. Tipos compartidos entre ambos viven en
`/shared/types` para evitar duplicar contratos de datos.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Sin violaciones — tabla no aplica.
