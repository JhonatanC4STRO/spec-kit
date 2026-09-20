# Feature Specification: Pagos de Inscripción con ePayco

**Feature Branch**: `009-epayco-payments`

**Created**: 2026-07-26

**Status**: Draft

**Input**: User description: "quiero agregar la pasarela de pago con epayco. seguira este proceso Usuario llena formulario de inscripción ↓ Tu backend guarda la inscripción como pendiente_pago ↓ Tu backend crea un registro en pagos ↓ Tu frontend muestra botón \"Pagar inscripción\"/\"Pagar en efectivo\" ↓ Usuario paga en ePayco ↓ ePayco redirige al usuario a tu página de respuesta ↓ ePayco envía confirmación a tu webhook ↓ Tu backend marca la inscripción como pagada. cuando los pagos son en efectivo el admin tendra que gestionar desde el panel que ya pago"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar inscripción pendiente de pago (Priority: P1)

Un jugador completa el formulario público de inscripción y el sistema registra
su inscripción como pendiente de pago, dejando lista una opción para pagar en
línea con ePayco o seleccionar pago en efectivo.

**Why this priority**: Es el punto de entrada obligatorio del flujo; sin una
inscripción pendiente de pago no existe una orden que cobrar ni forma confiable
de separar jugadores inscritos de jugadores confirmados.

**Independent Test**: Completar el formulario de inscripción con datos válidos
y verificar que el jugador queda registrado como pendiente de pago, con una
referencia de pago asociada y acciones visibles para pagar en línea o en
efectivo.

**Acceptance Scenarios**:

1. **Given** un usuario con datos válidos en el formulario de inscripción,
   **When** envía la inscripción, **Then** el sistema crea la inscripción en
   estado pendiente de pago y muestra las opciones "Pagar inscripción" y
   "Pagar en efectivo".
2. **Given** una inscripción recién creada, **When** el sistema prepara el
   cobro, **Then** existe un registro de pago asociado a esa inscripción con
   monto, método pendiente de elección y estado pendiente.

---

### User Story 2 - Pagar inscripción en línea con ePayco (Priority: P1)

Un jugador elige pagar la inscripción en línea, completa el pago en ePayco y
regresa a una página de respuesta donde puede ver el estado informado para su
transacción.

**Why this priority**: Es el objetivo principal de integrar la pasarela; reduce
gestión manual y permite confirmar participantes automáticamente cuando el
proveedor confirma el pago.

**Independent Test**: Desde una inscripción pendiente de pago, iniciar el pago
en línea, completar una transacción aprobada en el entorno de pago configurado,
regresar a la página de respuesta y verificar que el usuario ve un mensaje
claro mientras el sistema espera o refleja la confirmación oficial.

**Acceptance Scenarios**:

1. **Given** una inscripción pendiente de pago, **When** el jugador selecciona
   "Pagar inscripción", **Then** el sistema abre el flujo de pago en línea con
   la información correcta de la inscripción y del cobro.
2. **Given** un jugador que completa el flujo de pago en línea, **When** ePayco
   lo redirige a la página de respuesta, **Then** el sistema muestra un estado
   comprensible de la transacción sin tratar esa redirección como prueba final
   de pago.
3. **Given** una confirmación oficial válida de ePayco para un pago aprobado,
   **When** el sistema procesa esa confirmación, **Then** marca el pago como
   pagado y actualiza la inscripción como pagada.

---

### User Story 3 - Registrar pago en efectivo desde administración (Priority: P2)

Un jugador elige pagar en efectivo y la inscripción queda pendiente hasta que
el administrador confirme manualmente que recibió el dinero.

**Why this priority**: El torneo necesita conservar la opción de pago manual
sin romper el control administrativo ni marcar jugadores como pagados antes de
recibir el efectivo.

