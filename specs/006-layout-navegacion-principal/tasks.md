---

description: "Task list template for feature implementation"
---

# Tasks: Layout Principal con Navegación

**Input**: Design documents from `/specs/006-layout-navegacion-principal/`

**Prerequisites**: plan.md, spec.md, data-model.md, quickstart.md

**Tests**: No solicitados explícitamente en la spec; no se incluyen tareas de
test dedicadas. La validación end-to-end se cubre en el Polish phase
corriendo `quickstart.md`.

**Organization**: Tareas agrupadas por user story para implementación y
prueba independientes. Sin cambios en `/server` ni `/shared/types`: toda la
feature vive en `/client`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede correr en paralelo (archivos distintos, sin dependencias)
- **[Story]**: A qué user story pertenece (US1, US2, US3)
- Rutas de archivo exactas en cada descripción

## Path Conventions

Reutiliza `client/` de features previas. `AdminBracketPage.tsx` (005) se
reemplaza por dos páginas delgadas que reutilizan la lógica ya validada de
carga/registro de resultado, extraída a `BracketJuegoPanel.tsx`.

---

## Phase 1: Setup

**Purpose**: Confirmar reutilización de infraestructura existente

- [X] T001 Confirmar que `react-router-dom` (ya aprobado en 002) y `client/src/services/authStore.ts` (`getToken`/`setToken`/`limpiarToken`, ya existentes) no requieren cambios; sin dependencias nuevas

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shell de layout (`AppLayout` + `Outlet`) que envuelve todas las
rutas — bloquea las 3 user stories, porque ninguna nav (pública o admin) es
visible sin él

**⚠️ CRITICAL**: Ninguna user story puede empezar hasta completar esta fase

- [X] T002 Crear `client/src/components/layout/AppLayout.tsx`: envuelve `<Outlet/>` de `react-router-dom`, lee `getToken()` de `client/src/services/authStore.ts` para decidir entre rama pública y rama admin; por ahora cada rama es un placeholder mínimo (sin componentes de nav todavía, ver US1/US2)
- [X] T003 Envolver las rutas existentes de `client/src/App.tsx` (`/`, `/admin/login`, `/admin/jugadores`) bajo una ruta padre `element={<AppLayout/>}` con rutas hijas vía `Outlet`, preservando su comportamiento actual (depende de T002)

**Checkpoint**: Shell de navegación montado (sin contenido de nav todavía) — las 3 user stories pueden empezar

---

## Phase 3: User Story 1 - Visitante llega a la página de inicio (Priority: P1) 🎯 MVP

**Goal**: Visitante sin sesión ve el formulario de inscripción en `/` y un
enlace visible hacia el login de admin (FR-002, FR-003).

**Independent Test**: Abrir `/` sin sesión iniciada → se ve el formulario de
inscripción y un enlace visible a "Login admin" en la navegación; al hacer
clic, llega al login.

### Implementation for User Story 1

- [X] T004 [US1] Crear `client/src/components/layout/NavPublica.tsx`: enlace visible hacia `/admin/login`
- [X] T005 [US1] Integrar `NavPublica` en `AppLayout.tsx`, reemplazando el placeholder de la rama sin sesión (depende de T004, T002)
- [X] T006 [US1] Confirmar que la ruta `/` sigue usando `client/src/pages/InscripcionPage.tsx` como hijo de `AppLayout` (heredado de T003) y que el formulario se ve como contenido principal sin que la navegación lo tape

**Checkpoint**: User Story 1 funcional de forma independiente (MVP)

---

## Phase 4: User Story 2 - Admin navega entre secciones del panel (Priority: P1) 🎯 MVP

**Goal**: Admin con sesión ve navegación con tres accesos (inscritos,
bracket FC25, bracket Call of Duty) y cada uno muestra solo su sección
(FR-004, FR-005, FR-008).

**Independent Test**: Con sesión admin iniciada, hacer clic en cada enlace
de la navegación admin → cada uno muestra su sección correspondiente sin
mezclar contenido; sin sesión, cualquier URL admin redirige al login.

### Implementation for User Story 2

- [X] T007 [US2] Crear `client/src/components/brackets/BracketJuegoPanel.tsx`: extrae de `client/src/pages/AdminBracketPage.tsx` la carga (`getBracket`) y el render (`GenerarBracketButton`/`BracketView`) de un solo juego, recibiendo `juego` y `token` como props
- [X] T008 [P] [US2] Crear `client/src/pages/AdminBracketFc25Page.tsx`: protege con `getToken()` (mismo patrón que `AdminJugadoresPage.tsx`) y renderiza `<BracketJuegoPanel juego="FC25" .../>` (depende de T007)
- [X] T009 [P] [US2] Crear `client/src/pages/AdminBracketCodPage.tsx`: ídem para `juego="COD_BO2"` (depende de T007)
- [X] T010 [US2] En `client/src/App.tsx`, agregar las rutas hijas `/admin/bracket/fc25` y `/admin/bracket/cod-bo2`, retirar la ruta combinada `/admin/bracket` y su import de `AdminBracketPage.tsx` (depende de T008, T009, T003)
- [X] T011 [US2] Eliminar `client/src/pages/AdminBracketPage.tsx` (reemplazada por T008/T009)
- [X] T012 [US2] Crear `client/src/components/layout/NavAdmin.tsx`: enlaces a "Inscritos" (`/admin/jugadores`), "Bracket FC25" (`/admin/bracket/fc25`), "Bracket Call of Duty" (`/admin/bracket/cod-bo2`)
- [X] T013 [US2] Integrar `NavAdmin` en `AppLayout.tsx`, reemplazando el placeholder de la rama con sesión (depende de T012, T002)

