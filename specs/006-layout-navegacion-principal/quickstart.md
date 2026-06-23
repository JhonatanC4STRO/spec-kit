# Quickstart: Layout Principal con Navegación

## Prerrequisitos

- Backend Express (`/server`) y frontend Vite (`/client`) corriendo
  localmente (`npm run dev` en cada uno).
- Una cuenta admin existente (seed: `admin@torneo.com` / `admin123`, ver
  `server/prisma/seed.ts`).

## Escenario 1 — Visitante ve la página de inicio y el enlace a login

1. Abrir `http://localhost:5173/` sin haber iniciado sesión.
2. **Esperado**: se ve el formulario de inscripción como contenido
   principal, y la navegación del layout muestra un enlace visible
   ("Login admin" o equivalente) hacia `/admin/login`.
3. Hacer clic en ese enlace → llega al formulario de login.

## Escenario 2 — Admin navega entre las tres secciones del panel

1. Iniciar sesión como admin en `/admin/login`.
2. **Esperado**: la navegación cambia a la navegación admin, con tres
   accesos: "Inscritos", "Bracket FC25", "Bracket Call of Duty" (y "Cerrar
   sesión").
3. Hacer clic en "Inscritos" → se ve el listado de inscritos
   (`/admin/jugadores`).
4. Hacer clic en "Bracket FC25" → se ve únicamente el bracket de FC25
   (`/admin/bracket/fc25`), sin contenido de Call of Duty.
5. Hacer clic en "Bracket Call of Duty" → se ve únicamente el bracket de
   Call of Duty (`/admin/bracket/cod-bo2`), sin contenido de FC25.
6. En una pestaña/sesión sin token (o tras limpiar el token manualmente),
   intentar abrir directamente cualquiera de las tres URLs admin →
   **Esperado**: redirige a `/admin/login` en los tres casos (FR-008).

## Escenario 3 — Admin cierra sesión

1. Con sesión admin iniciada, en cualquier sección del panel, hacer clic en
   "Cerrar sesión".
2. **Esperado**: la navegación admin desaparece, vuelve la navegación
   pública (enlace a login admin visible).
3. Intentar volver a `/admin/jugadores`, `/admin/bracket/fc25` o
   `/admin/bracket/cod-bo2` → **Esperado**: redirige a `/admin/login` en los
   tres casos (la sesión ya no existe).

## Escenario 4 — Admin con sesión sigue viendo la página de inicio pública

1. Con sesión admin iniciada, navegar a `/`.
2. **Esperado**: se sigue viendo el formulario de inscripción público (la
   navegación admin no reemplaza la página de inicio, solo agrega los
   accesos al panel).
