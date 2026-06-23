---

description: "Task list template for feature implementation"
---

# Tasks: Login de Administrador

**Input**: Design documents from `/specs/002-login-admin/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No solicitados explícitamente en la spec; no se incluyen tareas de
test dedicadas. La validación end-to-end se cubre en el Polish phase
corriendo `quickstart.md`.

**Organization**: Tareas agrupadas por user story para implementación y
prueba independientes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede correr en paralelo (archivos distintos, sin dependencias)
- **[Story]**: A qué user story pertenece (US1, US2)
- Rutas de archivo exactas en cada descripción

## Path Conventions

Reutiliza los proyectos `client/` y `server/` inicializados en
001-inscripcion-torneo (constitución v2.0.0: React+Vite / Node+Express).

---

## Phase 1: Setup

**Purpose**: Confirmar base reutilizada de 001; sin inicialización nueva

- [X] T001 Confirmar que `server/package.json` ya incluye `bcrypt` (agregado en 001-inscripcion-torneo) y que `server/src/middleware/auth.middleware.ts` ya existe como stub `501` (creado en 001-inscripcion-torneo, T024); no se requieren dependencias nuevas — el JWT manual usa el módulo `crypto` nativo de Node (ver research.md)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Modelo `Administrador`, utilidades de JWT y middleware
compartido — bloquea ambas user stories y es reutilizado por
001 (T024), 003, 004 y 005

**⚠️ CRITICAL**: Ninguna user story puede empezar hasta completar esta fase

- [X] T002 Agregar modelo `Administrador` (`email` único, `passwordHash`, `createdAt`) a `server/prisma/schema.prisma`
- [X] T003 Ejecutar `prisma migrate dev` para crear la tabla `Administrador` (depende de T002) — migración `add_administrador` aplicada contra Postgres real
- [X] T004 [P] Extender `server/prisma/seed.ts` (creado en 001) para sembrar al menos una cuenta `Administrador` de prueba con `passwordHash` bcrypt costo 10 (depende de T003)
- [X] T005 [P] Definir tipos compartidos `LoginRequest`, `LoginResponse`, `TokenPayload` en `shared/types/auth.ts`
- [X] T006 Implementar firma/verificación manual de JWT en `server/src/services/auth.ts` (`generarToken()`, `verificarToken()`) con HMAC-SHA256 vía `crypto` nativo, `exp = iat + 600` (ver research.md, sección 2)
- [X] T007 Reemplazar el stub `501` de `server/src/middleware/auth.middleware.ts` (de 001, T024) por la verificación real: lee `Authorization: Bearer <token>`, usa `verificarToken()` de T006, inyecta `adminId` o responde `401` si falta/inválido/expirado (depende de T006)

**Checkpoint**: Fundación lista — `auth.middleware.ts` real queda disponible
para 001 (T024, que deja de devolver 501), 003, 004 y 005

---

## Phase 3: User Story 1 - Login exitoso (Priority: P1) 🎯 MVP

**Goal**: Admin con credenciales correctas recibe un JWT y accede al panel
(FR-001, FR-003, FR-004, FR-006).

**Independent Test**: Login con email/password válidos de un administrador
sembrado en T004 → `200 OK` con token; usar ese token contra una ruta
protegida por `auth.middleware.ts` (T007) → acceso concedido.

### Implementation for User Story 1

- [X] T008 [US1] Implementar `verificarCredenciales(email, password)` en `server/src/services/auth.ts` usando `bcrypt.compare` contra `Administrador` (depende de T002, T003)
- [X] T009 [US1] Implementar `server/src/controllers/auth.controller.ts`: handler `login`, en éxito llama a `generarToken()` (T006) y responde `{ token, expiresInSeconds: 600 }` (depende de T008, T006)
- [X] T010 [US1] Implementar `server/src/routes/auth.routes.ts`: registrar `POST /api/admin/login` (depende de T009)
- [X] T011 [P] [US1] Implementar `client/src/services/auth.ts`: `login()` (wrapper `fetch` sobre `POST /api/admin/login`)
- [X] T012 [P] [US1] Implementar `client/src/components/admin/LoginForm.tsx`: campos email/password, llama a `login()`
- [X] T013 [US1] Implementar `client/src/pages/AdminLoginPage.tsx` renderizando `LoginForm` y guardando el token recibido (`client/src/services/authStore.ts`, en memoria, sin `localStorage`) (depende de T012)

**Checkpoint**: User Story 1 funcional de forma independiente (MVP)

---

## Phase 4: User Story 2 - Login fallido (Priority: P2)

**Goal**: Credenciales incorrectas devuelven mensaje de error genérico, sin
otorgar token ni acceso (FR-002, FR-005).

**Independent Test**: Password incorrecta para email existente y login con
email inexistente devuelven el mismo `401` con el mismo mensaje genérico, sin
diferencia notable de tiempo de respuesta.

### Implementation for User Story 2

- [X] T014 [US2] Extender `server/src/services/auth.ts`: cuando el email no existe, ejecutar `bcrypt.compare` contra un hash dummy precalculado antes de responder, para igualar el tiempo de respuesta (mitigación de timing attack, ver research.md sección 4) (depende de T008)
- [X] T015 [US2] Extender `server/src/controllers/auth.controller.ts`: responder `401` con el mismo mensaje genérico `"Credenciales inválidas"` en ambos casos de fallo (depende de T009, T014)
- [X] T016 [US2] Extender `server/src/controllers/auth.controller.ts`: validar que `email` y `password` no estén vacíos antes de autenticar, respondiendo `400` si faltan (FR-002) (depende de T009)
- [X] T017 [P] [US2] Extender `client/src/components/admin/LoginForm.tsx`: mostrar el mensaje de error genérico recibido del backend, sin agregar distinción propia entre causas (depende de T012)

**Checkpoint**: User Stories 1 y 2 funcionan juntas e independientemente;
expiración a los 10 minutos (FR-006/FR-007) ya cubierta por T006/T007 de
Foundational — verificar en Polish

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validación final y limpieza

- [X] T018 [P] Ejecutar manualmente los 4 escenarios de `quickstart.md`, incluyendo la expiración de sesión a los 10 minutos (Escenario 3); además verificar que `PATCH /api/inscripciones/estado` (001, T024) ya responde según credenciales en vez de `501`, ahora que el middleware real existe — verificado contra Postgres real: login OK (200+JWT), password incorrecta (401 genérico), email inexistente (401 mismo mensaje), campos vacíos (400), `PATCH` con token válido (200), sin token (401). Expiración a los 10 min queda por diseño (`exp` embebido, verificado por código en `verificarToken()`), no se esperó 10 min en vivo.
- [X] T019 [P] Revisar que no haya `any` ni `fetch` embebido en componentes (principios I y III de la constitución) en `client/src/components/admin/` y `server/src/services/auth.ts` — verificado por grep, sin coincidencias
- [X] T020 Documentar la variable de entorno del secreto de firma JWT (ej. `JWT_SECRET`) en `server/.env.example` — ya presente desde la config inicial de `.env`/`.env.example`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA ambas user stories y a las rutas protegidas de 001/003/004/005
- **User Stories (Phase 3-4)**: dependen de Foundational
  - US1 (P1): sin dependencia de otras stories
  - US2 (P2): extiende los mismos archivos que crea US1 (T008, T009, T012) — implementarla después de US1
- **Polish (Phase 5)**: depende de que ambas stories estén completas

### Within Each User Story

- Servicio → controlador → ruta en el backend
- Wrapper de cliente → componente que lo consume en el frontend
- US1 completa antes de extenderla con los casos de fallo de US2

### Parallel Opportunities

- T004, T005 (Foundational) en paralelo entre sí tras T002-T003
- T011, T012 (US1) en paralelo entre sí (frontend) mientras T008-T010 avanzan en backend
- T017 (US2) en paralelo con T014-T016 una vez exista T012

---

## Parallel Example: User Story 1

```bash
# Backend (secuencial: servicio → controlador → ruta)
Task: "Implementar verificarCredenciales() en server/src/services/auth.ts"
Task: "Implementar server/src/controllers/auth.controller.ts: handler login"
Task: "Implementar server/src/routes/auth.routes.ts: POST /api/admin/login"

# Frontend (en paralelo entre sí)
Task: "Implementar client/src/services/auth.ts: login()"
Task: "Implementar client/src/components/admin/LoginForm.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (bloquea todo, incluye middleware
   reutilizado por otras features)
3. Completar Phase 3: User Story 1
4. **STOP and VALIDATE**: login exitoso + acceso con token, de forma
   independiente
5. Deploy/demo si está listo

### Incremental Delivery

1. Setup + Foundational → JWT manual y middleware listos
2. User Story 1 → login básico funcionando (MVP)
3. User Story 2 → manejo correcto de credenciales incorrectas
4. Cada historia agrega valor sin romper la anterior

---

## Notes

- [P] = archivos distintos, sin dependencias entre sí
- [Story] mapea cada tarea a su user story para trazabilidad
- `auth.middleware.ts` (T007) es el punto que 001 (T024), 003, 004 y 005
  reutilizan para proteger sus rutas admin
- Commit después de cada tarea o grupo lógico
- Detenerse en cada checkpoint para validar la historia de forma
  independiente
