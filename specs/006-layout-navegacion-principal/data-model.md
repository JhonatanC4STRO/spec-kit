# Data Model: Layout Principal con Navegación

Esta feature no agrega ni modifica entidades de base de datos: no toca
`/server/prisma/schema.prisma` ni `/shared/types`. El único "estado" nuevo es
puramente client-side, ya existente en `client/src/services/authStore.ts`.

## Sesión de administrador (estado client-side, no persistido en DB)

| Campo | Tipo | Notas |
|-------|------|-------|
| token | string \| null | en memoria (`authStore.ts`); `null` = sin sesión, string = sesión admin activa |

**Reglas (de esta feature)**:

- El layout (`AppLayout.tsx`) lee `getToken()` para decidir qué navegación
  renderizar: `token === null` → `NavPublica`; `token !== null` → `NavAdmin`.
- "Cerrar sesión" llama `limpiarToken()` (ya existente en `authStore.ts`, sin
  cambios) y redirige a una vista pública. No hay invalidación server-side:
  el JWT ya es stateless, por lo que limpiar el token del cliente es
  suficiente (igual que ya lo es no enviarlo en una request).
- No se introduce persistencia entre recargas de página (el token ya se
  pierde al refrescar, comportamiento preexistente de 002 que esta feature no
  cambia).

## Secciones de navegación (conceptual, no es una entidad de datos)

| Sección | Ruta | Visible para |
|---------|------|---------------|
| Inicio / inscripción | `/` | todos |
| Login admin | `/admin/login` | visitantes sin sesión (enlace visible); admin con sesión no lo ve |
| Listado de inscritos | `/admin/jugadores` | solo admin con sesión |
| Bracket FC25 | `/admin/bracket/fc25` | solo admin con sesión |
| Bracket Call of Duty | `/admin/bracket/cod-bo2` | solo admin con sesión |

Las tres rutas admin ya están protegidas hoy por el patrón existente
(`if (token === null) return <Navigate to="/admin/login" />`) dentro de cada
página; esta feature no cambia esa protección, solo agrega la navegación
visible que lleva a esas rutas y la separación del bracket combinado en dos
rutas (una por juego).
