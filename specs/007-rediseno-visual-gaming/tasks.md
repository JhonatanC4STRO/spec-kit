---

description: "Task list template for feature implementation"
---

# Tasks: Rediseño Visual con Estética Gaming

**Input**: Design documents from `/specs/007-rediseno-visual-gaming/`

**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: No solicitados explícitamente en la spec; no se incluyen tareas
de test dedicadas. La validación end-to-end (incluyendo cero regresiones
funcionales, FR-006/SC-002) se cubre en el Polish phase corriendo
`quickstart.md`.

**Organization**: Tareas agrupadas por user story. Cambio acotado a
`/client` (estilos únicamente) — sin cambios en `/server` ni
`/shared/types`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede correr en paralelo (archivos distintos, sin dependencias)
- **[Story]**: A qué user story pertenece (US1, US2, US3)
- Rutas de archivo exactas en cada descripción

## Path Conventions

Toca únicamente componentes ya existentes en `client/src/components/` (12
archivos identificados por grep de clases de color/borde) más
`tailwind.config.cjs`, `index.css` e `index.html`. Ningún archivo de
`client/src/pages/` requiere cambios (son contenedores delgados sin clases
de color propias).

---

## Phase 1: Setup

**Purpose**: Confirmar reutilización de infraestructura existente

- [X] T001 Confirmar que Tailwind CSS (ya aprobado) no requiere instalar plugins ni dependencias nuevas; Rajdhani se carga vía `<link>` de Google Fonts, no paquete npm (ver research.md sección 1)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tokens de paleta/tipografía y fondo general — bloquea las 3
user stories, porque ningún componente puede aplicar la nueva identidad
sin estos tokens

**⚠️ CRITICAL**: Ninguna user story puede empezar hasta completar esta fase

- [X] T002 [P] Extender `client/tailwind.config.cjs` con `theme.extend.colors` (`bg.base` `#0a0a0a`, `bg.card` `#111111`, `bg.alt` `#1a1a1a`, `primary` `#00ff87`, `edge` `#2a2a2a`, `text.secondary` `#999999`) y `fontFamily.sans` (`Rajdhani`, `Barlow Condensed`, `sans-serif`) (ver research.md sección 2)
- [X] T003 [P] Agregar `@layer base { body { ... } }` en `client/src/index.css`: `bg-bg-base`, `text-white`, `font-sans`
- [X] T004 [P] Agregar `<link rel="preconnect">` + `<link>` de Google Fonts (familia Rajdhani) en `client/index.html` (ver research.md sección 1)
- [X] T005 Restilizar `client/src/components/layout/AppLayout.tsx`: fondo general y separador de nav con los tokens de T002 (depende de T002, T003)

**Checkpoint**: Tokens y fondo general listos — las 3 user stories pueden empezar

---

## Phase 3: User Story 1 - Visitante se inscribe con la nueva identidad visual (Priority: P1) 🎯 MVP

**Goal**: Formulario de inscripción público y su navegación con la
identidad visual gaming, sin cambiar su comportamiento (FR-001 a FR-004,
FR-006).

**Independent Test**: Abrir `/` sin sesión → fondo oscuro, tarjeta con
borde sutil, botón verde neón, tipografía Rajdhani; inscribirse funciona
igual que antes del rediseño.

### Implementation for User Story 1

- [X] T006 [P] [US1] Restilizar `client/src/components/inscripcion/InscripcionForm.tsx`: inputs (`bg-bg-alt`, `border-edge`, `text-white`), botón primario (`bg-primary`, `text-black`), error (`text-red-400`), éxito (`bg-bg-card`/`border-edge`, `text-emerald-300` — distinto del verde primario, ver research.md sección 3)
- [X] T007 [P] [US1] Restilizar `client/src/components/inscripcion/InscripcionesCerradas.tsx`: aviso de advertencia (`bg-bg-card`, `border-edge`, `text-amber-300`)
- [X] T008 [P] [US1] Restilizar `client/src/components/layout/NavPublica.tsx`: enlace con los tokens de marca (`text-primary` o equivalente legible sobre `bg-bg-base`)

**Checkpoint**: User Story 1 funcional de forma independiente (MVP)

---

## Phase 4: User Story 2 - Admin opera el panel con la nueva identidad visual (Priority: P1) 🎯 MVP

**Goal**: Login, navegación admin y listado de inscritos con la identidad
visual gaming, sin cambiar ninguna acción administrativa (FR-001 a FR-005,
FR-006, FR-007).

**Independent Test**: Login admin, navegar el panel (inscritos), eliminar
un jugador, cerrar sesión → todo con la nueva paleta/tipografía; cada
acción se comporta igual que antes del rediseño.

### Implementation for User Story 2

- [X] T009 [P] [US2] Restilizar `client/src/components/admin/LoginForm.tsx`: inputs y botón primario con los mismos tokens que T006
- [X] T010 [P] [US2] Restilizar `client/src/components/layout/NavAdmin.tsx`: enlaces y botón "Cerrar sesión" con los tokens de marca
- [X] T011 [P] [US2] Restilizar `client/src/components/admin/ListadoJugadores.tsx`: tabla con filas alternas (`bg-bg-card`/`bg-bg-base`), bordes (`border-edge`)
- [X] T012 [P] [US2] Restilizar `client/src/components/admin/ConfirmarEliminacion.tsx`: overlay y tarjeta del modal (`bg-bg-card`, `border-edge`, `text-white`), botón destructivo distinguible del primario
- [X] T013 [P] [US2] Restilizar `client/src/components/admin/ToggleInscripciones.tsx`: botón secundario (borde blanco, fondo transparente, conforme `/constitution.md`)

