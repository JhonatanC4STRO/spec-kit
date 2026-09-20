# Quickstart: Validación de Pagos con ePayco

## Prerrequisitos

- PostgreSQL configurado y accesible por `server/.env`.
- Cuenta ePayco con llaves de pruebas.
- Una URL pública HTTPS para el webhook durante desarrollo (por ejemplo ngrok).

## Configuración esperada

Agregar a `server/.env`:

```env
EPAYCO_PUBLIC_KEY="..."
EPAYCO_PRIVATE_KEY="..."
EPAYCO_CUSTOMER_ID="..."
EPAYCO_P_KEY="..."
EPAYCO_TEST="true"
EPAYCO_BASE_URL="https://apify.epayco.co"
APP_PUBLIC_URL="https://tu-url-publica"
INSCRIPCION_PRICE_CENTS="2000000"
INSCRIPCION_CURRENCY="COP"
```

`INSCRIPCION_PRICE_CENTS` representa el valor en centavos/unidades menores
para evitar errores de punto flotante en configuración.

## Comandos

Desde `server/`:

```powershell
npm run prisma:generate
npm run prisma:migrate
npm run build
npm run dev
```

Desde `client/`:

```powershell
npm run build
npm run dev
```

## Escenario 1: inscripción queda pendiente de pago

1. Abrir la landing o `/inscripcion`.
2. Completar una inscripción válida.
3. Verificar que la pantalla de éxito muestra:
   - estado pendiente de pago;
   - botón "Pagar inscripción";
   - botón "Pagar en efectivo".
4. En admin, verificar que la inscripción aparece con estado pendiente.

## Escenario 2: pago online ePayco

1. Desde la pantalla posterior al registro, seleccionar "Pagar inscripción".
2. Confirmar que se abre Smart Checkout de ePayco.
3. Completar una transacción de prueba aprobada.
4. Verificar que el navegador llega a `/pago/respuesta`.
5. Verificar que el pago solo cambia a pagado después de que el webhook llegue
   correctamente al backend.

## Escenario 3: pago en efectivo

1. Crear una inscripción nueva.
2. Seleccionar "Pagar en efectivo".
3. Confirmar que la UI muestra "pendiente de confirmación del admin".
4. Entrar al panel admin.
5. Confirmar el pago en efectivo.
6. Verificar que inscripción y pago cambian a pagados.

## Escenario 4: webhook duplicado o inválido

1. Reenviar el mismo webhook aprobado.
2. Verificar que el backend responde OK sin duplicar efectos.
3. Enviar un payload con firma o monto alterado.
4. Verificar que el pago no cambia a pagado.

## Nota de validación local

La validación automatizada disponible en este repo se limita a `npm run build`
en `server/` y `client/`. La prueba end-to-end real de ePayco requiere
credenciales de sandbox/producción y una URL pública HTTPS configurada en
`APP_PUBLIC_URL`, por lo que debe ejecutarse en un ambiente conectado.
