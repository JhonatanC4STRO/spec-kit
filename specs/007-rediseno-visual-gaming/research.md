# Research: Rediseño Visual con Estética Gaming

## 1. Carga de la tipografía Rajdhani

**Decision**: `<link rel="preconnect">` + `<link>` de Google Fonts en
`client/index.html` (familia `Rajdhani`, pesos regular/bold), con
`Barlow Condensed, sans-serif` como fallback en `fontFamily.sans` de
Tailwind. Google Fonts ya aplica `font-display: swap` por defecto en sus
URLs modernas.

**Rationale**: Es el mecanismo que la propia constitución sugiere
("Rajdhani ... Google Fonts"); no requiere instalar ningún paquete npm
(Principio V), ni gestionar archivos `.woff2` propios. `preconnect` +
`swap` evita bloquear el primer render mientras carga la fuente (SC-004).

**Alternatives considered**:
- Self-host de los archivos `.woff2`: evita una petición a un dominio
  externo, pero agrega mantenimiento de assets de fuente sin necesidad
  real para el alcance de este sitio.
- `@import` dentro de `index.css`: funcionalmente similar a usar `<link>`,
  pero retrasa el descubrimiento de la fuente porque el navegador debe
  primero descargar y parsear el CSS antes de ver el `@import`; `<link>`
  en el `<head>` se descubre antes.

## 2. Modelado de la paleta en Tailwind

**Decision**: Tokens semánticos en `theme.extend.colors` de
`tailwind.config.cjs`: `bg.base` (`#0a0a0a`), `bg.card` (`#111111`),
`bg.alt` (`#1a1a1a`), `primary` (`#00ff87`), `edge` (`#2a2a2a`,
border), `text.secondary` (`#999999`). Los componentes consumen estos
tokens vía clases (`bg-bg-card`, `border-edge`, `text-primary`, etc.),
nunca hex inline.

**Rationale**: Cumple el Principio IV ("No hardcodear strings de colores:
MUST usar clases de Tailwind") de forma literal, y centraliza los 7
valores de marca en un solo archivo — si la marca ajusta un tono, se
cambia en un solo lugar en vez de buscar hex sueltos en 12 componentes.

**Alternatives considered**:
- Clases arbitrarias de Tailwind (`bg-[#0a0a0a]`) directamente en cada
  componente: funciona, pero reintroduce los hex sueltos que el Principio
  IV busca evitar, y dificulta un cambio de marca futuro.
- CSS variables (`:root { --bg-base: ... }`) consumidas vía `style={}`:
  rompe el principio de "Tailwind utility classes únicamente" de
  `/constitution.md` y mezcla dos sistemas de estilos.

## 3. Colores derivados para estados semánticos no cubiertos por la paleta de marca

**Decision**: La paleta de marca no define explícitamente colores de
error/éxito/advertencia (solo fondo, primario, texto y bordes). Se eligen
tonos Tailwind estándar que se distinguen claramente del verde primario de
marca sobre fondo oscuro: error en rojo claro (`text-red-400`), éxito en
verde esmeralda distinto del primario (`text-emerald-300`, NO el mismo
`#00ff87`), advertencia en ámbar claro (`text-amber-300`) — todos sobre
`bg-bg-card`/`border-edge`.

**Rationale**: Resuelve el Edge Case de `spec.md` ("no generar confusión
entre 'acción primaria' y 'éxito/error'") manteniendo el verde primario de
marca exclusivo para acciones, y separando visualmente "esto funcionó"
de "esto es lo que hay que tocar para avanzar el torneo". Cumple FR-007/
FR-008 (contraste/legibilidad) sin contradecir la paleta fija del
Principio VI, que esos tonos derivados explícitamente permite definir con
"criterio de contraste razonable".

**Alternatives considered**:
- Reusar el verde primario (`#00ff87`) también para mensajes de éxito:
  descartado explícitamente por el Edge Case de la spec — confundiría
  "botón de acción" con "confirmación de éxito".
- Definir error/éxito/advertencia como tokens nuevos en
  `tailwind.config.cjs` en vez de usar la paleta default de Tailwind:
  válido y más "puro" respecto al Principio IV, pero sobre-ingeniería para
  3 colores derivados que no son parte de la identidad de marca fija (a
  diferencia de fondo/primario/bordes, que sí lo son).
