# Quickstart: Landing Page Pública estilo EA Sports FC 26

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Validación manual end-to-end de la landing nueva. No hay tests
automatizados en este proyecto (ver `Testing` en `plan.md`); esta guía
cubre los escenarios de aceptación de las 3 user stories de la spec.

## Prerrequisitos

- `cd server && npm run dev` (API en `:3000`)
- `cd client && npm run dev` (Vite en `:5173`)
- Navegador con DevTools abierto (pestaña Consola) durante toda la
  validación, para detectar errores (SC-004).

## Escenario 1 — Contenido completo de la landing (US1, FR-002)

1. Abrir `http://localhost:5173/home`.
2. Verificar, de arriba a abajo, que aparecen en este orden: navbar fija,
   hero ("ULTIMATE EDITION" + CTA "Juega ya"), grid de noticias (4
   tarjetas), sección de valoraciones ("Full Ratings Database" / "Live
   Now"), sección de autenticidad (estadísticas 20.000+/750+/120+/35+),
   grid de productos (3 tarjetas), sección mobile feature (CTA "Jugar"),
   footer.
3. **Esperado**: las 8 secciones son visibles y legibles; fondo oscuro y
   acento verde neón consistentes en toda la página (SC-001).

## Escenario 2 — CTA hacia inscripción real (US1, FR-004, SC-003)

1. En `/home`, hacer clic en el botón "Juega ya" del hero.
2. **Esperado**: navega a `/` (formulario de inscripción existente, sin
   recarga completa de página) en un solo clic.
3. Completar el formulario de inscripción normalmente.
4. **Esperado**: el comportamiento de inscripción es exactamente el mismo
   que antes de esta feature (mismas validaciones, mismos mensajes) — cero
   regresión (FR-011, SC-002).

## Escenario 3 — Ícono de perfil hacia admin (US3, FR-005)

1. En `/home`, sin sesión de admin iniciada, hacer clic en el ícono de
   perfil del navbar.
2. **Esperado**: navega a `/admin/login`.
3. Iniciar sesión como admin y volver a `/home`.
4. Hacer clic en el ícono de perfil otra vez.
5. **Esperado**: navega al flujo de admin correspondiente a sesión activa
   (ej. `/admin/jugadores`), sin alterar el login/logout existentes.

## Escenario 4 — Responsive en los 3 rangos de viewport (US2, FR-008)

1. Con DevTools en modo responsive, probar 3 anchos: 375px (mobile, <768),
   900px (768–1199), 1440px (≥1200).
2. En cada ancho, recorrer las 8 secciones.
3. **Esperado**:
   - 375px: las secciones de dos columnas (hero, ratings, autenticidad,
     mobile feature) se apilan en una sola columna; sin scroll horizontal;
     navbar no recorta sus opciones.
   - 900px: layout intermedio legible, sin overlap de texto/imágenes.
   - 1440px: layouts de columnas completos (50/50) sin espacios vacíos
     desproporcionados.

## Escenario 5 — Elementos ilustrativos sin errores (US3, FR-007, SC-004)

1. En `/home`, pasar el cursor sobre cada ítem del navbar con dropdown.
2. **Esperado**: el dropdown se abre con efecto de hover, sin solaparse con
   el contenido de la página.
3. Hacer clic en cada botón puramente ilustrativo: "Explorar" (flechas),
   "Más información" (valoraciones), "Más información" (autenticidad),
   "Live Now".
4. **Esperado**: cada uno responde con un efecto visual (hover/click) pero
   no navega a una URL rota ni produce errores en la consola del navegador.
5. Revisar la pestaña Consola al final del recorrido completo.
6. **Esperado**: cero errores o warnings nuevos atribuibles a la landing.

## Escenario 6 — Tipografía y paleta acotadas correctamente

1. Inspeccionar con DevTools el `font-family` computado del `<body>` en una
   ruta existente (ej. `/admin/login`).
2. **Esperado**: sigue siendo Rajdhani (sin cambios por esta feature).
3. Inspeccionar el `font-family` computado de un texto dentro de `/home`.
4. **Esperado**: Inter (o su fallback `system-ui`/`sans-serif` si no
   carga), nunca Rajdhani.

## Limpieza

Esta feature no crea datos (sin entidades nuevas, FR-006/Key Entities) — no
se requiere limpieza de base de datos tras la validación.
