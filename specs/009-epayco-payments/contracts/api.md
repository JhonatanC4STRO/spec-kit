# API Contract: Pagos de Inscripción

Base path follows the existing project convention under `/api`.

## POST /api/inscripciones

Creates a registration and its initial payment.

### Success 201

```json
{
  "inscripcion": {
    "id": "uuid",
    "nombreCompleto": "Juan Pérez",
    "nickname": "Crack10",
    "documento": "1000000000",
    "juego": "FC25",
    "estadoPago": "PENDIENTE_PAGO",
    "createdAt": "2026-07-26T00:00:00.000Z"
  },
  "pago": {
    "id": "uuid",
    "inscripcionId": "uuid",
    "monto": "20000",
    "moneda": "COP",
    "metodo": "SIN_SELECCION",
    "estado": "PENDIENTE",
    "referenciaInterna": "INS-20260726-ABC123"
  }
}
```

### Errors

- `400`: invalid fields.
- `409`: duplicate nickname/document or full capacity.
- `423`: registrations closed.

## POST /api/pagos/:id/epayco-session

Creates or refreshes an ePayco Smart Checkout session for a pending payment.

### Success 200

```json
{
  "pagoId": "uuid",
  "sessionId": "epayco-session-id",
  "test": true
}
```

### Errors

- `400`: payment is not eligible for online checkout.
- `404`: payment not found.
- `502`: ePayco session could not be created.

## PATCH /api/pagos/:id/efectivo

Selects cash payment for a pending registration.

### Success 200

```json
{
  "id": "uuid",
  "metodo": "EFECTIVO",
  "estado": "PENDIENTE"
}
```

### Errors

- `400`: payment already paid or not eligible.
- `404`: payment not found.

## GET /api/pagos/:id

Returns payment status for the user-facing response page.

### Success 200

```json
{
  "id": "uuid",
  "inscripcionId": "uuid",
  "monto": "20000",
  "moneda": "COP",
  "metodo": "EPAYCO",
  "estado": "EN_PROCESO",
  "referenciaInterna": "INS-20260726-ABC123",
  "epaycoRefPayco": "68fb83729d094878e015be00",
  "epaycoResponse": "Pendiente"
}
```

### Errors

- `404`: payment not found.

## POST /api/pagos/epayco/confirmacion

Webhook endpoint called by ePayco. Accepts JSON or URL-encoded payloads.

### Required provider fields

- `x_ref_payco`
- `x_transaction_id`
- `x_response`
- `x_amount`
- `x_currency_code`
- `x_signature`
- `x_extra1` (internal payment id)

### Success 200

```text
OK
```

### Errors

- `400`: invalid signature, invalid reference, amount/currency mismatch.
- `404`: payment not found.

## PATCH /api/admin/pagos/:id/efectivo/confirmar

Admin-only endpoint to confirm a cash payment.

### Success 200

```json
{
  "id": "uuid",
  "metodo": "EFECTIVO",
  "estado": "PAGADO",
  "fechaConfirmacion": "2026-07-26T00:00:00.000Z"
}
```

### Errors

- `400`: payment is not a pending cash payment.
- `401`: missing/invalid admin token.
- `404`: payment not found.