**Independent Test**: Crear una inscripción, seleccionar pago en efectivo,
entrar al panel de administración y marcar esa inscripción como pagada,
verificando que el estado cambia solo después de la acción del admin.

**Acceptance Scenarios**:

1. **Given** una inscripción pendiente de pago, **When** el jugador selecciona
   "Pagar en efectivo", **Then** el sistema registra el pago como efectivo
   pendiente de confirmación administrativa.
2. **Given** una inscripción con pago en efectivo pendiente, **When** el admin
   confirma que el jugador ya pagó, **Then** el sistema marca el pago y la
   inscripción como pagados.
3. **Given** un usuario que no es admin, **When** intenta confirmar un pago en
   efectivo, **Then** el sistema rechaza la acción y conserva el estado
   pendiente.

---

### User Story 4 - Auditar y evitar confirmaciones duplicadas (Priority: P3)

El administrador puede consultar el método, estado y referencia de pago de cada
inscripción, y el sistema evita procesar dos veces la misma confirmación.

**Why this priority**: Los pagos requieren trazabilidad; además, los
proveedores pueden enviar confirmaciones repetidas y el sistema debe ser
seguro e idempotente.

**Independent Test**: Enviar dos confirmaciones equivalentes para la misma
transacción y verificar que la inscripción queda pagada una sola vez, con un
historial consistente visible para administración.

**Acceptance Scenarios**:

1. **Given** una inscripción con pago registrado, **When** el admin revisa el
   listado o detalle de inscripciones, **Then** ve estado de pago, método de
   pago y referencia disponible.
2. **Given** una confirmación oficial repetida para una transacción ya
   procesada, **When** el sistema la recibe, **Then** conserva el pago como
   pagado sin duplicar el cobro ni alterar indebidamente la inscripción.

---

### Edge Cases

- Si el usuario abandona el pago en línea o cierra la ventana de ePayco, la
  inscripción permanece pendiente de pago y el usuario puede intentar pagar de
  nuevo.
- Si ePayco redirige al usuario con un resultado rechazado, fallido o
  pendiente, la página de respuesta muestra el estado correspondiente y no
  marca la inscripción como pagada por esa redirección.
- Si la confirmación oficial de ePayco no puede verificarse como auténtica, el
  sistema la rechaza, conserva la inscripción pendiente y deja trazabilidad
  para revisión.
- Si ePayco confirma un monto, moneda o referencia que no coincide con el pago
  esperado, el sistema no marca la inscripción como pagada.
- Si el admin intenta confirmar en efectivo una inscripción ya pagada en línea,
  el sistema evita el doble marcado y muestra que la inscripción ya está
  pagada.
- Si una inscripción pendiente de pago intenta incluirse en operaciones que
  requieren participantes confirmados, el sistema debe distinguirla claramente
  de una inscripción pagada.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema MUST crear cada inscripción pública nueva con estado
  pendiente de pago.
- **FR-002**: Sistema MUST crear un registro de pago asociado a cada
  inscripción nueva, incluyendo monto, moneda, estado, método seleccionado
  cuando exista y referencia interna única.
- **FR-003**: Sistema MUST permitir al usuario elegir entre pago en línea con
  ePayco y pago en efectivo desde la pantalla posterior a la inscripción.
- **FR-004**: Sistema MUST iniciar un pago en línea de ePayco únicamente para
  inscripciones existentes que sigan pendientes de pago.
- **FR-005**: Sistema MUST enviar a ePayco la información necesaria para
  identificar el cobro de inscripción, asociarlo con la inscripción correcta y
  permitir el retorno del usuario a una página de respuesta del sistema.
- **FR-006**: Sistema MUST mostrar una página de respuesta de pago donde el
  usuario vea si la transacción fue aprobada, rechazada, fallida, pendiente o
  aún está esperando confirmación oficial.
- **FR-007**: Sistema MUST NOT marcar una inscripción como pagada usando solo
  la redirección visible al usuario después del pago.
