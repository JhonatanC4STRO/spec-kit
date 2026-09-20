# Implementation Plan: Pagos de Inscripción con ePayco

**Branch**: `009-epayco-payments` | **Date**: 2026-07-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-epayco-payments/spec.md`

## Summary

Agregar cobro de inscripción al flujo público existente: al crear una
inscripción se guarda como pendiente de pago y se crea un pago asociado. El
frontend posterior al registro muestra acciones para iniciar Smart Checkout de
ePayco o seleccionar pago en efectivo. ePayco confirma el resultado final por
webhook firmado; solo esa confirmación marca pagos online como pagados. Los
pagos en efectivo quedan pendientes hasta que el admin los confirme desde el
panel de jugadores.

## Technical Context

**Language/Version**: TypeScript 5.x en React 18 + Vite (`/client`) y Node.js
20+ + Express + Prisma (`/server`).

**Primary Dependencies**: Dependencias existentes del proyecto. Sin paquetes
npm nuevos. Backend usa `fetch` global de Node 20 para Apify/ePayco y `crypto`
nativo para firma SHA-256; frontend carga el script oficial
`https://checkout.epayco.co/checkout-v2.js` desde `index.html`.

**Storage**: PostgreSQL vía Prisma. Nuevos enums/modelos para estado de pago,
método de pago y eventos de pago; `Inscripcion` gana `estadoPago`.

**Testing**: No hay test runner configurado. Validación con `npm run build` en
`server/` y `client/`, más quickstart manual con sandbox de ePayco/ngrok.

**Target Platform**: Aplicación web SPA + API REST.

**Project Type**: Web app full-stack en monorepo (`client/`, `server/`,
`shared/types/`).

**Performance Goals**: Crear sesión de pago online en menos de 5 segundos para
95% de intentos válidos; procesar webhook válido en menos de 10 segundos y
responder HTTP 200 rápidamente.

**Constraints**: No instalar librerías nuevas sin aprobación; no usar `any`;
funciones con tipo de retorno explícito; no guardar secretos ePayco en
frontend; no marcar pagos online como pagados desde la página de respuesta;
webhook debe validar firma, monto, moneda e idempotencia; UI mantiene tema
oscuro y acento verde neón.

**Scale/Scope**: Un flujo público de inscripción/pago, una página de respuesta,
extensión del panel admin de jugadores, nuevos endpoints de pagos, nueva
migración Prisma y tipos compartidos.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Gate | Estado |
|-----------|------|--------|
| I. Seguridad de Tipos | Sin `any`; toda función con retorno explícito | PASS — se modela el objeto global `ePayco` con tipos mínimos propios y payloads desconocidos como `unknown`/records tipados |
| II. Spec-First | `spec.md` antes de código | PASS — `specs/009-epayco-payments/spec.md` existe y checklist 16/16 |
| III. Capa de Servicios para Fetching | Fetch frontend solo en `/client/src/services` | PASS — se agregan wrappers en `client/src/services/pagos.ts`; componentes no hacen `fetch` directo |
| IV. Separación de Responsabilidades | DB solo en servicios; UI sin lógica de negocio | PASS — pagos viven en `server/src/services/pagos.ts`; rutas/controladores son delgados |
| V. Dependencias y Convenciones | Sin librerías nuevas; nombres consistentes | PASS — Node `fetch`/`crypto` nativos; nuevos archivos kebab-case/convención existente |
| VI. Identidad Visual Gaming | Tema oscuro, verde neón, legibilidad | PASS — botones/estados usan clases Tailwind existentes y colores semánticos ya presentes |

Sin violaciones. No aplica Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/009-epayco-payments/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api.md
└── tasks.md
```

### Source Code (repository root)

```text
shared/types/
└── pago.ts                              # tipos compartidos del flujo de pagos

server/
├── .env.example                         # variables ePayco/config de inscripción
├── prisma/
│   ├── schema.prisma                    # enums/modelos de pago + estadoPago en Inscripcion
│   └── migrations/
│       └── 20260726000000_epayco_payments/
│           └── migration.sql
└── src/
    ├── index.ts                         # urlencoded para webhook + router pagos
    ├── controllers/
    │   ├── inscripciones.controller.ts   # responde inscripción + pago
    │   └── pagos.controller.ts           # endpoints públicos/admin/webhook
    ├── routes/
    │   └── pagos.routes.ts
    └── services/
        ├── inscripciones.ts             # crea inscripción+pago en transacción
        └── pagos.ts                     # negocio de ePayco, efectivo e idempotencia

client/
├── index.html                           # script oficial checkout-v2.js
└── src/
    ├── App.tsx                          # ruta /pago/respuesta
    ├── components/
    │   ├── inscripcion/PagoInscripcion.tsx
    │   └── admin/ListadoJugadores.tsx
    ├── pages/
    │   └── PagoRespuestaPage.tsx
    └── services/
        └── pagos.ts
```

**Structure Decision**: Cambio full-stack acotado a las capas existentes. El
modelo de pago se agrega en Prisma y se expone mediante tipos compartidos; el
backend mantiene routes → controllers → services; el frontend mantiene llamadas
HTTP en servicios y componentes puros para mostrar acciones/estado. La ruta de
respuesta vive dentro del layout público existente para conservar navegación y
estética.

## Phase 0: Research Summary

See [research.md](./research.md).

## Phase 1: Design Summary

See [data-model.md](./data-model.md), [contracts/api.md](./contracts/api.md)
and [quickstart.md](./quickstart.md).

## Constitution Check - Post Design

| Principio | Estado |
|-----------|--------|
| I. Seguridad de Tipos | PASS — contratos y tipos compartidos cubren payloads propios; payload externo se normaliza en servicio |
| II. Spec-First | PASS — plan deriva de `spec.md` validada |
| III. Capa de Servicios para Fetching | PASS — servicios frontend dedicados |
| IV. Separación de Responsabilidades | PASS — reglas de estado y firma en backend services |
| V. Dependencias y Convenciones | PASS — sin dependencias nuevas |
| VI. Identidad Visual Gaming | PASS — UI nueva usa dark/neon en patrones existentes |

## Complexity Tracking

Sin violaciones — tabla no aplica.
