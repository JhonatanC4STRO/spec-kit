# Research: Pagos de Inscripción con ePayco

## Decision: Smart Checkout v2 con sesión creada desde backend

**Rationale**: La documentación oficial de ePayco Smart Checkout indica que la
sesión se crea desde backend autenticándose primero contra Apify con
`PUBLIC_KEY` y `PRIVATE_KEY`, y que el `sessionId` resultante se usa en
frontend para abrir el checkout. Esto evita exponer llaves privadas al
navegador y encaja con la arquitectura actual de API Express.

**Alternatives considered**:

- Tokenización directa de tarjetas: descartada porque requiere capturar datos
  sensibles de tarjeta en la UI y no corresponde al flujo simple de inscripción.
- Botón estático de cobro: descartado porque dificulta asociar cada pago con
  una inscripción interna e idempotencia por referencia.

## Decision: No instalar SDK de ePayco

**Rationale**: El backend puede autenticarse y crear sesiones con `fetch`
nativo de Node 20. La validación de firma usa `crypto` nativo. Evita añadir
dependencias sin aprobación y mantiene la superficie de seguridad más pequeña.

**Alternatives considered**:

- SDK npm de ePayco: descartado por la regla del proyecto de no instalar
  dependencias sin aprobación y porque el caso requerido usa pocos endpoints.

## Decision: Confirmación final solo por webhook firmado

**Rationale**: ePayco diferencia la página de respuesta del usuario y la URL de
confirmación servidor-a-servidor. La respuesta visible puede ser manipulada o
perderse; el webhook incluye firma de seguridad y es el mecanismo confiable
para confirmar pagos. El sistema validará firma, referencia, monto y moneda.

**Alternatives considered**:

- Marcar pagado desde la redirección: descartado por inseguro.
- Consultar solo la referencia desde frontend: descartado como fuente final de
  verdad; puede apoyar la visualización, pero no reemplaza el webhook.

## Decision: Idempotencia por transacción ePayco y pago interno

**Rationale**: ePayco puede reintentar webhooks. El sistema debe aceptar
repeticiones sin duplicar efectos, guardando evento de pago para auditoría y
manteniendo el pago final estable.

**Alternatives considered**:

- Rechazar duplicados con error: descartado porque podría provocar reintentos
  innecesarios del proveedor.

## Decision: Efectivo como método manual pendiente de admin

**Rationale**: El usuario pidió que los pagos en efectivo se gestionen desde el
panel. El método efectivo queda registrado como pendiente hasta confirmación
autenticada del admin; no pasa por ePayco.

**Alternatives considered**:

- Marcar efectivo como pagado al seleccionarlo: descartado porque no prueba
  recepción real del dinero.
