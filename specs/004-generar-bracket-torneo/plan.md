# Implementation Plan: Generación de Bracket del Torneo

**Branch**: `004-generar-bracket-torneo` | **Date**: 2026-06-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-generar-bracket-torneo/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Con las inscripciones cerradas (001), el admin genera el `Bracket` de un juego:
single-elimination para FC25, double-elimination para Call of Duty Black Ops
2. Los jugadores inscritos (001) se asignan aleatoriamente a las posiciones de
los `Partido` de primera ronda; si la cantidad no es potencia de 2, las
posiciones faltantes se completan con "bye" con avance automático. La
estructura (`Bracket` + `Partido`, incluyendo los punteros `nextMatchId` /
`nextLoserMatchId`) queda fija una vez creada. Esta feature es la dueña
canónica del esquema `Bracket`/`Partido` que 005-registrar-resultados-bracket
ya anticipó y consume para avanzar resultados.

## Technical Context

**Language/Version**: TypeScript 5.x en dos proyectos separados: React 18 +
Vite (frontend, `/client`) y Node.js + Express (backend, `/server`).

**Primary Dependencies**: Backend: Express, Prisma. Frontend: React, Vite,
Tailwind CSS. Sin dependencias nuevas: el algoritmo de generación de bracket
(shuffle aleatorio, asignación de byes, precálculo de punteros) se implementa
a mano en `/server/src/services`.

**Storage**: PostgreSQL vía Prisma (`/server/prisma`). Tablas nuevas:
`Bracket`, `Partido` (ver data-model.md — esquema compartido con 005). Lee
`Inscripcion` de 001 para obtener los jugadores a asignar y
`EstadoInscripciones` para verificar que estén cerradas.

**Testing**: Vitest para unit/integration del algoritmo de generación
(shuffle, byes, construcción de punteros de avance) en
`/server/src/services`.

**Target Platform**: Web — backend Express expuesto como API REST bajo
`/api/admin/`, frontend SPA con acción de generar bracket desde el panel
admin.

**Project Type**: Aplicación web con frontend y backend como proyectos
separados: `/client` (React + Vite) y `/server` (Node.js + Express).

**Performance Goals**: Generar el bracket de un juego en menos de 10 segundos
desde que el admin confirma la acción (SC-001).

**Constraints**: Generación MUST rechazarse si `EstadoInscripciones.abierta`
es `true` (FR-001) o si el juego tiene menos de 2 inscriptos (FR-005) o si ya
existe un `Bracket` para ese juego (FR-008, inmutabilidad). La asignación de
jugadores y de "bye" MUST ser aleatoria, sin seeding (ver research.md).

**Scale/Scope**: Mismo volumen que 001 (decenas de jugadores por juego); el
algoritmo de generación corre una sola vez por juego, no en caliente por
request repetido.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Gate | Estado |
|-----------|------|--------|
| I. Seguridad de Tipos | Sin `any`; toda función con tipo de retorno explícito | PASS — aplica en `server/src/services/bracket.ts` y tipos de `/shared/types/bracket.ts` |
| II. Spec-First | Spec aprobada antes de codear | PASS — `spec.md` ya validado (checklist 16/16) |
| III. Capa de Servicios para Fetching | Sin `fetch` embebido en JSX; llamadas vía `/client/src/services` | PASS — el botón "Generar bracket" llama a `client/src/services/bracket.ts`, no hace `fetch` inline |
| IV. Separación de Responsabilidades | Lógica de negocio fuera de componentes UI y controladores | PASS — algoritmo de generación vive en `server/src/services/bracket.ts`; el controlador solo orquesta request/response |
| V. Dependencias y Convenciones Aprobadas | No instalar librerías sin aprobar; rutas bajo `/server/src/routes` con prefijo `/api/`; naming conventions | PASS — sin dependencias nuevas (shuffle aleatorio con `crypto.randomInt` nativo, no librerías de terceros) |

Sin violaciones. No aplica Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/004-generar-bracket-torneo/
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
│   │   └── admin/
│   │       └── GenerarBracketButton.tsx   # Componente puro: confirma y dispara generación
│   ├── pages/
│   │   └── AdminBracketPage.tsx           # ya existe parcialmente vía 005; agrega acción de generar
│   └── services/
│       └── bracket.ts                     # wrapper fetch: generarBracket(juego)
└── tests/
    └── unit/
        └── GenerarBracketButton.test.tsx

server/
├── src/
│   ├── routes/
│   │   └── admin-bracket.routes.ts        # POST /api/admin/brackets/:juego/generar
│   ├── controllers/
│   │   └── admin-bracket.controller.ts
│   └── services/
│       └── bracket.ts                     # generarBracket(): shuffle, asignación, byes, punteros
├── prisma/
│   └── schema.prisma                      # Bracket, Partido (esquema canónico, compartido con 005)
└── tests/
    ├── contract/
    │   └── admin-bracket-generar.test.ts
    ├── integration/
    │   └── generar-bracket-completo.test.ts
    └── unit/
        └── bracket-shuffle.test.ts

shared/
└── types/
    └── bracket.ts                         # tipos compartidos: Bracket, Partido, FormatoBracket (consumidos también por 005)
```

**Structure Decision**: Mismos proyectos `/client` y `/server` de las
features previas; esta feature agrega el namespace `admin-bracket-*` y es la
propietaria canónica del esquema Prisma `Bracket`/`Partido` que 005 consume.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Sin violaciones — tabla no aplica.
