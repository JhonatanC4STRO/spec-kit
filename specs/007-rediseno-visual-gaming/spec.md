# Feature Specification: Rediseño Visual con Estética Gaming

**Feature Branch**: `007-rediseno-visual-gaming`

**Created**: 2026-06-21

**Status**: Draft

**Input**: User description: "Rediseño visual completo de la plataforma aplicando la estética gaming definida en el constitution.md: fondo negro #0a0a0a, verde neón #00ff87 como color primario, tipografía Rajdhani, cards oscuras con bordes sutiles. Aplica a todos los componentes existentes: formulario de inscripción, login admin, panel admin, vista de bracket y registro de resultados. Sin cambios en lógica ni funcionalidad."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitante se inscribe con la nueva identidad visual (Priority: P1) 🎯 MVP

Un visitante llega al formulario de inscripción público y percibe de
inmediato la identidad visual gaming (fondo oscuro, acento verde neón,
tipografía distintiva) sin que el llenado y envío del formulario cambien en
absoluto respecto al comportamiento actual.

**Why this priority**: Es la primera pantalla que ve cualquier usuario del
sitio; define la primera impresión de la nueva identidad de marca.

**Independent Test**: Abrir el formulario de inscripción → se ve fondo
oscuro, acentos en verde neón y la tipografía nueva; completar e inscribirse
funciona exactamente igual que antes del rediseño.

**Acceptance Scenarios**:

1. **Given** un visitante en el formulario de inscripción, **When** lo
   observa, **Then** ve fondo oscuro, tarjetas con bordes sutiles, y el
   color verde neón en los elementos de acción principales.
2. **Given** un visitante con el rediseño aplicado, **When** completa y
   envía el formulario, **Then** la inscripción se registra exactamente
   igual que antes del rediseño (mismas validaciones, mismos mensajes).

---

### User Story 2 - Admin opera el panel con la nueva identidad visual (Priority: P1) 🎯 MVP

Un admin inicia sesión y usa el panel (navegación, listado de inscritos)
con la misma identidad visual gaming, sin que el login ni ninguna acción
administrativa (cerrar inscripciones, eliminar jugador, cerrar sesión)
cambie su comportamiento.

**Why this priority**: El panel admin es donde se opera el torneo; sin
consistencia visual ahí, el rediseño se sentiría incompleto.

**Independent Test**: Iniciar sesión, navegar el panel admin (inscritos) →
todo se ve con la nueva paleta/tipografía; todas las acciones (login,
navegación, eliminar jugador, cerrar sesión) funcionan igual que antes.

**Acceptance Scenarios**:

1. **Given** un admin en el login, **When** lo observa, **Then** ve la
   misma identidad visual (fondo oscuro, verde neón, tipografía) que el
   resto del sitio.
2. **Given** un admin con sesión iniciada, **When** navega entre
   secciones del panel, **Then** la identidad visual es consistente en
   todas ellas y ninguna acción cambia su comportamiento.

---

### User Story 3 - Admin gestiona el torneo con la nueva identidad visual (Priority: P2)

Un admin genera/consulta el bracket de cada juego y registra resultados de
partidos con la misma identidad visual gaming, manteniendo perfecta
legibilidad de la información (jugadores, puntajes, ganadores, errores) a
pesar del fondo oscuro y el color de acento saturado.

**Why this priority**: Son las pantallas con más densidad de información
del sitio; el riesgo de perder legibilidad al aplicar el rediseño es mayor
ahí que en las pantallas más simples de las otras historias.

**Independent Test**: Generar un bracket, ver su estructura, y registrar el
resultado de un partido → toda la información se distingue claramente
(quién ganó, qué partidos están pendientes, mensajes de error) y ninguna
acción cambia su comportamiento respecto al estado anterior al rediseño.

**Acceptance Scenarios**:

1. **Given** un admin viendo un bracket generado, **When** observa la
   pantalla, **Then** distingue claramente partidos, jugadores y
   resultados ya cargados, con la nueva identidad visual aplicada.
2. **Given** un admin registrando el resultado de un partido, **When**
   ocurre un error de validación (por ejemplo datos incompletos), **Then**
   el mensaje de error se distingue con claridad sobre el fondo oscuro,
   igual de rápido que antes del rediseño.

---

### Edge Cases

- ¿Qué pasa con los mensajes de error/éxito que ya usan colores con
  significado (rojo para error, verde para éxito/confirmación)? Deben
  seguir siendo distinguibles entre sí y respecto al verde neón de marca,
  sin generar confusión entre "acción primaria" y "éxito/error".
