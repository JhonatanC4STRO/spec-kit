# Implementation Plan: Login de Administrador

**Branch**: `002-login-admin` | **Date**: 2026-06-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-login-admin/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

El admin envía email y contraseña al backend; si coinciden con una cuenta
registrada, recibe un JWT firmado manualmente (sin librería de terceros, sin
restricciones de formato sobre la contraseña) que expira a los 10 minutos. Si
no coinciden, recibe un mensaje de error genérico sin revelar cuál dato
falló. El token protege las rutas del panel admin usadas por 003, 004 y 005.

## Technical Context

**Language/Version**: TypeScript 5.x en dos proyectos separados: React 18 +
Vite (frontend, `/client`) y Node.js + Express (backend, `/server`).

**Primary Dependencies**: Backend: Express, Prisma, bcrypt (hash de
contraseña). Frontend: React, Vite, Tailwind CSS. Sin librería de JWT de
terceros: firma y verificación se implementan a mano con el módulo `crypto`
nativo de Node, conforme a "JWT manual" de la constitución (ver research.md).

**Storage**: PostgreSQL vía Prisma (`/server/prisma`). Tabla nueva:
`Administrador` (ver data-model.md). La sesión en sí (JWT) no se persiste:
es stateless.

**Testing**: Vitest para unit/integration de la lógica de firma/verificación
de JWT y de comparación de credenciales en `/server/src/services`.

**Target Platform**: Web — backend Express expuesto como API REST bajo
`/api/`, frontend SPA con formulario de login.

**Project Type**: Aplicación web con frontend y backend como proyectos
separados: `/client` (React + Vite) y `/server` (Node.js + Express),
comunicados vía API REST.

**Performance Goals**: Acceso al panel en menos de 5 segundos desde el envío
del formulario (SC-001).

**Constraints**: Token JWT expira exactamente a los 10 minutos desde su
emisión (FR-006); contraseña sin restricciones de formato/complejidad
(FR-008, decisión explícita del usuario); mensaje de error idéntico para
email inexistente y contraseña incorrecta (FR-005), incluyendo tiempo de
respuesta similar para no filtrar por timing si el email existe.

**Scale/Scope**: Pocas cuentas de administrador (no es un sistema
multiusuario masivo); sin requerimiento de alta concurrencia de logins.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Gate | Estado |
|-----------|------|--------|
| I. Seguridad de Tipos | Sin `any`; toda función con tipo de retorno explícito | PASS — aplica en `server/src/services/auth.ts` y `client/src/services/auth.ts` |
| II. Spec-First | Spec aprobada antes de codear | PASS — `spec.md` ya validado (checklist 16/16) |
| III. Capa de Servicios para Fetching | Sin `fetch` embebido en JSX; llamadas vía `/client/src/services` | PASS — `LoginForm` llama a `client/src/services/auth.ts` (`login()`), no hace `fetch` inline |
| IV. Separación de Responsabilidades | Lógica de negocio fuera de componentes UI y controladores | PASS — firma/verificación de JWT y comparación de credenciales viven en `server/src/services/auth.ts`; el controlador solo orquesta request/response |
| V. Dependencias y Convenciones Aprobadas | No instalar librerías sin aprobar; rutas bajo `/server/src/routes` con prefijo `/api/`; naming conventions | PASS — sin dependencias nuevas (JWT manual con `crypto` nativo, no `jsonwebtoken`); nombres siguen las convenciones definidas |

Sin violaciones. No aplica Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/002-login-admin/
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
│   │       └── LoginForm.tsx          # Componente puro: formulario de login
│   ├── pages/
│   │   └── AdminLoginPage.tsx
│   └── services/
│       └── auth.ts                    # wrapper fetch: login()
└── tests/
    └── unit/
        └── LoginForm.test.tsx

server/
├── src/
│   ├── routes/
│   │   └── auth.routes.ts             # POST /api/admin/login
│   ├── controllers/
│   │   └── auth.controller.ts         # parsea request, llama al service, responde
│   ├── services/
│   │   └── auth.ts                    # verificarCredenciales(), generarToken(), verificarToken()
│   └── middleware/
│       └── auth.middleware.ts         # protege rutas admin (003, 004, 005) verificando el token
├── prisma/
│   └── schema.prisma                  # Administrador
└── tests/
    ├── contract/
    │   └── auth-login.test.ts
    ├── integration/
    │   └── login-flow.test.ts
    └── unit/
        └── jwt.test.ts

shared/
└── types/
    └── auth.ts                        # tipos compartidos: LoginRequest, LoginResponse, TokenPayload
```

**Structure Decision**: Dos proyectos separados conforme a la constitución
(Opción 2: `/client` con React + Vite, `/server` con Node.js + Express). El
middleware `auth.middleware.ts` es el punto único reutilizado por las rutas
protegidas de 003, 004 y 005.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Sin violaciones — tabla no aplica.
