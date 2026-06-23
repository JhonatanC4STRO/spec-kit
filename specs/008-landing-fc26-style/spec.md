# Feature Specification: Landing Page Pública estilo EA Sports FC 26

**Feature Branch**: `008-landing-fc26-style`

**Created**: 2026-06-22

**Status**: Draft

**Input**: User description: "Rediseñar este sitio al estilo EA Sports FC 26 con secciones: navbar con dropdowns, hero Ultimate Edition, grid de noticias, sección de valoraciones (ratings), sección de autenticidad, grid de más productos, sección mobile feature, y footer completo. Nueva landing pública estática, en ruta separada de la página de inscripción actual (que permanece en "/" sin cambios). Contenido placeholder ya que la app es una plataforma de torneos sin entidades de noticias/ratings/productos."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitante descubre la plataforma a través de la landing (Priority: P1) 🎯 MVP

Un visitante nuevo llega a la landing pública con estética EA Sports FC 26
(hero, noticias, valoraciones, autenticidad, productos, mobile, footer) y
puede navegar desde ahí hacia el formulario de inscripción real sin
confusión sobre qué contenido es real (inscripción) y cuál es ilustrativo
(noticias/ratings/productos).

**Why this priority**: Es la nueva puerta de entrada visual del sitio; sin
ella no existe el rediseño solicitado, y es la única historia que entrega
valor por sí sola (una landing visualmente completa es demostrable de forma
independiente).

**Independent Test**: Abrir la ruta de la landing → se ven las 6 secciones
de contenido más el footer con la estética EA Sports FC 26 (fondo oscuro,
verde neón, navbar fija); hacer clic en el CTA principal ("Juega ya") lleva
al formulario de inscripción existente en `/`.

**Acceptance Scenarios**:

1. **Given** un visitante abre la ruta de la landing, **When** la página
   carga, **Then** ve, en orden, navbar fija, hero (Ultimate Edition), grid
   de noticias, sección de valoraciones, sección de autenticidad, grid de
   productos, sección mobile, y footer.
2. **Given** un visitante en la landing, **When** hace clic en el botón
   "Juega ya" del hero, **Then** es llevado al formulario de inscripción
   existente en `/`, sin alterar el comportamiento de dicho formulario.
3. **Given** un visitante en la landing, **When** observa las secciones de
   noticias, valoraciones, autenticidad y productos, **Then** todo el
   contenido (textos, cifras, nombres) es claramente genérico/ilustrativo y
   no implica datos reales de torneos, jugadores inscritos ni resultados.

---

### User Story 2 - Visitante navega la landing en distintos tamaños de pantalla (Priority: P2)

Un visitante accede a la landing desde mobile, tablet o desktop y el
contenido se reorganiza de forma legible sin desbordes ni elementos
solapados, manteniendo la navbar usable en todos los tamaños.

**Why this priority**: La landing es la primera impresión del sitio; una
landing rota en mobile (mayoría del tráfico de descubrimiento) anula el
valor de la US1 para esa audiencia.

**Independent Test**: Cargar la landing en un viewport mobile (<768px), uno
intermedio (768–1199px) y uno desktop (≥1200px) → en cada uno el contenido
de las 6 secciones y el footer se lee sin scroll horizontal, sin overlap de
texto/imágenes, y la navbar colapsa a un patrón usable en mobile.

**Acceptance Scenarios**:

1. **Given** un visitante con viewport menor a 768px, **When** abre la
   landing, **Then** las secciones de dos columnas se apilan en una sola
   columna y la navbar expone sus opciones sin recortarse.
2. **Given** un visitante con viewport mayor o igual a 1200px, **When** abre
   la landing, **Then** las secciones usan el layout de columnas descrito
   (hero, valoraciones, autenticidad) sin que el contenido quede
   excesivamente angosto o con espacios vacíos desproporcionados.

---

### User Story 3 - Visitante interactúa con elementos no funcionales de forma predecible (Priority: P3)

Un visitante hace hover/clic sobre elementos de la landing que son
ilustrativos (dropdowns de navbar, botones "Más información"/"Explorar"/
"Live Now", ícono de perfil) y el sitio responde de forma consistente
(efecto visual de hover, o navegación a un destino real conocido) sin
enlaces rotos ni errores de consola.

**Why this priority**: Es pulido de experiencia, no bloquea el valor
principal de la landing (US1), pero evita que el sitio se sienta
incompleto o roto al explorarlo.

