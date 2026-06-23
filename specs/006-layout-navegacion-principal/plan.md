# Implementation Plan: Layout Principal con Navegación

**Branch**: `006-layout-navegacion-principal` | **Date**: 2026-06-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-layout-navegacion-principal/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Se agrega un layout principal (`AppLayout`) que envuelve todas las rutas de
`/client` y muestra una navegación que cambia según el estado de sesión: para
visitantes sin sesión, un enlace visible al login de admin; para el admin con
sesión iniciada, accesos a listado de inscritos, bracket FC25, bracket Call of
Duty y "Cerrar sesión". El bracket combinado de 005 se separa en dos
destinos de navegación independientes (uno por juego), reutilizando la misma
lógica de carga/registro de resultado ya implementada. Sin cambios de
backend: el cierre de sesión solo limpia el token en memoria del cliente
(`authStore.ts`), igual que ya lo hace el login al guardarlo.

## Technical Context

**Language/Version**: TypeScript 5.x en React 18 + Vite (frontend,
`/client`). Esta feature no modifica `/server`.

**Primary Dependencies**: `react-router-dom` (ya aprobado y en uso desde
002-login-admin) para anidar rutas bajo el layout vía `Outlet`; React;
Tailwind CSS. Sin dependencias nuevas.

**Storage**: N/A — no se agrega ni modifica persistencia; reutiliza los datos
ya servidos por 001/002/004/005.

**Testing**: Sin tests automatizados nuevos (no solicitados en la spec);
validación manual vía `quickstart.md`, igual que 004 y 005.

**Target Platform**: Web — SPA servida por Vite, consumida en navegador.

**Project Type**: Aplicación web con frontend y backend separados, pero esta
feature solo toca `/client` (sin cambios en `/server` ni en `/server/prisma`).

**Performance Goals**: Cambiar de sección vía la navegación MUST sentirse
instantáneo (sin recarga completa de página), navegación cliente vía
`react-router-dom` (SC-002).

**Constraints**: Reutilizar el mecanismo de sesión existente (`authStore.ts`,
token JWT en memoria) sin modificarlo; "cerrar sesión" MUST resolverse
client-side (limpiar el token), sin nuevo endpoint de backend, porque el JWT
ya es stateless (no hay sesión que invalidar server-side).

**Scale/Scope**: Mismo volumen que features previas; cambio acotado a
layout/routing/navegación del frontend y a separar el bracket combinado en
dos páginas (una por juego).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Gate | Estado |
|-----------|------|--------|
| I. Seguridad de Tipos | Sin `any`; toda función con tipo de retorno explícito | PASS — aplica en `AppLayout.tsx`, `NavBar.tsx` y la nueva `BracketJuegoPanel.tsx` |
| II. Spec-First | Spec aprobada antes de codear | PASS — `spec.md` ya validado (checklist 16/16) |
| III. Capa de Servicios para Fetching | Sin `fetch` embebido en JSX; llamadas vía `/client/src/services` | PASS — no se agregan llamadas nuevas a la API; cerrar sesión solo llama `limpiarToken()` de `authStore.ts` (ya existente, no es `fetch`) |
| IV. Separación de Responsabilidades | Lógica de negocio fuera de componentes UI y controladores | PASS — `AppLayout`/`NavBar` solo leen `getToken()` para decidir qué nav mostrar (presentación), sin lógica de negocio; la carga de bracket por juego se reutiliza desde la lógica ya existente, ahora en `BracketJuegoPanel.tsx` en lugar de duplicada |
| V. Dependencias y Convenciones Aprobadas | No instalar librerías sin aprobar; rutas/convenciones de nombrado | PASS — sin dependencias nuevas; `react-router-dom` ya aprobado (2026-06-20); nombres siguen PascalCase/camelCase/kebab-case definidos |

Sin violaciones. No aplica Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/006-layout-navegacion-principal/
├── plan.md              # This file (/speckit-plan command output)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No se genera `research.md` (sin incógnitas técnicas: stack y patrones ya
establecidos por features previas) ni `contracts/` (sin cambios de API;
asunción documentada en `spec.md`).

### Source Code (repository root)

```text
client/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx          # Envuelve <Outlet/>; decide nav pública vs admin según getToken()
│   │   │   ├── NavPublica.tsx         # Enlace visible a /admin/login
│   │   │   └── NavAdmin.tsx           # Enlaces a inscritos / bracket FC25 / bracket COD + Cerrar sesión
│   │   └── brackets/
│   │       └── BracketJuegoPanel.tsx  # Extraído de AdminBracketPage: carga+muestra el bracket de un solo juego (reutilizado por las dos páginas nuevas)
│   ├── pages/
│   │   ├── AdminBracketFc25Page.tsx   # Reemplaza la mitad FC25 de AdminBracketPage
│   │   └── AdminBracketCodPage.tsx    # Reemplaza la mitad COD_BO2 de AdminBracketPage
│   └── App.tsx                        # Rutas anidadas bajo <AppLayout>; agrega /admin/bracket/fc25 y /admin/bracket/cod-bo2, retira /admin/bracket combinado
└── tests/
    └── unit/
        └── NavAdmin.test.tsx
```

**Structure Decision**: Cambio acotado a `/client`; no se modifica `/server`
ni `/shared/types`. `AdminBracketPage.tsx` (005) se reemplaza por dos páginas
delgadas que reutilizan `BracketJuegoPanel.tsx`, evitando duplicar la lógica
de carga/registro de resultado ya validada en 005.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Sin violaciones — tabla no aplica.
