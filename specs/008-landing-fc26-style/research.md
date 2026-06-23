# Research: Landing Page Pública estilo EA Sports FC 26

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

No quedan `NEEDS CLARIFICATION` en el Technical Context del plan (stack
heredado del proyecto existente). Este research cubre las decisiones de
diseño técnico necesarias para resolver los requisitos de la spec sin
violar FR-011 (cero cambios en superficies existentes) ni el Principio VI
(identidad visual, con la excepción nominal ya incorporada en la
constitución v2.3.0).

## 1. Montaje de la ruta: layout propio vs. reutilizar `AppLayout`

**Decision**: La landing se monta como una rama de rutas independiente
(`<Route path="/home" element={<LandingPage />} />`) **fuera** del
`<Route element={<AppLayout/>}>` existente en `App.tsx`. `LandingPage`
incluye su propio `LandingNavbar` y `Footer`; no renderiza `AppLayout`,
`NavPublica` ni `NavAdmin`.

**Rationale**: `AppLayout` decide qué nav mostrar (`NavPublica` vs.
`NavAdmin`) en función de si hay un token de sesión (`getToken()`). La
navbar EA-style de la landing (dropdowns, ícono de perfil, logo) es un
componente visualmente distinto que no depende de esa lógica de sesión de
la misma forma — el único punto de contacto es que el ícono de perfil
navega al flujo de admin existente (FR-005), lo cual se resuelve con un
simple `<Link to="/admin/login">`, sin necesitar el árbol de decisión de
`AppLayout`. Reutilizar `AppLayout` envolvería la landing en un `<nav>`
adicional (`NavPublica` o `NavAdmin`) por encima del `LandingNavbar`,
produciendo dos navbars apiladas y violando FR-002 (orden de secciones
empieza en "navbar fija", singular).

**Alternatives considered**:
- Modificar `AppLayout` para ocultar su `<nav>` condicionalmente según la
  ruta (`/home`) — rechazado: agrega lógica de branching por ruta a un
  componente que hoy es puro (Principio IV), solo para una página.
- Renderizar el `LandingNavbar` dentro de `AppLayout` reemplazando
  `NavPublica`/`NavAdmin` en esa ruta — rechazado: mezclaría dos sistemas de
  navegación (auth-aware vs. EA-style decorativo) en el mismo componente
  compartido, aumentando el acoplamiento sin necesidad.

## 2. Tipografía Inter acotada a la landing

**Decision**: Se agrega un segundo `<link>` de Google Fonts para Inter en
`index.html` (mismo patrón `preconnect` + `display=swap` que el `<link>` de
Rajdhani ya existente, sin removerlo). En `tailwind.config.cjs` se agrega
`theme.extend.fontFamily.landing = ["Inter", "system-ui", "sans-serif"]`,
dejando `fontFamily.sans` (Rajdhani) intacto. `LandingPage.tsx` aplica
`font-landing` en su contenedor raíz; el resto del sitio sigue heredando
`font-sans` (Rajdhani) desde `body` (definido en `index.css`, sin cambios).

**Rationale**: La excepción de gobernanza (constitución v2.3.0, Principio
VI) es nominal a esta superficie — Rajdhani MUST seguir siendo la
tipografía de las 5 superficies de 007. Aplicar la clase en el contenedor
raíz de la landing (no en `body`) es la única forma de cumplir ambos
requisitos a la vez sin condicionar `index.css` por ruta.

**Alternatives considered**:
- Cambiar `fontFamily.sans` global a Inter y referenciar Rajdhani solo en
  los componentes restilizados en 007 — rechazado: invierte la regla
  general/excepción (Rajdhani pasaría a ser la excepción), y obligaría a
  tocar los 12 componentes de 007 que hoy dependen del default `font-sans`,
  violando FR-011.
- Cargar Inter solo cuando se visita `/home` (carga diferida de `<link>` vía
  JS) — rechazado: complejidad innecesaria; `index.html` ya carga Rajdhani
  globalmente sin impacto medido, y Inter es un solo archivo de fuente
  adicional con `display=swap`.

## 3. Breakpoint de 1200px (FR-008)

**Decision**: Se agrega `theme.extend.screens.wide = "1200px"` en
`tailwind.config.cjs`. Los componentes de la landing usan `wide:` (junto al
`md:` por defecto de Tailwind, que ya equivale a 768px) para expresar los 3
rangos de la spec: `< 768px` (sin prefijo, base mobile), `768–1199px`
(`md:`), `≥ 1200px` (`wide:`).

**Rationale**: Los breakpoints por defecto de Tailwind más cercanos son
`lg` (1024px) y `xl` (1280px); ninguno coincide con el 1200px literal de la
spec. Nombrar el breakpoint como token de configuración (en vez de un
valor arbitrario inline tipo `min-[1200px]:`) es consistente con el
Principio IV (sin valores mágicos hardcodeados en JSX).

**Alternatives considered**:
- Usar `lg` (1024px) como aproximación al límite "desktop" — rechazado: no
  cumple el requisito literal de la spec (1200px) y desplazaría el punto de
  cambio de layout sin que la spec lo pida.
- Clase arbitraria de Tailwind `min-[1200px]:` repetida en cada componente
  — rechazado: duplica el valor mágico `1200px` en múltiples archivos en
  vez de centralizarlo una sola vez en la config.

## 4. Elementos ilustrativos sin destino real (FR-007)

**Decision**: Los ítems de dropdown del navbar y los botones puramente
decorativos ("Más información", "Explorar", "Live Now") se implementan como
`<button type="button">` que solo controlan estado local de UI (ej. abrir/
cerrar un dropdown) o no hacen nada perceptible más que el efecto de hover;
ninguno usa `<a href="#">` ni `<Link to="#">`.

**Rationale**: `href="#"` es la causa típica de "enlace roto" percibido
(salta al tope de la página, ensucia el historial de navegación) y
contradice directamente FR-007 ("MUST NOT producir errores ni enlaces
rotos"). Usar `<button>` para acciones no navegables es semánticamente
correcto y evita el problema por construcción.

**Alternatives considered**:
- `<a href="#">` con `preventDefault()` en el handler — rechazado: agrega
  un paso de mitigación a un patrón que ya tiene una alternativa más simple
  y semánticamente correcta (`<button>`).

## 5. Navegación real desde la landing (FR-004, FR-005)

**Decision**: El CTA "Juega ya" del hero y el ícono de perfil del navbar
usan `<Link>` de `react-router-dom` (ya instalado) hacia `/` y
`/admin/login` respectivamente, igual que el resto de la navegación interna
del sitio (`NavPublica`, `NavAdmin`).

**Rationale**: Mantener consistencia con el patrón de navegación SPA ya
usado en el proyecto (sin recargas de página) y con el Principio V
(convenciones ya aprobadas), sin introducir un patrón de navegación nuevo
solo para esta feature.

**Alternatives considered**: Ninguna — es la única opción consistente con
el stack ya aprobado (`react-router-dom`).
