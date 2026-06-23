---

description: "Task list template for feature implementation"
---

# Tasks: Landing Page Pública estilo EA Sports FC 26

**Input**: Design documents from `/specs/008-landing-fc26-style/`

**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: No solicitados explícitamente en la spec; no se incluyen tareas
de test dedicadas (consistente con el resto del proyecto, sin test runner
configurado). La validación end-to-end (las 6 escenarios de
`quickstart.md`, incluyendo cero regresiones en superficies existentes
FR-011/SC-002 y cero errores de consola/enlaces rotos FR-007/SC-004) se
cubre en el Polish phase.

**Organization**: Tareas agrupadas por user story. Toda la feature vive en
archivos nuevos bajo `client/src/pages/LandingPage.tsx` y
`client/src/components/landing/`, más cambios aditivos en
`client/tailwind.config.cjs`, `client/index.html` y `client/src/App.tsx`.
Cero cambios en `/server`, `/shared/types` ni en ningún componente existente
de `client/src/components/{admin,brackets,inscripcion,layout}`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede correr en paralelo (archivos distintos, sin dependencias)
- **[Story]**: A qué user story pertenece (US1, US2, US3)
- Rutas de archivo exactas en cada descripción

## Path Conventions

Toca únicamente archivos nuevos en `client/src/pages/` y
`client/src/components/landing/`, más 3 archivos existentes tocados de
forma aditiva (`client/tailwind.config.cjs`, `client/index.html`,
`client/src/App.tsx`) para registrar la ruta/tokens nuevos sin modificar lo
ya existente en ellos.

---

## Phase 1: Setup

**Purpose**: Confirmar que no se requiere infraestructura/dependencias nuevas

- [X] T001 Confirmar que no se instala ningún paquete npm nuevo: Inter se
  carga vía `<link>` de Google Fonts en `client/index.html`, mismo patrón
  que Rajdhani ya existente; `react-router-dom` ya está instalado para los
  `<Link>` de navegación real (ver research.md secciones 2 y 5)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tokens de tipografía/breakpoint y la ruta/página base — bloquea
las 3 user stories, porque ningún componente de la landing puede existir
sin la ruta que lo monte ni los tokens que referenciará

**⚠️ CRITICAL**: Ninguna user story puede empezar hasta completar esta fase

- [X] T002 [P] Extender `client/tailwind.config.cjs` con
  `theme.extend.fontFamily.landing` (`Inter`, `system-ui`, `sans-serif`) y
  `theme.extend.screens.wide` (`1200px`), de forma aditiva — sin tocar
  `fontFamily.sans` ni `colors` ya existentes (ver research.md secciones 2
  y 3)
- [X] T003 [P] Agregar `<link rel="preconnect">` + `<link>` de Google Fonts
  (familia Inter) en `client/index.html`, junto al `<link>` de Rajdhani ya
  existente, sin removerlo (ver research.md sección 2)
- [X] T004 Crear `client/src/pages/LandingPage.tsx`: contenedor raíz con
  clase `font-landing`, importando y renderizando placeholders vacíos de
  los 8 componentes de `client/src/components/landing/` en el orden de
  FR-002 (depende de T002, T003)
- [X] T005 Modificar `client/src/App.tsx`: agregar
  `<Route path="/home" element={<LandingPage />} />` **fuera** del
  `<Route element={<AppLayout/>}>` existente, sin alterar ninguna ruta ya
  registrada (depende de T004; ver research.md sección 1)

**Checkpoint**: Ruta `/home` montada con tokens listos — las 3 user stories
pueden empezar

---

## Phase 3: User Story 1 - Visitante descubre la plataforma a través de la landing (Priority: P1) 🎯 MVP

**Goal**: Las 8 secciones completas, en el orden correcto, con contenido
estático/ilustrativo y los 2 enlaces reales funcionando (FR-001 a FR-006,
FR-009 a FR-011).

**Independent Test**: Abrir `/home` → se ven las 8 secciones en orden; clic
en "Juega ya" lleva a `/`; clic en el ícono de perfil lleva a
`/admin/login`; todo el contenido de noticias/ratings/productos/
autenticidad es claramente genérico.

