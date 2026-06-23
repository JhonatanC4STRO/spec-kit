# Feature Specification: Layout Principal con Navegación

**Feature Branch**: `006-layout-navegacion-principal`

**Created**: 2026-06-21

**Status**: Draft

**Input**: User description: "Agregar un layout principal con navegación. La página de inicio debe ser el formulario de inscripción público. Debe haber un enlace visible para ir al login de admin. Una vez el admin inicie sesión debe ver el panel admin con navegación entre: listado de inscritos, brackets FC25 y brackets Call of Duty. El admin debe poder cerrar sesión."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitante llega a la página de inicio (Priority: P1) 🎯 MVP

Un visitante (jugador potencial) entra al sitio y ve directamente el formulario de inscripción al torneo, con un enlace visible para acceder al login de administrador si lo necesita.

**Why this priority**: Es la puerta de entrada de todo el sitio; sin esto no hay inscripciones ni acceso al resto del sistema.

**Independent Test**: Abrir la URL raíz del sitio sin sesión iniciada → se ve el formulario de inscripción y un enlace a "Login admin" visible en la navegación.

**Acceptance Scenarios**:

1. **Given** un visitante sin sesión iniciada, **When** abre la página de inicio, **Then** ve el formulario de inscripción público como contenido principal.
2. **Given** un visitante en cualquier página pública, **When** mira la navegación del layout, **Then** encuentra un enlace visible hacia el login de administrador.
3. **Given** un visitante, **When** hace clic en el enlace de login admin, **Then** llega al formulario de login.

---

### User Story 2 - Admin navega entre secciones del panel (Priority: P1) 🎯 MVP

Un admin que ya inició sesión ve una navegación de panel admin con accesos a: listado de inscritos, bracket de FC25 y bracket de Call of Duty, y puede moverse libremente entre esas tres secciones.

**Why this priority**: Es el valor central del panel admin; sin navegación entre secciones el admin no puede operar el torneo de forma usable.

**Independent Test**: Con sesión admin iniciada, hacer clic en cada enlace de la navegación admin (inscritos, bracket FC25, bracket Call of Duty) → cada uno muestra su sección correspondiente sin perder la sesión.

**Acceptance Scenarios**:

1. **Given** un admin con sesión iniciada, **When** entra al panel admin, **Then** ve una navegación con tres accesos: listado de inscritos, bracket FC25, bracket Call of Duty.
2. **Given** un admin en la sección de listado de inscritos, **When** hace clic en "Bracket FC25", **Then** ve únicamente la sección del bracket de FC25.
3. **Given** un admin en la sección de bracket FC25, **When** hace clic en "Bracket Call of Duty", **Then** ve únicamente la sección del bracket de Call of Duty.
4. **Given** un usuario sin sesión iniciada, **When** intenta acceder directamente a cualquier sección del panel admin, **Then** es enviado al login de administrador en lugar de ver la sección.

---

### User Story 3 - Admin cierra sesión (Priority: P2)

Un admin que terminó su trabajo cierra sesión desde la navegación del panel y vuelve a un estado público, sin acceso a las secciones admin hasta volver a iniciar sesión.

**Why this priority**: Necesario para uso compartido del panel (varios admins, equipos compartidos) y para no dejar sesiones abiertas, pero no bloquea el uso básico del panel mientras se construyen las otras historias.

**Independent Test**: Con sesión admin iniciada, hacer clic en "Cerrar sesión" → la navegación admin desaparece, y al intentar volver a una sección admin el sistema vuelve a pedir login.

**Acceptance Scenarios**:

1. **Given** un admin con sesión iniciada en cualquier sección del panel, **When** hace clic en "Cerrar sesión", **Then** la sesión se invalida y deja de ver la navegación admin.
2. **Given** un admin que acaba de cerrar sesión, **When** intenta volver a una sección del panel admin, **Then** el sistema lo envía al login de administrador.

---

### Edge Cases

- ¿Qué ve un admin con sesión iniciada si entra a la página de inicio (`/`)? Sigue viendo el formulario de inscripción público; la navegación admin solo aplica dentro del panel admin.
- ¿Qué pasa si un usuario sin sesión escribe directamente la URL de una sección admin (bracket FC25, bracket Call of Duty, listado de inscritos)? Debe ser redirigido al login de administrador, sin ver contenido ni datos de esa sección.
- ¿Qué pasa si el admin cierra sesión mientras está parado en una sección del panel? Debe perder inmediatamente el acceso a esa sección y a las demás secciones admin.
- ¿Qué pasa si la sesión expira (no por cierre manual) mientras el admin navega? El admin es enviado al login de administrador la próxima vez que intenta una acción que requiere sesión, igual que el comportamiento ya existente de las páginas admin.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST mostrar un layout principal con navegación visible en todas las páginas del sitio (públicas y admin).
- **FR-002**: La página de inicio (ruta raíz) MUST mostrar el formulario de inscripción público como contenido principal.
- **FR-003**: El layout MUST mostrar, para visitantes sin sesión iniciada, un enlace visible que lleve al login de administrador.
- **FR-004**: Una vez el admin inicia sesión, el sistema MUST mostrar una navegación de panel admin con tres accesos distintos: listado de inscritos, bracket de FC25 y bracket de Call of Duty.
- **FR-005**: Cada acceso de la navegación admin MUST mostrar únicamente la sección correspondiente (listado de inscritos, o el bracket del juego seleccionado), sin mezclar contenido de las otras secciones.
- **FR-006**: El admin MUST poder cerrar sesión desde la navegación, estando en cualquier sección del panel admin.
- **FR-007**: Al cerrar sesión, el sistema MUST invalidar la sesión activa y dejar de mostrar la navegación admin.
- **FR-008**: El sistema MUST impedir el acceso a cualquier sección del panel admin (listado de inscritos, bracket FC25, bracket Call of Duty) a usuarios sin sesión admin válida, redirigiéndolos al login.
- **FR-009**: La navegación admin MUST NOT mostrar el enlace de login de administrador (ya no aplica una vez hay sesión iniciada).

### Key Entities

- **Sesión de administrador**: Representa el estado de autenticación del admin (iniciada o no); determina si se muestra la navegación pública o la navegación admin del layout.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un visitante nuevo identifica el formulario de inscripción y el enlace de login admin en menos de 5 segundos de llegar al sitio, sin necesitar instrucciones.
- **SC-002**: Un admin puede moverse entre las tres secciones del panel (inscritos, bracket FC25, bracket Call of Duty) usando únicamente la navegación, sin escribir URLs manualmente.
- **SC-003**: El 100% de los intentos de acceso directo a una sección admin sin sesión iniciada terminan en el login de administrador, nunca en la sección protegida.
- **SC-004**: Cerrar sesión deja al admin sin acceso a ninguna sección admin en el 100% de los casos, verificable en el siguiente intento de navegación.

## Assumptions

- El layout y la navegación son responsabilidad exclusiva del frontend (`/client`); no se requieren cambios en los contratos de API existentes de inscripciones, login o brackets.
- "Bracket FC25" y "bracket Call of Duty" son dos accesos de navegación independientes, cada uno mostrando solo el bracket de su juego (en lugar de una vista combinada de ambos juegos).
- El mecanismo de sesión admin ya existente (login con token) se reutiliza tal cual; esta feature solo agrega la acción de cerrar sesión y la integra a la navegación, sin cambiar cómo se emite o valida el token.
- Tras cerrar sesión, el admin es enviado a una vista pública (login de administrador o inicio), consistente con el comportamiento ya existente cuando no hay sesión.