- **FR-008**: Sistema MUST marcar el pago y la inscripción como pagados solo
  cuando reciba una confirmación oficial válida de ePayco para una transacción
  aprobada.
- **FR-009**: Sistema MUST validar que la confirmación oficial de ePayco sea
  auténtica y que coincida con la referencia, monto y moneda esperados antes
  de confirmar el pago.
- **FR-010**: Sistema MUST procesar confirmaciones repetidas de ePayco de forma
  idempotente, sin duplicar pagos ni cambiar indebidamente el estado final.
- **FR-011**: Sistema MUST registrar los pagos en línea rechazados, fallidos o
  pendientes sin convertir la inscripción a pagada.
- **FR-012**: Sistema MUST permitir al usuario seleccionar pago en efectivo y
  dejar ese pago pendiente de confirmación administrativa.
- **FR-013**: Sistema MUST permitir únicamente al admin marcar un pago en
  efectivo como pagado desde el panel administrativo.
- **FR-014**: Sistema MUST mostrar en el panel administrativo el estado de pago
  de cada inscripción, el método elegido y la referencia disponible.
- **FR-015**: Sistema MUST evitar que una inscripción pagada vuelva a iniciar
  o confirmar otro pago para la misma inscripción.
- **FR-016**: Sistema MUST conservar trazabilidad mínima de eventos de pago:
  creación, selección de método, resultado informado por ePayco, confirmación
  oficial recibida y confirmación manual de efectivo.

### Key Entities *(include if feature involves data)*

- **Inscripción**: solicitud de participación de un jugador en un juego del
  torneo; ahora incluye estado de pago para diferenciar pendiente de pago y
  pagada.
- **Pago**: cobro asociado a una inscripción; contiene monto, moneda, método,
  estado, referencia interna, referencia externa cuando aplique y fecha de
  confirmación.
- **Evento de Pago**: registro de trazabilidad de cambios o notificaciones
  relacionadas con un pago; permite auditoría y diagnóstico de confirmaciones
  repetidas o fallidas.
- **Confirmación de Efectivo**: acción administrativa que acredita un pago
  manual recibido fuera de la pasarela en línea.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de las inscripciones nuevas quedan en estado pendiente
  de pago con un registro de pago asociado.
- **SC-002**: Al menos el 95% de usuarios con inscripción válida puede iniciar
  el pago en línea en menos de 5 segundos desde que selecciona "Pagar
  inscripción".
- **SC-003**: El 100% de confirmaciones oficiales válidas de pagos aprobados
  actualizan la inscripción correspondiente a pagada en menos de 10 segundos.
- **SC-004**: El 100% de confirmaciones inválidas, con monto incorrecto o
  duplicadas no produce doble confirmación ni marca pagos no aprobados como
  pagados.
- **SC-005**: El admin puede identificar en menos de 10 segundos qué
  inscripciones están pagadas, pendientes de pago en línea o pendientes de
  confirmación en efectivo.
- **SC-006**: El 100% de pagos en efectivo solo cambia a pagado después de una
  acción autenticada del admin.

## Assumptions

- El precio de inscripción, moneda y modo de ePayco (pruebas o producción) se
  manejarán como configuración del sistema, no como valores editables por el
  usuario público.
- La moneda predeterminada del torneo será COP, salvo que el administrador
  configure otra moneda compatible antes de operar pagos reales.
- Una inscripción pendiente de pago no equivale a participante confirmado para
  efectos administrativos del torneo.
- La página de respuesta al usuario es informativa; la confirmación definitiva
  del pago en línea depende de la notificación oficial de ePayco al sistema.
- Los pagos en efectivo no pasan por ePayco; quedan bajo responsabilidad del
  admin hasta que confirme manualmente la recepción del dinero.
- La integración inicial no incluye reembolsos, pagos parciales, cupones,
  facturación electrónica ni edición del monto desde el panel administrativo.