### Implementation for User Story 1

- [X] T006 [P] [US1] Crear `client/src/components/landing/LandingNavbar.tsx`:
  navbar fija con fondo oscuro semitransparente, logo a la izquierda, los 7
  ítems de menú (Games, Ratings, FC FUTURES, FC Pro, Estadísticas,
  Novedades, Comunidad) como etiquetas estáticas, e ícono de perfil con
  `<Link to="/admin/login">`
- [X] T007 [P] [US1] Crear `client/src/components/landing/Hero.tsx`:
  etiqueta "ULTIMATE EDITION", logo/título H1, descripción de 3-4 líneas,
  imagen de cover art placeholder, y botón CTA "Juega ya" con
  `<Link to="/">`
- [X] T008 [P] [US1] Crear `client/src/components/landing/NewsGrid.tsx`:
  título "Noticias de EA SPORTS FC™", control "Explorar" (← →), y 4
  tarjetas de noticia placeholder (imagen, badge "Artículo de noticias",
  fecha, título corto, descripción truncada con "...", la última con
  diseño destacado tipo "Soundtrack")
- [X] T009 [P] [US1] Crear `client/src/components/landing/RatingsFeature.tsx`:
  columna izquierda con título H2 + descripción + botón "Más información";
  columna derecha con card de degradado, logo del juego, texto "Full
  Ratings Database", 3 cartas doradas superpuestas (placeholder), botón
  "Live Now"
- [X] T010 [P] [US1] Crear `client/src/components/landing/Authenticity.tsx`:
  layout inverso (texto izquierda, foto placeholder derecha), título H2
  "Autenticidad", párrafo con estadísticas (20.000+ futbolistas, 750+
  clubes, 120+ estadios, 35+ ligas), botón "Más información"
- [X] T011 [P] [US1] Crear `client/src/components/landing/ProductGrid.tsx`:
  título "Más EA SPORTS FC™" y grid de 3 tarjetas de producto (imagen
  cover placeholder, badges "Juego básico"/"Deportes", nombre en negrita,
  precio con badge de descuento opcional)
- [X] T012 [P] [US1] Crear `client/src/components/landing/MobileFeature.tsx`:
  imagen de jugador en campo placeholder, badge "Donde sea por el Club",
  título H2 "EA SPORTS FC™ Mobile", descripción con estadísticas, botón CTA
  "Jugar"
- [X] T013 [P] [US1] Crear `client/src/components/landing/Footer.tsx`: fila
  de íconos sociales (YouTube, TikTok, Twitter/X, Facebook), fila de logos
  EA/FC + selector de idioma + botón "Volver arriba", fila de links de
  navegación (Inicio, Noticias, EA app para Windows, EA app para Mac),
  texto legal y copyright
- [X] T014 [US1] Completar `client/src/pages/LandingPage.tsx`: reemplazar
  los placeholders de T004 por los 8 componentes reales de T006-T013, en el
  orden exacto de FR-002 (depende de T006-T013)

**Checkpoint**: User Story 1 funcional de forma independiente — landing
completa visible en `/home`, CTA y perfil navegando a rutas reales (MVP)

---

## Phase 4: User Story 2 - Visitante navega la landing en distintos tamaños de pantalla (Priority: P2)

**Goal**: Las 8 secciones se reorganizan de forma legible en los 3 rangos
de viewport (`<768px`, `768–1199px`, `≥1200px`) sin desbordes ni overlap
(FR-008).

**Independent Test**: Cargar `/home` en 375px, 900px y 1440px de ancho →
en cada uno las secciones de múltiples columnas se ven correctamente
apiladas o en columnas según el rango, sin scroll horizontal ni texto/
imágenes solapadas, y la navbar no recorta sus opciones en mobile.

### Implementation for User Story 2

- [X] T015 [P] [US2] Ajustar `client/src/components/landing/Hero.tsx`:
  layout de dos columnas (50/50) en `wide:`, apilado de una columna por
  defecto (mobile), intermedio legible en `md:`
