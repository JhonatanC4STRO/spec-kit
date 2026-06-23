# Implementation Plan: Landing Page Pública estilo EA Sports FC 26

**Branch**: `008-landing-fc26-style` | **Date**: 2026-06-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-landing-fc26-style/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Nueva landing pública estática estilo EA Sports FC 26, montada en una ruta
nueva (`/home`) totalmente separada de las 5 superficies existentes y del
flujo de `AppLayout`/`NavPublica`/`NavAdmin`: 8 componentes nuevos
(`LandingNavbar`, `Hero`, `NewsGrid`, `RatingsFeature`, `Authenticity`,
`ProductGrid`, `MobileFeature`, `Footer`) renderizados por una página nueva
(`LandingPage.tsx`), con su propio navbar fijo y footer (no reutiliza los
existentes, que son auth-aware y no aplican a esta superficie). Paleta
oscura + verde neón reutilizando los tokens de `tailwind.config.cjs` ya
definidos en 007; tipografía Inter cargada vía Google Fonts y aplicada solo
al subárbol de la landing mediante un token Tailwind nuevo (`font-landing`),
conforme a la excepción nominal agregada al Principio VI
(constitución v2.3.0). Contenido de noticias/ratings/productos/autenticidad
es estático/hardcodeado en los componentes — sin fetch, sin entidades
nuevas. Cero cambios a `/server`, `/shared/types` ni a los componentes/rutas
existentes (FR-011).

## Technical Context

**Language/Version**: TypeScript 5.x en React 18 + Vite (frontend,
`/client`). Esta feature no modifica `/server`.

**Primary Dependencies**: Tailwind CSS (config extendida con un token de
tipografía adicional, sin plugins nuevos); Inter vía Google Fonts (`<link>`
en `index.html`, mismo patrón que Rajdhani — sin paquete npm nuevo,
conforme Principio V); `react-router-dom` (ya instalado) para el `<Link>`
del CTA del hero y del ícono de perfil. Sin librerías nuevas.

**Storage**: N/A — sin entidades de datos; todo el contenido de
noticias/ratings/productos/autenticidad es estático/hardcodeado en JSX.

**Testing**: Sin tests automatizados nuevos (no solicitados en la spec,
consistente con el resto del proyecto que no tiene test runner
configurado); validación manual vía `quickstart.md` cubriendo los 3 rangos
de viewport y la ausencia de errores de consola/enlaces rotos (SC-001 a
SC-004).

**Target Platform**: Web — SPA Vite, consumida en navegador.

**Project Type**: Aplicación web con frontend y backend separados; esta
feature solo toca `/client` (nueva ruta + componentes), sin cambios en
`/server` ni en `/shared/types`.

**Performance Goals**: La carga de Inter vía Google Fonts no MUST introducir
demora perceptible en la primera pintura; se usa `<link rel="preconnect">`
+ `display=swap`, igual que el `<link>` de Rajdhani ya existente.

**Constraints**: Cero cambios de comportamiento en superficies existentes
(FR-011): la landing vive en una rama de rutas separada (fuera del
`<Route element={<AppLayout/>}>` existente), por lo que no reutiliza ni
altera `AppLayout`, `NavPublica`, `NavAdmin` ni ningún componente de
`/client/src/components` ya restilizado en 007. La tipografía Inter MUST
quedar acotada al subárbol de la landing (clase en su contenedor raíz, no
en `body`), para no romper Rajdhani en el resto del sitio. Los breakpoints
768px/1200px de la spec (FR-008) MUST expresarse como clases Tailwind
declarativas, no valores inline — el breakpoint de 1200px no coincide con
ningún breakpoint por defecto de Tailwind (`lg`=1024, `xl`=1280), por lo que
se agrega un breakpoint nombrado nuevo.

