# Feature Specification: Login de Administrador

**Feature Branch**: `002-login-admin`

**Created**: 2026-06-20

**Status**: Draft

**Input**: User description: "El administrador puede iniciar sesión con email y contraseña, la contrasenia no tiene restricciones. Si las credenciales son correctas recibe un token JWT y accede al panel admin. Si son incorrectas muestra mensaje de error. La sesión dura 10 minutos"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Login exitoso (Priority: P1)

Administrador ingresa su email y contraseña correctos y obtiene acceso al panel
admin.

**Why this priority**: Es el flujo central; sin esto no hay acceso al panel.

**Independent Test**: Ingresar email y contraseña válidos de un administrador
registrado y verificar que se otorga acceso al panel admin.

**Acceptance Scenarios**:

1. **Given** un administrador registrado, **When** ingresa su email y contraseña
   correctos, **Then** sistema emite un token JWT y le da acceso al panel admin.
2. **Given** un administrador ya autenticado, **When** transcurren 10 minutos
   desde el login, **Then** la sesión expira y se le exige iniciar sesión
   nuevamente para seguir usando el panel.

---

### User Story 2 - Login fallido (Priority: P2)

Administrador ingresa credenciales incorrectas y el sistema le informa el error
sin otorgar acceso.

**Why this priority**: Protege el panel admin de accesos no autorizados;
necesario junto con el login exitoso para que la feature sea utilizable de forma
segura.

**Independent Test**: Ingresar email o contraseña incorrectos y verificar que se
muestra mensaje de error y no se otorga token ni acceso.

**Acceptance Scenarios**:

1. **Given** un administrador registrado, **When** ingresa contraseña incorrecta,
   **Then** sistema muestra mensaje de error y no emite token ni otorga acceso.
2. **Given** un email no registrado como administrador, **When** intenta iniciar
   sesión, **Then** sistema muestra el mismo mensaje de error genérico (sin
   revelar si el email existe).

---

### Edge Cases

- ¿Qué pasa si email o contraseña quedan vacíos? Sistema rechaza el envío
  indicando campos requeridos, sin intentar autenticar.
- ¿Qué pasa si el token expira mientras el admin está usando el panel? La
  siguiente acción que requiera el token es rechazada y debe volver a iniciar
  sesión.
- ¿Qué pasa con intentos repetidos de login fallido? No hay bloqueo ni límite de
  intentos en esta versión.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema MUST permitir a un administrador iniciar sesión mediante
  email y contraseña.
- **FR-002**: Sistema MUST validar que email y contraseña estén completos antes
  de intentar autenticar.
- **FR-003**: Sistema MUST verificar las credenciales ingresadas contra una
  cuenta de administrador registrada.
- **FR-004**: Sistema MUST emitir un token JWT y otorgar acceso al panel admin
  cuando las credenciales son correctas.
- **FR-005**: Sistema MUST mostrar un mensaje de error genérico cuando las
  credenciales son incorrectas (email inexistente o contraseña incorrecta), sin
  revelar cuál de los dos datos falló.
- **FR-006**: Sistema MUST invalidar automáticamente la sesión del token JWT a
  los 10 minutos desde su emisión.
- **FR-007**: Sistema MUST exigir reautenticación cuando se intenta usar el panel
  admin con un token expirado o inválido.
- **FR-008**: Sistema MUST aceptar cualquier valor de contraseña sin imponer
  requisitos de formato o complejidad, según lo especificado.

### Key Entities *(include if feature involves data)*

- **Administrador**: email, contraseña (almacenada de forma segura), identificador
  único. Puede haber más de un administrador registrado.
- **Sesión**: token JWT emitido al administrador, con marca de emisión y
  expiración fija a los 10 minutos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un administrador con credenciales correctas accede al panel en
  menos de 5 segundos desde que envía el formulario de login.
- **SC-002**: El 100% de los intentos con credenciales incorrectas resultan en
  mensaje de error sin otorgar acceso ni token.
- **SC-003**: El 100% de las sesiones quedan invalidadas automáticamente al
  cumplirse 10 minutos desde su inicio.

## Assumptions

- Puede existir más de una cuenta de administrador, cada una con su propio email
  y contraseña.
- No hay límite de intentos fallidos de login ni bloqueo temporal en esta
  versión.
- Al expirar la sesión no hay renovación automática de token; el administrador
  debe volver a iniciar sesión manualmente.
- La ausencia de restricciones sobre el formato de la contraseña es una decisión
  explícita del usuario para esta versión, no un descuido.