**Checkpoint**: User Stories 1 y 2 funcionan juntas e independientemente (MVP completo)

---

## Phase 5: User Story 3 - Admin gestiona el torneo con la nueva identidad visual (Priority: P2)

**Goal**: Generación/lectura de bracket y registro de resultados con la
identidad visual gaming, manteniendo legibilidad de la información densa
(FR-001 a FR-004, FR-006 a FR-008).

**Independent Test**: Generar un bracket, verlo, registrar el resultado de
un partido (incluyendo empate con penales) → toda la información se
distingue claramente con la nueva paleta; ninguna acción cambia su
comportamiento.

### Implementation for User Story 3

- [X] T014 [P] [US3] Restilizar `client/src/components/admin/GenerarBracketButton.tsx`: botón primario, mensaje de error (`text-red-400`)
- [X] T015 [P] [US3] Restilizar `client/src/components/brackets/BracketView.tsx`: tarjetas de partido (`bg-bg-card`/`border-edge`), texto de ganador/campeón distinguible del verde primario de marca (ver research.md sección 3)
- [X] T016 [P] [US3] Restilizar `client/src/components/brackets/ResultadoForm.tsx`: inputs, select, botón primario, error — mismos tokens que T006/T009

**Checkpoint**: Las 3 user stories funcionan de forma independiente y conjunta

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validación final y limpieza

- [X] T017 [P] Ejecutar manualmente los 4 escenarios de `quickstart.md` — verificado con Playwright headless (instalado temporal, no quedó en `package.json`) contra los servidores reales del usuario (:3000/:5173): home pública + nav (fondo `#0a0a0a`, verde neón, Rajdhani visible) OK; error de validación en rojo claramente distinto del primario OK; login + nav admin (3 links verdes + "Cerrar sesión" rojo) OK; tabla de inscritos con filas alternas OK; modal de confirmación (card oscura, botón destructivo) OK; generar bracket (5 jugadores reales, 3 byes auto-resueltos) + `ResultadoForm` con inputs/botón primario OK; texto "Ganador"/"Campeón" en verde esmeralda distinto del verde primario de los botones (resuelve el Edge Case de confusión acción-vs-éxito) OK. Datos de prueba (4 inscripciones + 1 bracket) limpiados, estado restaurado exacto (solo "Shonano" en FC25, sin brackets, inscripciones abiertas)
- [X] T018 [P] Revisar que no haya hex hardcodeado en JSX (`bg-[#`, `style={{`) ni `any`/`fetch` embebido fuera de `client/src/services` en los 12 componentes tocados (principios I, III, IV) — verificado por grep y `eslint`/`tsc -b`, sin coincidencias

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias, pero requiere Tailwind ya configurado (existente)
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA las 3 user stories
- **User Stories (Phase 3-5)**: dependen de Foundational
  - US1 (P1): sin dependencia de otras stories de esta feature
  - US2 (P1): sin dependencia de US1 (estiliza archivos distintos)
  - US3 (P2): sin dependencia de US1/US2 (estiliza archivos distintos); reutiliza los mismos tokens ya definidos en Foundational
- **Polish (Phase 6)**: depende de que las stories deseadas estén completas

### Within Each User Story

- Cada tarea restiliza un componente ya existente, sin tocar su lógica;
  todas las tareas de una misma story son independientes entre sí (archivos
  distintos) salvo que reutilicen el mismo patrón visual (inputs, botón
  primario) ya resuelto en T006

### Parallel Opportunities

- T002, T003, T004 (Foundational) en paralelo entre sí
- T006, T007, T008 (US1) en paralelo entre sí
- T009, T010, T011, T012, T013 (US2) en paralelo entre sí
- T014, T015, T016 (US3) en paralelo entre sí
- T017, T018 (Polish) en paralelo entre sí
- Una vez completado Foundational, US1, US2 y US3 pueden avanzar en paralelo entre sí (tocan archivos distintos)

---

## Parallel Example: User Story 2

```bash
# Todos archivos distintos, en paralelo tras Foundational
Task: "Restilizar client/src/components/admin/LoginForm.tsx"
Task: "Restilizar client/src/components/layout/NavAdmin.tsx"
Task: "Restilizar client/src/components/admin/ListadoJugadores.tsx"
Task: "Restilizar client/src/components/admin/ConfirmarEliminacion.tsx"
Task: "Restilizar client/src/components/admin/ToggleInscripciones.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 y 2)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (tokens + fondo general)
3. Completar Phase 3: User Story 1 (inscripción + nav pública)
4. Completar Phase 4: User Story 2 (login + panel admin)
5. **STOP and VALIDATE**: identidad visual consistente y cero regresiones en inscripción + panel admin
6. Deploy/demo si está listo

### Incremental Delivery

1. Setup + Foundational → tokens listos
2. User Story 1 → inscripción pública con nueva identidad (MVP parcial)
3. User Story 2 → panel admin completo con nueva identidad (MVP completo)
4. User Story 3 → bracket y resultados con nueva identidad
5. Cada historia agrega valor sin romper la anterior

---

## Notes

- [P] = archivos distintos, sin dependencias entre sí
- [Story] mapea cada tarea a su user story para trazabilidad
- Cero cambios en `/server`, `/server/prisma` ni `/shared/types`
- Cero cambios de comportamiento: solo `className`/CSS (FR-006)
- Commit después de cada tarea o grupo lógico
- Detenerse en cada checkpoint para validar la historia de forma
  independiente
