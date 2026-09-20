# Tasks: Pagos de Inscripción con ePayco

**Input**: Design documents from `/specs/009-epayco-payments/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No automated test runner is configured; validation uses builds and quickstart scenarios.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Shared types and configuration scaffolding for payment work.

- [X] T001 Add shared payment types in shared/types/pago.ts
- [X] T002 Extend registration shared types with payment state and create response in shared/types/inscripcion.ts
- [X] T003 Add ePayco/payment environment examples in server/.env.example

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema and backend routing foundation required by all payment stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Add payment enums, Inscripcion.estadoPago, Pago, and EventoPago models in server/prisma/schema.prisma
- [X] T005 Add Prisma migration SQL in server/prisma/migrations/20260726000000_epayco_payments/migration.sql
- [X] T006 Create payment service skeleton and configuration helpers in server/src/services/pagos.ts
- [X] T007 Create payment controller skeleton in server/src/controllers/pagos.controller.ts
- [X] T008 Create payment routes and mount them in server/src/routes/pagos.routes.ts and server/src/index.ts

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Registrar inscripción pendiente de pago (Priority: P1) 🎯 MVP

**Goal**: A valid public registration creates a pending payment and returns payment actions to the frontend.

**Independent Test**: Submit a valid registration and confirm the response includes `inscripcion.estadoPago = PENDIENTE_PAGO` plus a pending `pago`.

### Implementation for User Story 1

- [X] T009 [US1] Update registration creation to create Inscripcion and Pago atomically in server/src/services/inscripciones.ts
- [X] T010 [US1] Update registration controller response shape in server/src/controllers/inscripciones.controller.ts
- [X] T011 [US1] Update client registration service return type in client/src/services/inscripciones.ts
- [X] T012 [P] [US1] Create payment action component in client/src/components/inscripcion/PagoInscripcion.tsx
- [X] T013 [US1] Show payment actions after public registration in client/src/components/inscripcion/InscripcionForm.tsx
- [X] T014 [US1] Show payment actions after landing registration in client/src/components/landing/LandingInscripcionForm.tsx

**Checkpoint**: User can register and see "Pagar inscripción" / "Pagar en efectivo".

---

## Phase 4: User Story 2 - Pagar inscripción en línea con ePayco (Priority: P1)

**Goal**: A pending registration can open Smart Checkout and be marked paid only through valid ePayco confirmation.

**Independent Test**: Start a checkout session for a pending payment, simulate a valid accepted confirmation, and verify payment and registration become paid.

### Implementation for User Story 2

- [X] T015 [US2] Implement ePayco authentication/session creation and signature validation in server/src/services/pagos.ts
- [X] T016 [US2] Implement public ePayco session, status, and confirmation handlers in server/src/controllers/pagos.controller.ts
- [X] T017 [US2] Add ePayco checkout script to client/index.html
- [X] T018 [P] [US2] Add frontend payment service wrappers in client/src/services/pagos.ts
- [X] T019 [US2] Wire Smart Checkout opening into client/src/components/inscripcion/PagoInscripcion.tsx
- [X] T020 [P] [US2] Add payment response page in client/src/pages/PagoRespuestaPage.tsx
- [X] T021 [US2] Register /pago/respuesta route in client/src/App.tsx

**Checkpoint**: Online payment flow can be initiated and confirmed by webhook.

---

## Phase 5: User Story 3 - Registrar pago en efectivo desde administración (Priority: P2)

**Goal**: Cash payments remain pending until admin confirms them from the player panel.

**Independent Test**: Select cash payment, then confirm it as admin and verify the payment/registration become paid.

### Implementation for User Story 3

- [X] T022 [US3] Implement cash selection and admin cash confirmation in server/src/services/pagos.ts
- [X] T023 [US3] Implement cash selection and admin confirmation handlers in server/src/controllers/pagos.controller.ts
- [X] T024 [US3] Add client service functions for cash selection/admin confirmation in client/src/services/pagos.ts
- [X] T025 [US3] Add admin cash confirmation action and payment status display in client/src/components/admin/ListadoJugadores.tsx

**Checkpoint**: Admin can mark pending cash payments as paid.

---

## Phase 6: User Story 4 - Auditar y evitar confirmaciones duplicadas (Priority: P3)

**Goal**: Admin can see payment status and duplicate/invalid provider confirmations are traceable and safe.

**Independent Test**: Re-send a confirmation and verify no duplicate state change; send an invalid confirmation and verify no payment is marked paid.

### Implementation for User Story 4

- [X] T026 [US4] Persist payment events for creation, method selection, ePayco session, webhook, and manual confirmation in server/src/services/pagos.ts
- [X] T027 [US4] Include payment summary in admin listing response from server/src/services/inscripciones.ts
- [X] T028 [US4] Render method/reference/status columns in client/src/components/admin/ListadoJugadores.tsx

**Checkpoint**: Payment status is visible and duplicate/invalid notifications are safe.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Build validation and final consistency checks.

- [X] T029 Run server build from server/package.json and fix TypeScript issues
- [X] T030 Run client build from client/package.json and fix TypeScript issues
- [X] T031 Review quickstart scenarios in specs/009-epayco-payments/quickstart.md and document any environment-only gaps

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories.
- **US1 and US2 (P1)**: US1 must complete before US2 UI can initiate checkout.
- **US3 (P2)**: Depends on Foundational; admin UI benefits from US1 payment data.
- **US4 (P3)**: Depends on US2/US3 event paths.
- **Polish**: Depends on selected user stories complete.

### User Story Dependencies

- **US1**: MVP, no story dependencies after foundation.
- **US2**: Depends on US1 because checkout requires an existing payment.
- **US3**: Depends on US1 because cash selection requires an existing payment.
- **US4**: Depends on US2 and US3 to audit provider/manual events.

### Parallel Opportunities

- T012 can be built while backend US1 files are being updated.
- T018 and T020 can run in parallel after contracts are stable.
- T026 and T027 are backend-only but touch overlapping files with earlier service work, so run after US2/US3.

---

## Parallel Example: User Story 2

```text
Task: "Add frontend payment service wrappers in client/src/services/pagos.ts"
Task: "Add payment response page in client/src/pages/PagoRespuestaPage.tsx"
```

---

## Implementation Strategy

### MVP First

1. Complete setup and foundation.
2. Complete US1 so every inscription has a pending payment and public users see payment options.
3. Validate with one public registration before adding ePayco.

### Incremental Delivery

1. US1: pending payment after registration.
2. US2: online ePayco payment and webhook confirmation.
3. US3: cash selection and admin confirmation.
4. US4: audit/status hardening.
5. Build validation.

### Notes

- Keep ePayco secrets server-side only.
- Do not mark paid from browser redirect or checkout hook alone.
- Mark each completed task with `[X]` during implementation.