**Independent Test**: Pasar el mouse sobre cada ítem del navbar y sobre cada
tarjeta/botón de las 6 secciones → todos muestran un efecto de hover
consistente; los botones que no llevan a una página real (ej. "Más
información", "Explorar", "Live Now") no producen error ni navegan a una URL
rota.

**Acceptance Scenarios**:

1. **Given** un visitante pasa el cursor sobre un ítem del navbar con
   dropdown, **When** el dropdown se abre, **Then** muestra sus opciones sin
   solaparse con el contenido de la página.
2. **Given** un visitante hace clic en el ícono de perfil del navbar,
   **When** ocurre el clic, **Then** es llevado al login de administrador
   existente (`/admin/login`).
3. **Given** un visitante hace clic en botones puramente ilustrativos
   ("Más información", "Explorar", "Live Now", "Jugar" de la sección
   mobile), **When** ocurre el clic, **Then** el sitio no produce un error
   visible ni una navegación a una ruta inexistente.

---

### Edge Cases

- ¿Qué pasa si el visitante ya tiene sesión de admin activa y visita la
  landing? El ícono de perfil sigue llevando a la sección de admin
  correspondiente (login si no hay sesión, o el panel si ya la hay), sin
  que la landing dependa de lógica de autenticación adicional a la ya
  existente.
- ¿Qué pasa con las imágenes de jugadores/juego (cover art, foto de
  autenticidad, mobile feature) si no cargan? Deben tener un estado de
  respaldo (fondo oscuro liso o placeholder) que no rompa el layout de la
  sección.
- ¿Qué pasa si las inscripciones están cerradas y el visitante llega desde
  el CTA "Juega ya"? El comportamiento es el mismo que ya existe en `/`
  (mensaje de "inscripciones cerradas"); la landing no duplica ni anticipa
  ese estado.
- ¿Qué pasa con los textos truncados ("...") de las tarjetas de noticias en
  pantallas muy angostas? El truncado debe seguir aplicándose sin desbordar
  el ancho de la tarjeta.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST exponer una landing pública en una ruta
  distinta de `/` (la cual sigue sirviendo el formulario de inscripción sin
  cambios).
- **FR-002**: La landing MUST mostrar, en este orden, las siguientes
  secciones: navbar fija, hero ("Ultimate Edition"), grid de noticias,
  sección de valoraciones, sección de autenticidad, grid de productos,
  sección mobile feature, y footer.
- **FR-003**: La navbar MUST permanecer fija (visible) durante el scroll de
  la página, con fondo oscuro semitransparente, logo a la izquierda, los
  ítems de menú especificados con comportamiento de dropdown, e ícono de
  perfil a la derecha.
- **FR-004**: El botón CTA principal del hero ("Juega ya") MUST navegar al
  formulario de inscripción existente en `/`.
- **FR-005**: El ícono de perfil de la navbar MUST navegar al flujo de
  administrador existente (`/admin/login` o panel si ya hay sesión).
- **FR-006**: Todo el contenido de las secciones de noticias, valoraciones,
  autenticidad y productos MUST ser contenido estático/ilustrativo (no MUST
  consultar ni representar datos reales de inscripciones, jugadores o
  resultados de torneo).
- **FR-007**: Los botones y elementos puramente ilustrativos (dropdowns sin
  destino real, "Más información", "Explorar", "Live Now", botón "Jugar" de
  mobile feature) MUST tener un efecto visual de hover/interacción pero
  MUST NOT producir errores ni enlaces rotos.
- **FR-008**: La landing MUST ser responsive: en viewports menores a 768px
  las secciones de múltiples columnas MUST apilarse en una sola columna
  legible; en viewports de 768px a 1199px y de 1200px o más MUST mantener
  los layouts de columnas descritos sin desbordes ni solapamientos.
- **FR-009**: La landing MUST seguir la paleta oscura del sitio (fondo
  negro/gris muy oscuro, texto blanco/gris claro, acento verde neón en
  CTAs/badges) y MUST usar tipografía Inter (o sans-serif moderna
  equivalente) en lugar de Rajdhani, exclusivamente para esta superficie
  (ver Assumptions — excepción de gobernanza).
- **FR-010**: Todos los botones de la landing MUST tener `border-radius` de
  4px y transición de hover de 200ms, consistente con el resto del sitio.
- **FR-011**: La landing MUST NOT modificar el comportamiento, las rutas ni
  los componentes de las superficies existentes (inscripción, login admin,
  panel admin, brackets, registro de resultados).

### Key Entities

- Esta feature no introduce entidades de datos nuevas: "noticias",
  "valoraciones", "productos" y "estadísticas de autenticidad" son
  contenido estático embebido en la UI, no registros persistidos ni
  consultados desde la API.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de las 6 secciones de contenido más el footer son
  visibles y legibles al recorrer la landing de arriba a abajo en cualquiera
  de los 3 rangos de viewport definidos (< 768px, 768–1199px, ≥ 1200px).
- **SC-002**: El 100% de los flujos funcionales existentes (inscribirse,
  login admin, navegación admin, bracket, resultados) sigue funcionando
  exactamente igual después de agregar la landing — cero regresiones en
  superficies existentes.
- **SC-003**: Un visitante nuevo logra llegar del hero de la landing al
  formulario de inscripción en un clic.
- **SC-004**: Cero errores de consola o enlaces rotos al interactuar con
  todos los elementos clicables de la landing (navbar, dropdowns, botones
  ilustrativos, CTAs).

## Assumptions

- La landing es una superficie nueva, independiente de las 5 superficies
  cubiertas por `007-rediseno-visual-gaming`; no reemplaza ni modifica
  ninguna de ellas.
- Contenido de noticias/valoraciones/productos/autenticidad es estático y
  placeholder (textos, cifras e imágenes ilustrativas), ya que la
  plataforma no tiene esas entidades de datos. No se requiere CMS ni panel
  de edición de este contenido en esta feature.
- Los ítems de dropdown de la navbar (Games, Ratings, FC FUTURES, FC Pro,
  Estadísticas, Novedades, Comunidad) son decorativos/ilustrativos salvo
  donde la spec indica explícitamente un destino real (CTA del hero → `/`,
  ícono de perfil → flujo de admin existente).
- **Excepción de gobernanza (tipografía)**: el Principio VI de la
  constitución (`.specify/memory/constitution.md`) exige Rajdhani como
  tipografía de todo el sitio, fijado durante `007-rediseno-visual-gaming`.
  Esta feature requiere, explícitamente a pedido del usuario, una excepción
  para usar Inter (o sans-serif moderna equivalente) únicamente en esta
  landing nueva, manteniendo Rajdhani sin cambios en las 5 superficies ya
  cubiertas por 007. Esta excepción MUST quedar reflejada en la
  constitución antes de `/speckit-plan` (ver tarea de actualización de
  gobernanza asociada a esta feature).
- La ruta exacta de la landing (ej. `/home`) se decide en la fase de
  planificación; el único requisito de esta spec es que sea distinta de
  `/` y no interfiera con las rutas existentes.