- [X] T016 [P] [US2] Ajustar `client/src/components/landing/NewsGrid.tsx`:
  grid horizontal de 4 tarjetas en `wide:`, columnas reducidas/apiladas por
  defecto y en `md:`, sin desborde horizontal
- [X] T017 [P] [US2] Ajustar `client/src/components/landing/RatingsFeature.tsx`:
  dos columnas en `wide:`, apilado (texto sobre card visual) por defecto y
  en `md:`
- [X] T018 [P] [US2] Ajustar `client/src/components/landing/Authenticity.tsx`:
  layout inverso de dos columnas en `wide:`, apilado por defecto y en `md:`
- [X] T019 [P] [US2] Ajustar `client/src/components/landing/ProductGrid.tsx`:
  grid de 3 columnas en `wide:`/`md:`, una columna por defecto (mobile)
- [X] T020 [P] [US2] Ajustar `client/src/components/landing/MobileFeature.tsx`:
  layout de dos columnas en `wide:`/`md:`, apilado por defecto (mobile)
- [X] T021 [US2] Ajustar `client/src/components/landing/LandingNavbar.tsx`:
  asegurar que los 7 ítems de menú y el ícono de perfil permanecen
  accesibles (sin recortarse ni desbordar) en el rango `<768px`

**Checkpoint**: User Stories 1 y 2 funcionan juntas — landing completa y
responsive en los 3 rangos de viewport

---

## Phase 5: User Story 3 - Visitante interactúa con elementos no funcionales de forma predecible (Priority: P3)

**Goal**: Dropdowns e ítems puramente ilustrativos responden con feedback
visual consistente, sin enlaces rotos ni errores de consola (FR-007,
FR-010).

**Independent Test**: Pasar el cursor sobre cada ítem del navbar y sobre
cada botón ilustrativo ("Más información", "Explorar", "Live Now",
"Jugar") → todos muestran hover/transición de 200ms; ningún clic navega a
una URL rota ni genera error en consola.

### Implementation for User Story 3

- [X] T022 [US3] Implementar en `client/src/components/landing/LandingNavbar.tsx`
  el toggle de cada dropdown como `<button type="button">` con estado local
  (abrir/cerrar al hover o clic), sin usar `href="#"` ni `<Link to="#">`
  (ver research.md sección 4)
- [X] T023 [P] [US3] Implementar en `client/src/components/landing/NewsGrid.tsx`
  las flechas de navegación (← →) del control "Explorar" como
  `<button type="button">` con efecto de hover y transición de 200ms, sin
  navegar a ninguna URL
- [X] T024 [P] [US3] Implementar en `client/src/components/landing/RatingsFeature.tsx`
  los botones "Más información" y "Live Now" como `<button type="button">`
  con hover/transición de 200ms, sin navegar a ninguna URL
- [X] T025 [P] [US3] Implementar en `client/src/components/landing/Authenticity.tsx`
  el botón "Más información" como `<button type="button">` con hover/
  transición de 200ms, sin navegar a ninguna URL
- [X] T026 [P] [US3] Implementar en `client/src/components/landing/MobileFeature.tsx`
  el botón "Jugar" como `<button type="button">` con hover/transición de
  200ms, sin navegar a ninguna URL (ilustrativo, distinto del CTA real del
  hero)

**Checkpoint**: Las 3 user stories funcionan de forma independiente y
conjunta — landing completa, responsive e interactiva sin enlaces rotos

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validación final y limpieza

- [X] T027 [P] Ejecutar manualmente los 6 escenarios de `quickstart.md`:
  contenido completo en orden (SC-001), CTA hacia inscripción real sin
  regresión (FR-004/FR-011/SC-002/SC-003), ícono de perfil hacia admin
  (FR-005), responsive en los 3 rangos de viewport (FR-008), elementos
  ilustrativos sin errores de consola ni enlaces rotos (FR-007/SC-004), y
  tipografía/paleta acotadas correctamente (Inter solo en `/home`, Rajdhani
  intacta en el resto del sitio)