**Checkpoint**: User Stories 1 y 2 funcionan juntas e independientemente (MVP completo)

---

## Phase 5: User Story 3 - Admin cierra sesión (Priority: P2)

**Goal**: Admin cierra sesión desde la navegación; pierde acceso a las
secciones admin hasta volver a iniciar sesión (FR-006, FR-007).

**Independent Test**: Con sesión admin iniciada, hacer clic en "Cerrar
sesión" → desaparece la navegación admin; al intentar volver a una sección
admin, el sistema vuelve a pedir login.

### Implementation for User Story 3

- [X] T014 [US3] Agregar botón "Cerrar sesión" en `client/src/components/layout/NavAdmin.tsx`: al hacer clic llama `limpiarToken()` de `client/src/services/authStore.ts` y navega a `/admin/login` (depende de T012)

**Checkpoint**: Las 3 user stories funcionan de forma independiente y conjunta

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validación final y limpieza

- [X] T015 [P] Ejecutar manualmente los 4 escenarios de `quickstart.md` — verificado contra los servidores reales del usuario (puerto 3000/5173) con Playwright headless (instalado temporalmente, no quedó en `package.json`): escenario 1 (home pública + enlace login) OK; escenario 2 (login → nav admin con 3 enlaces, cada bracket aislado sin mezclar el otro juego) OK; escenario 3 (logout vuelve a nav pública) OK; escenario 4 / FR-008 (URL admin directa sin sesión → redirige a login) OK. **Bug real encontrado y corregido**: `AppLayout` no se re-renderizaba tras login/logout — `<Route element={<AppLayout/>}>` recibe un elemento referencialmente estable entre navegaciones (creado una sola vez en el render de `App()`), y React hacía bailout del re-render, dejando la nav con el token obsoleto. Fix: `useLocation()` dentro de `AppLayout.tsx` para suscribirlo al contexto del router
- [X] T016 [P] Revisar que no haya `any` ni `fetch` embebido en `client/src/components/layout/` y `client/src/components/brackets/BracketJuegoPanel.tsx` (principios I y III) — verificado por grep y `eslint`, sin coincidencias
- [X] T017 Confirmar que `client/src/pages/AdminJugadoresPage.tsx` no requirió cambios (reutiliza su protección existente) y queda accesible desde `NavAdmin` — confirmado visualmente, datos reales del usuario (inscripto "Shonano") intactos

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias, pero requiere 002 (react-router-dom, authStore) ya existente
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA las 3 user stories
- **User Stories (Phase 3-5)**: dependen de Foundational
  - US1 (P1): sin dependencia de otras stories de esta feature
  - US2 (P1): sin dependencia de US1; reutiliza la lógica de bracket de 005 (no de US1)
  - US3 (P2): depende de que `NavAdmin.tsx` exista (creado en US2) — implementarla después
- **Polish (Phase 6)**: depende de que las stories deseadas estén completas

### Within Each User Story

- US1: componente de nav pública → integración en `AppLayout` → verificación de la ruta `/`
- US2: panel reutilizable de bracket → páginas por juego (en paralelo) → rutas en `App.tsx` → limpieza de la página vieja → nav admin → integración en `AppLayout`
- US3: agrega botón de logout sobre el `NavAdmin.tsx` ya creado por US2

### Parallel Opportunities

- T008, T009 (US2) en paralelo entre sí una vez completado T007
- T015, T016 (Polish) en paralelo entre sí

---

## Parallel Example: User Story 2

```bash
# Backend: sin cambios (esta feature no toca /server)

# Frontend (en paralelo entre sí, tras T007)
Task: "Crear client/src/pages/AdminBracketFc25Page.tsx"
Task: "Crear client/src/pages/AdminBracketCodPage.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 y 2)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (shell `AppLayout`)
3. Completar Phase 3: User Story 1 (nav pública + home)
4. Completar Phase 4: User Story 2 (nav admin + brackets separados por juego)
5. **STOP and VALIDATE**: navegación pública y admin funcionando, de forma independiente
6. Deploy/demo si está listo

### Incremental Delivery

1. Setup + Foundational → shell de layout listo
2. User Story 1 → home pública + enlace a login (MVP parcial)
3. User Story 2 → navegación admin completa entre las 3 secciones (MVP completo)
4. User Story 3 → cerrar sesión
5. Cada historia agrega valor sin romper la anterior

---

## Notes

- [P] = archivos distintos, sin dependencias entre sí
- [Story] mapea cada tarea a su user story para trazabilidad
- Sin cambios en `/server`, `/server/prisma` ni `/shared/types`: feature
  acotada a `/client`
- Commit después de cada tarea o grupo lógico
- Detenerse en cada checkpoint para validar la historia de forma
  independiente