- ¿Qué pasa con botones deshabilitados (ej. durante el envío de un
  formulario)? Deben seguir percibiéndose como no interactivos sobre el
  nuevo fondo oscuro.
- ¿Qué pasa si la tipografía Rajdhani no carga (sin conexión, bloqueo de
  fuentes externas)? El sitio debe seguir siendo legible con una tipografía
  de respaldo equivalente.
- ¿Qué pasa con tablas de datos densas (listado de inscritos, bracket con
  muchos partidos)? El contraste y los bordes sutiles deben evitar que las
  filas/celdas se vuelvan difíciles de distinguir entre sí.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Todas las pantallas del sitio (públicas y de administración)
  MUST usar fondo oscuro (#0a0a0a) como color de fondo principal.
- **FR-002**: El verde neón (#00ff87) MUST ser el color primario para
  elementos de acción y acentos destacados (botones principales, enlaces
  activos, elementos seleccionados) en todas las pantallas.
- **FR-003**: La tipografía Rajdhani MUST ser la tipografía principal de
  todo el texto del sitio.
- **FR-004**: Las tarjetas y contenedores de contenido (formulario de
  inscripción, formulario de login, listados, vista de bracket, formulario
  de registro de resultados) MUST usar un fondo oscuro diferenciado del
  fondo general de la página, con bordes sutiles que delimiten cada tarjeta.
- **FR-005**: El rediseño MUST aplicarse, sin excepción, a estas cinco
  superficies existentes: formulario de inscripción público, login de
  administrador, panel admin (navegación y listado de inscritos), vista de
  bracket (ambos juegos), y formulario de registro de resultados de
  partido.
- **FR-006**: El rediseño MUST NOT alterar ningún comportamiento funcional
  existente: mismas validaciones, mismas llamadas a la API, misma
  navegación, mismas reglas de negocio. Es un cambio exclusivamente visual.
- **FR-007**: Los estados semánticos ya existentes en la interfaz (mensaje
  de error, mensaje de éxito/confirmación, elemento deshabilitado) MUST
  seguir siendo distinguibles entre sí y respecto al color primario de
  marca dentro de la nueva paleta oscura.
- **FR-008**: El contraste entre texto y fondo MUST mantenerse suficiente
  para que todo el contenido siga siendo legible en cada una de las cinco
  superficies — la estética MUST NOT sacrificar la legibilidad.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de las pantallas del sitio (públicas y admin)
  muestran la misma paleta de color y tipografía tras el rediseño, sin
  pantallas "huérfanas" con el estilo anterior.
- **SC-002**: El 100% de los flujos funcionales existentes (inscribirse,
  login de admin, navegar el panel, generar bracket, registrar resultado,
  eliminar jugador, cerrar/abrir inscripciones, cerrar sesión) sigue
  funcionando exactamente igual después del rediseño — cero regresiones
  funcionales.
- **SC-003**: Un usuario nuevo identifica un mensaje de error o de éxito en
  menos de 2 segundos de que aparece en pantalla, igual que antes del
  rediseño.
- **SC-004**: El tiempo de carga percibido de cualquier pantalla no
  aumenta de forma perceptible para el usuario tras aplicar el rediseño.

## Assumptions

- Esta feature es exclusivamente visual (colores, tipografía, bordes,
  espaciado de tarjetas); ninguna estructura de componentes, ruta,
  endpoint o regla de negocio cambia como parte de este trabajo.
- La paleta y tipografía solicitadas (fondo `#0a0a0a`, primario `#00ff87`,
  tipografía Rajdhani, tarjetas oscuras con bordes sutiles) son las
  decisiones de marca fijas; los tonos derivados completos (fondos
  secundario/terciario, texto, bordes, estilos de botón/input/tabla,
  efectos hover) están documentados en detalle en `/constitution.md`
  (raíz del repo, sección "Diseño — Estética Gaming"), que esta feature
  trata como fuente de verdad para valores no cubiertos arriba.
- No se requiere un modo claro alternativo ni preferencia de tema por
  usuario: el rediseño oscuro aplica de forma obligatoria a todo el sitio.
- **Dependencia de gobernanza (resuelta)**: la constitución del proyecto
  (`.specify/memory/constitution.md`) ya incorpora el Principio VI -
  Identidad Visual Gaming, y se removió de `/constitution.md` el bloque
  "Sin temas oscuros forzados" que contradecía este rediseño. Ya no hay
  bloqueo de gobernanza para pasar a `/speckit-plan`.
