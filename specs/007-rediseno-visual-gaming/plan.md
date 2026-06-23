# Implementation Plan: Rediseño Visual con Estética Gaming

**Branch**: `007-rediseno-visual-gaming` | **Date**: 2026-06-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-rediseno-visual-gaming/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Rediseño puramente visual de las 5 superficies existentes (inscripción,
login admin, panel admin, bracket, registro de resultados): fondo
`#0a0a0a`, primario `#00ff87`, tipografía Rajdhani, tarjetas oscuras
(`#111111`/`#1a1a1a`) con bordes sutiles (`#2a2a2a`), conforme al Principio
VI de la constitución y al detalle de `/constitution.md` (sección "Diseño —
Estética Gaming"). Se modela la paleta como tokens semánticos en
`tailwind.config.cjs` (en vez de hex sueltos en JSX, por Principio IV) y se
reemplazan las clases Tailwind de color/tipografía existentes en los 12
componentes que las usan. Cero cambios de lógica, estado, props, rutas o
llamadas a la API (FR-006) — solo `className`.

## Technical Context

**Language/Version**: TypeScript 5.x en React 18 + Vite (frontend,
`/client`). Esta feature no modifica `/server`.

**Primary Dependencies**: Tailwind CSS (config extendido con tokens de
paleta/tipografía, ya aprobado); Rajdhani vía Google Fonts (`<link>` en
`index.html`, sin paquete npm nuevo, conforme Principio V — no es una
dependencia instalada, es un recurso externo igual que cualquier CDN de
fuentes). Sin librerías nuevas.

**Storage**: N/A — sin entidades de datos; cambio exclusivamente de
estilos.

**Testing**: Sin tests automatizados nuevos (no solicitados en la spec);
validación manual vía `quickstart.md`. La verificación de "cero
regresiones funcionales" (SC-002) se hace recorriendo manualmente cada
flujo existente tras el cambio de estilos, igual que en 004/005/006.

**Target Platform**: Web — SPA Vite, consumida en navegador.

**Project Type**: Aplicación web con frontend y backend separados, pero
esta feature solo toca `/client` (estilos), sin cambios en `/server` ni en
`/shared/types`.

**Performance Goals**: La carga de la tipografía Rajdhani vía Google Fonts
no MUST introducir demora perceptible en la primera pintura (SC-004); se
usa `<link rel="preconnect">` + `display=swap` para evitar bloqueo de
render.

**Constraints**: Cero cambios de comportamiento (FR-006): solo se tocan
`className`/CSS, nunca props, handlers, llamadas a `services/`, rutas o
validaciones. Los valores de color/tipografía MUST venir de los tokens
definidos en `tailwind.config.cjs` (Principio IV — sin hex hardcodeado en
JSX). Los estados semánticos (error/éxito/advertencia/deshabilitado)
MUST seguir siendo distinguibles entre sí y respecto al verde primario de
marca (FR-007, Edge Case de spec.md sobre confusión "acción primaria" vs
"éxito").

**Scale/Scope**: 12 componentes existentes en `/client/src/components`
(inscripción ×2, admin ×5, brackets ×2, layout ×3) más
`tailwind.config.cjs`, `index.css` e `index.html`. Sin componentes ni
páginas nuevas, sin endpoints nuevos.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Gate | Estado |
|-----------|------|--------|
| I. Seguridad de Tipos | Sin `any`; toda función con tipo de retorno explícito | PASS — no se toca ninguna firma de función, solo `className` |
| II. Spec-First | Spec aprobada antes de codear | PASS — `spec.md` validado (checklist 16/16) |
| III. Capa de Servicios para Fetching | Sin `fetch` embebido en JSX | PASS — no se agrega ni modifica ninguna llamada a la API |
| IV. Separación de Responsabilidades | Lógica de negocio fuera de UI; no hardcodear strings de colores, MUST usar clases de Tailwind | PASS — paleta modelada como tokens en `tailwind.config.cjs`, consumidos vía clases Tailwind (`bg-bg-card`, `text-primary`, etc.), nunca hex inline en JSX |
| V. Dependencias y Convenciones Aprobadas | No instalar librerías sin aprobar | PASS — sin dependencias npm nuevas; Rajdhani vía `<link>` de Google Fonts, no paquete |
| VI. Identidad Visual Gaming | Fondo `#0a0a0a`, primario `#00ff87`, Rajdhani, cards oscuras con bordes sutiles, legibilidad obligatoria | PASS — gate principal de esta feature; valores tomados literalmente del principio y de `/constitution.md` |

Sin violaciones. No aplica Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/007-rediseno-visual-gaming/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No se genera `data-model.md` (sin entidades: cambio puramente visual, spec
no declara Key Entities) ni `contracts/` (sin cambios de API ni de
interfaces — asunción documentada en `spec.md`).

### Source Code (repository root)

```text
client/
├── index.html                                  # agrega <link> Google Fonts (Rajdhani, preconnect + swap)
├── tailwind.config.cjs                         # theme.extend: colors (bg.base/card/alt, primary, edge, text.secondary) + fontFamily.sans
├── src/
│   ├── index.css                               # @layer base: body con bg-bg-base, text-white, font-sans
│   ├── components/
│   │   ├── inscripcion/
│   │   │   ├── InscripcionForm.tsx             # inputs, botón primario, mensaje de éxito
│   │   │   └── InscripcionesCerradas.tsx       # aviso (advertencia)
│   │   ├── admin/
│   │   │   ├── LoginForm.tsx                   # inputs, botón primario
│   │   │   ├── ListadoJugadores.tsx            # tabla (filas alternas)
│   │   │   ├── ConfirmarEliminacion.tsx        # modal (overlay + card)
│   │   │   ├── ToggleInscripciones.tsx         # botón secundario
│   │   │   └── GenerarBracketButton.tsx        # botón primario + mensaje de error
│   │   ├── brackets/
│   │   │   ├── BracketView.tsx                 # tarjetas de partido, texto de campeón
│   │   │   └── ResultadoForm.tsx               # inputs, select, botón primario, error
│   │   └── layout/
│   │       ├── AppLayout.tsx                   # fondo general, separador de nav
│   │       ├── NavPublica.tsx                  # enlace
│   │       └── NavAdmin.tsx                    # enlaces + botón "Cerrar sesión"
└── tests/
    └── unit/
        └── (sin tests nuevos; no solicitados)
```

**Structure Decision**: Cambio acotado a `/client` (estilos únicamente); no
se modifica `/server`, `/server/prisma` ni `/shared/types`. Ningún archivo
de `/client/src/pages` requiere cambios propios (son contenedores delgados
sin clases de color/tipografía propias — heredan el estilo de los
componentes que renderizan).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Sin violaciones — tabla no aplica.