- [X] T028 [P] Revisar que no haya hex hardcodeado en JSX (`bg-[#`,
  `style={{`) ni `any`/`fetch` en los 9 archivos nuevos
  (`LandingPage.tsx` + 8 componentes de `client/src/components/landing/`)
  ni en los 3 archivos tocados de forma aditiva (principios I, III, IV) —
  verificar por grep y `eslint`/`tsc -b`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA las 3 user
  historias (sin la ruta `/home` ni los tokens de T002, ningún componente
  de la landing puede montarse ni referenciar `font-landing`/`wide:`)
- **User Stories (Phase 3-5)**: dependen de Foundational
  - US1 (P1): construye los 8 componentes y la composición final de
    `LandingPage.tsx`; sin dependencia de otras stories de esta feature
  - US2 (P2): depende de que los archivos de US1 existan (ajusta clases
    responsive sobre los mismos componentes ya creados en T006-T013)
  - US3 (P3): depende de que los archivos de US1 existan (agrega
    interactividad sobre los mismos componentes); independiente de US2
- **Polish (Phase 6)**: depende de que las stories deseadas estén completas

### Within Each User Story

- US1: T006-T013 son independientes entre sí (archivos distintos); T014
  depende de que los 8 estén completos
- US2: T015-T020 son independientes entre sí (archivos distintos); T021 es
  independiente de los demás (archivo distinto, `LandingNavbar.tsx`)
- US3: T023-T026 son independientes entre sí (archivos distintos); T022 es
  independiente de los demás (archivo distinto, `LandingNavbar.tsx`)

### Parallel Opportunities

- T002, T003 (Foundational) en paralelo entre sí
- T006, T007, T008, T009, T010, T011, T012, T013 (US1) en paralelo entre sí
- T015, T016, T017, T018, T019, T020 (US2) en paralelo entre sí
- T023, T024, T025, T026 (US3) en paralelo entre sí
- T027, T028 (Polish) en paralelo entre sí
- Una vez completado Foundational y US1, US2 y US3 pueden avanzar en
  paralelo entre sí (T015-T020 vs. T022-T026 tocan los mismos archivos que
  T021 vs. T022, pero distintas franjas de cada componente — coordinar si
  se ejecutan literalmente en simultáneo sobre el mismo archivo)

---

## Parallel Example: User Story 1

```bash
# Todos archivos nuevos distintos, en paralelo tras Foundational
Task: "Crear client/src/components/landing/LandingNavbar.tsx"
Task: "Crear client/src/components/landing/Hero.tsx"
Task: "Crear client/src/components/landing/NewsGrid.tsx"
Task: "Crear client/src/components/landing/RatingsFeature.tsx"
Task: "Crear client/src/components/landing/Authenticity.tsx"
Task: "Crear client/src/components/landing/ProductGrid.tsx"
Task: "Crear client/src/components/landing/MobileFeature.tsx"
Task: "Crear client/src/components/landing/Footer.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (ruta `/home` + tokens)
3. Completar Phase 3: User Story 1 (landing completa, CTA y perfil reales)
4. **STOP and VALIDATE**: landing visible con las 8 secciones, navegación
   real funcionando, cero regresión en `/` y `/admin/login`
5. Deploy/demo si está listo

### Incremental Delivery

1. Setup + Foundational → ruta y tokens listos
2. User Story 1 → landing completa con contenido y navegación real (MVP)
3. User Story 2 → landing responsive en los 3 rangos de viewport
4. User Story 3 → landing interactiva sin enlaces rotos ni errores
5. Cada historia agrega valor sin romper la anterior

---

## Notes

- [P] = archivos distintos, sin dependencias entre sí
- [Story] mapea cada tarea a su user story para trazabilidad
- Cero cambios en `/server`, `/server/prisma`, `/shared/types`, ni en
  ningún componente de `client/src/components/{admin,brackets,inscripcion,layout}`
- Cero cambios de comportamiento en superficies existentes (FR-011)
- Excepción de gobernanza de tipografía (Inter solo en esta landing) ya
  incorporada en `.specify/memory/constitution.md` v2.3.0 — sin bloqueo
- Commit después de cada tarea o grupo lógico
- Detenerse en cada checkpoint para validar la historia de forma
  independiente
