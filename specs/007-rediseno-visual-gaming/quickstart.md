# Quickstart: Rediseño Visual con Estética Gaming

## Prerrequisitos

- Backend Express (`/server`) y frontend Vite (`/client`) corriendo
  localmente.
- Una cuenta admin existente (seed: `admin@torneo.com` / `admin123`).
- Al menos un jugador inscrito en algún juego (para ver `ListadoJugadores`
  y poder generar un bracket).

## Escenario 1 — Identidad visual consistente en las 5 superficies

1. Abrir `/` (formulario de inscripción), `/admin/login`,
   `/admin/jugadores`, `/admin/bracket/fc25` y `/admin/bracket/cod-bo2`
   (con sesión admin iniciada para las últimas tres).
2. **Esperado**: las 5 pantallas muestran fondo `#0a0a0a`, tarjetas
   oscuras con bordes sutiles, acentos en verde neón `#00ff87` y
   tipografía Rajdhani — ninguna pantalla queda con el estilo claro
   anterior (SC-001).

## Escenario 2 — Estados semánticos distinguibles sobre fondo oscuro

1. En el formulario de inscripción, enviar el formulario vacío →
   **Esperado**: mensaje de error en rojo claro, claramente distinto del
   verde primario de marca.
2. Completar e inscribirse con datos válidos → **Esperado**: mensaje de
   éxito en un verde distinto del verde primario de marca (no debe leerse
   igual al color de los botones de acción).
3. Cuando las inscripciones están cerradas, recargar `/` →
   **Esperado**: aviso de "inscripciones cerradas" en tono de advertencia
   (ámbar), distinguible de error y de éxito.
4. En `ResultadoForm` (registrar resultado de un partido), intentar
   guardar con datos inválidos → **Esperado**: mismo tratamiento de error
   que en el punto 1, legible en menos de 2 segundos (SC-003).

## Escenario 3 — Cero regresiones funcionales

Recorrer manualmente cada flujo ya validado en features previas, ahora con
el nuevo estilo, confirmando que el comportamiento no cambió (FR-006,
SC-002):

1. Inscribirse con datos válidos → la inscripción se guarda igual que
   antes del rediseño.
2. Login admin con credenciales válidas/inválidas → mismo comportamiento
   (token, mensajes de error) que antes.
3. Abrir/cerrar inscripciones, eliminar un jugador → mismo comportamiento.
4. Generar el bracket de un juego, registrar el resultado de un partido
   (incluyendo empate con penales) → mismo comportamiento, incluyendo el
   avance del ganador y la detección de campeón.
5. Navegar el panel admin y cerrar sesión → mismo comportamiento de
   navegación visto en 006-layout-navegacion-principal.

## Escenario 4 — Tipografía con respaldo

1. Bloquear temporalmente el dominio de Google Fonts (DevTools → Network
   → bloquear `fonts.googleapis.com`/`fonts.gstatic.com`) y recargar
   cualquier pantalla.
2. **Esperado**: el sitio sigue siendo legible con la tipografía de
   respaldo (`Barlow Condensed`/`sans-serif`); ningún texto queda oculto o
   ilegible por la fuente faltante.
