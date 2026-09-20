# Data Model: Pagos de Inscripción con ePayco

## Inscripcion

Existing tournament registration.

### New fields

- `estadoPago`: enum `PENDIENTE_PAGO | PAGADA`, default `PENDIENTE_PAGO`.

### Relationships

- One `Inscripcion` has zero or one active `Pago`.

### Validation rules

- New public registrations start as `PENDIENTE_PAGO`.
- Registration can move to `PAGADA` only when its associated payment is paid.
- Paid registrations cannot start a new payment flow.

## Pago

Payment/order associated with one registration.

### Fields

- `id`: internal unique identifier.
- `inscripcionId`: unique registration identifier.
- `monto`: decimal amount expected for the registration.
- `moneda`: ISO currency code, default configured as `COP`.
- `metodo`: `EPAYCO | EFECTIVO | SIN_SELECCION`.
- `estado`: `PENDIENTE | EN_PROCESO | PAGADO | RECHAZADO | FALLIDO`.
- `referenciaInterna`: unique invoice/reference sent to ePayco.
- `epaycoSessionId`: Smart Checkout session id, nullable.
- `epaycoRefPayco`: ePayco payment reference, nullable.
- `epaycoTransactionId`: ePayco transaction id, nullable and unique when present.
- `epaycoResponse`: provider response text/code, nullable.
- `epaycoFranchise`: payment method/franchise reported by ePayco, nullable.
- `fechaConfirmacion`: datetime when payment becomes paid, nullable.
- `createdAt`: creation timestamp.
- `updatedAt`: update timestamp.

### Validation rules

- `monto` must be greater than zero.
- `moneda` must match configured checkout currency.
- `referenciaInterna` is unique and stable.
- `epaycoTransactionId` must not be processed twice.
- A paid payment cannot be downgraded by later rejected/failed notifications.

## EventoPago

Audit event for payment creation, method selection, checkout session, webhook
processing and manual admin confirmation.

### Fields

- `id`: unique identifier.
- `pagoId`: payment identifier.
- `tipo`: `CREADO | METODO_EFECTIVO | SESION_EPAYCO_CREADA | WEBHOOK_RECIBIDO | WEBHOOK_INVALIDO | PAGO_CONFIRMADO | PAGO_RECHAZADO | PAGO_FALLIDO | EFECTIVO_CONFIRMADO`.
- `detalle`: JSON payload or normalized details.
- `createdAt`: timestamp.

### Validation rules

- Events are append-only.
- Invalid webhook payloads are recorded when they can be associated with an
  existing payment.

## State transitions

```text
Inscripcion
PENDIENTE_PAGO ── payment paid ──> PAGADA

Pago
PENDIENTE ── choose efectivo ──> PENDIENTE
PENDIENTE ── create ePayco session ──> EN_PROCESO
EN_PROCESO ── ePayco Aceptada + valid signature ──> PAGADO
EN_PROCESO ── ePayco Rechazada ──> RECHAZADO
EN_PROCESO ── ePayco Fallida ──> FALLIDO
PENDIENTE ── admin confirms efectivo ──> PAGADO
```

Pending ePayco notifications keep the payment in `EN_PROCESO`. Duplicate
notifications preserve the final state.
