# Implementation Plan: Panel Admin de Jugadores Inscritos

**Branch**: `003-panel-admin-jugadores` | **Date**: 2026-06-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-panel-admin-jugadores/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

El admin ve, desde una vista protegida, el listado de inscripciones separado
por juego (reutilizando la entidad `Inscripcion` de 001) y puede eliminar un
jugador inscrito (liberando su nickname) y abrir/cerrar inscripciones
(reutilizando el endpoint ya definido en 001, sin redefinirlo). Esta feature
no agrega tablas nuevas: solo nuevos endpoints de lectura/eliminación sobre
datos existentes, protegidos por el middleware de sesión de
002-login-admin.

## Technical Context

**Language/Version**: TypeScript 5.x en dos proyectos separados: React 18 +
Vite (frontend, `/client`) y Node.js + Express (backend, `/server`).

**Primary Dependencies**: Backend: Express, Prisma. Frontend: React, Vite,
Tailwind CSS. Sin dependencias nuevas.

**Storage**: PostgreSQL vía Prisma — reutiliza `Inscripcion` y
`EstadoInscripciones` (ambas definidas en 001-inscripcion-torneo); sin
cambios de esquema para esta feature.

**Testing**: Vitest para unit/integration del listado agrupado por juego y de
la eliminación.

**Target Platform**: Web — backend Express expuesto como API REST bajo
`/api/admin/`, frontend SPA con vista de panel protegida por sesión.

**Project Type**: Aplicación web con frontend y backend como proyectos
separados: `/client` (React + Vite) y `/server` (Node.js + Express).

**Performance Goals**: Ubicar y eliminar un jugador específico en menos de
30 segundos desde que se abre el panel (SC-001).

**Constraints**: Todas las rutas de este panel MUST estar protegidas por el
middleware de sesión admin de 002-login-admin (`auth.middleware.ts`).
Eliminar un jugador MUST liberar su nickname de inmediato para ese juego
(consecuencia automática de borrar la fila bajo el constraint único de 001,
sin lógica adicional).

**Scale/Scope**: Mismo volumen que 001 (torneo comunitario, sin
paginación necesaria en esta versión).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Gate | Estado |
|-----------|------|--------|
| I. Seguridad de Tipos | Sin `any`; toda función con tipo de retorno explícito | PASS — aplica en `server/src/services/inscripciones.ts` (extendido) y `client/src/services/inscripciones.ts` |
| II. Spec-First | Spec aprobada antes de codear | PASS — `spec.md` ya validado (checklist 16/16) |
| III. Capa de Servicios para Fetching | Sin `fetch` embebido en JSX; llamadas vía `/client/src/services` | PASS — `ListadoJugadores` y el toggle de estado llaman a `client/src/services/inscripciones.ts`, no hacen `fetch` inline |
| IV. Separación de Responsabilidades | Lógica de negocio fuera de componentes UI y controladores | PASS — agrupar por juego y eliminar viven en `server/src/services/inscripciones.ts`; el controlador solo orquesta request/response |
| V. Dependencias y Convenciones Aprobadas | No instalar librerías sin aprobar; rutas bajo `/server/src/routes` con prefijo `/api/`; naming conventions | PASS — sin dependencias nuevas; reutiliza contrato de estado de 001 en vez de duplicarlo |

Sin violaciones. No aplica Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/003-panel-admin-jugadores/
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
│   │       ├── ListadoJugadores.tsx       # Componente puro: tabla por juego
│   │       └── ConfirmarEliminacion.tsx   # Componente puro: modal de confirmación
│   ├── pages/
│   │   └── AdminJugadoresPage.tsx         # carga listado + control de estado de inscripciones
│   └── services/
│       └── inscripciones.ts               # extiende 001: getListadoAdmin(), eliminarJugador()
└── tests/
    └── unit/
        └── ListadoJugadores.test.tsx

server/
├── src/
│   ├── routes/
│   │   └── admin-inscripciones.routes.ts  # GET /api/admin/inscripciones, DELETE /api/admin/inscripciones/:id
│   ├── controllers/
│   │   └── admin-inscripciones.controller.ts
│   └── services/
│       └── inscripciones.ts               # extiende 001: listarAgrupadoPorJuego(), eliminar()
└── tests/
    ├── contract/
    │   └── admin-inscripciones.test.ts
    └── integration/
        └── eliminar-jugador.test.ts
```

**Structure Decision**: Mismos proyectos `/client` y `/server` de 001 y 002;
esta feature solo agrega rutas/servicios bajo el namespace `admin-*`,
protegidos por el middleware ya definido en 002. No se crean tipos nuevos en
`/shared/types` (reutiliza `Inscripcion` de 001).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Sin violaciones — tabla no aplica.