**Scale/Scope**: 1 página nueva (`LandingPage.tsx`), 8 componentes nuevos en
`client/src/components/landing/`, 1 ruta nueva en `App.tsx`, más cambios
aditivos en `tailwind.config.cjs` e `index.html`. Sin componentes ni
endpoints existentes modificados.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Gate | Estado |
|-----------|------|--------|
| I. Seguridad de Tipos | Sin `any`; toda función con tipo de retorno explícito | PASS — los 9 componentes/página nuevos son funciones TS con retorno `JSX.Element` explícito |
| II. Spec-First | Spec aprobada antes de codear | PASS — `spec.md` validado (checklist 16/16) |
| III. Capa de Servicios para Fetching | Sin `fetch` embebido en JSX | PASS — la landing no hace ninguna llamada a la API (contenido 100% estático, FR-006) |
| IV. Separación de Responsabilidades | Lógica de negocio fuera de UI; no hardcodear strings de colores, MUST usar clases de Tailwind | PASS — componentes puros sin lógica de negocio; colores y el breakpoint de 1200px se modelan como tokens de `tailwind.config.cjs`, nunca hex/píxeles inline en JSX |
| V. Dependencias y Convenciones Aprobadas | No instalar librerías sin aprobar; convenciones de nombrado | PASS — sin dependencias npm nuevas (Inter vía `<link>`, mismo patrón que Rajdhani); componentes en PascalCase bajo `client/src/components/landing/` |
| VI. Identidad Visual Gaming | Paleta oscura + verde neón + tipografía de marca, legibilidad obligatoria | PASS — paleta oscura/verde neón de los tokens existentes se reutiliza sin cambios; la excepción de tipografía (Inter en vez de Rajdhani, exclusiva de esta landing) ya está incorporada al Principio VI en la constitución v2.3.0, sin bloqueo de gobernanza |

Sin violaciones. No aplica Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/008-landing-fc26-style/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No se genera `data-model.md` (sin entidades: el contenido de
noticias/ratings/productos/autenticidad es estático, spec no declara Key
Entities) ni `contracts/` (sin cambios de API ni de interfaces — esta
feature no agrega ni modifica endpoints).

### Source Code (repository root)

```text
client/
├── index.html                                  # agrega <link> Google Fonts (Inter, preconnect + swap), junto al de Rajdhani ya existente
├── tailwind.config.cjs                         # theme.extend: fontFamily.landing (Inter) + screens.wide (1200px), aditivo — no toca fontFamily.sans ni colors existentes
├── src/
│   ├── App.tsx                                  # agrega <Route path="/home" element={<LandingPage />} /> FUERA del <Route element={<AppLayout/>}> existente (sin nav/layout compartido)
│   ├── pages/
│   │   └── LandingPage.tsx                      # ensambla las 8 secciones en el orden de FR-002, aplica `font-landing` en su contenedor raíz
│   └── components/
│       └── landing/
│           ├── LandingNavbar.tsx               # navbar fija, logo, dropdowns (Games/Ratings/FC FUTURES/FC Pro/Estadísticas/Novedades/Comunidad), ícono perfil → Link a /admin/login
│           ├── Hero.tsx                        # "Ultimate Edition", logo grande, H1, descripción, CTA "Juega ya" → Link a "/"
│           ├── NewsGrid.tsx                    # título + botón "Explorar" (← →) + 4 tarjetas de noticia placeholder
│           ├── RatingsFeature.tsx              # dos columnas: texto + card degradado "Full Ratings Database" / "Live Now"
│           ├── Authenticity.tsx                # layout inverso: texto con estadísticas + imagen placeholder
│           ├── ProductGrid.tsx                 # título + 3 tarjetas de producto (badges, precio)
│           ├── MobileFeature.tsx               # badge + H2 + descripción + CTA "Jugar"
│           └── Footer.tsx                      # redes sociales, logos EA/FC, selector de idioma, "Volver arriba", links, legal
```

**Structure Decision**: Cambio acotado a `/client` (página + componentes
nuevos, ruta nueva, tokens aditivos en Tailwind/index.html); no se modifica
`/server`, `/server/prisma` ni `/shared/types`. La landing se monta como
rama de rutas independiente de `<Route element={<AppLayout/>}>` —
`AppLayout` decide su nav (`NavPublica`/`NavAdmin`) según haya o no token de
sesión, lo que no aplica a la navbar EA-style de esta landing; envolverla en
`AppLayout` produciría dos navbars apiladas. Ningún componente de
`client/src/components/{admin,brackets,inscripcion,layout}` (los 12
restilizados en 007) se modifica.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Sin violaciones — tabla no aplica.
