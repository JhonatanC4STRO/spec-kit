# Constitution — Sistema de Gestión de Torneos

## Stack
- React (Vite) — frontend
- Node.js + Express — backend/API
- PostgreSQL + Prisma — base de datos
- JWT manual con bcrypt — autenticación del admin
- Tailwind CSS — estilos

## Descripción del sistema
Plataforma de gestión de torneos para 2 juegos:
- **FC 25** → formato Single-Elimination bracket
- **Call of Duty Black Ops 2** → formato Double-Elimination bracket

Los jugadores se inscriben por formulario público.
Solo el administrador puede registrar resultados y gestionar el torneo.

## Principios inamovibles
- Nunca usar `any` en TypeScript
- Toda función debe tener su tipo de retorno explícito
- No instalar librerías sin aprobar primero
- Commits en español, descriptivos
- Toda feature debe tener su spec antes de codear
- El admin es el único que puede modificar datos del torneo

## Estructura de carpetas
/client → React (frontend)
  /src
    /components → componentes UI puros
    /pages      → vistas principales
    /hooks      → lógica reutilizable
    /api        → llamadas al backend

/server → Node.js + Express (backend)
  /routes     → endpoints de la API
  /controllers → lógica de negocio
  /middleware  → auth, validaciones
  /prisma     → schema y migraciones

## Convenciones de código
- Componentes: PascalCase (ej: BracketView.tsx)
- Funciones y variables: camelCase (ej: getPlayerById)
- Archivos de utilidad: kebab-case (ej: auth-helpers.ts)
- Endpoints REST: /api/v1/recurso

## Patrones prohibidos
- No mezclar lógica de negocio en componentes de UI
- No hacer llamadas directas a la DB desde las rutas
- No exponer contraseñas ni tokens en respuestas de la API
- No hardcodear IDs ni valores mágicos

## Idioma
- Código y variables: inglés
- Comentarios: español
- Commits: español

## Diseño — Estética Gaming (EA Sports FC 25)

### Paleta de colores
- Fondo base: #0a0a0a (negro absoluto)
- Fondo secundario: #111111 (negro suave para cards)
- Fondo terciario: #1a1a1a (negro medio para secciones alternas)
- Color primario: #00ff87 (verde neón EA Sports)
- Color texto principal: #ffffff (blanco puro)
- Color texto secundario: #999999 (gris claro)
- Bordes: #2a2a2a (gris oscuro sutil)

### Tipografía
- Fuente principal: 'Rajdhani' o 'Barlow Condensed' (Google Fonts)
- Títulos: bold, mayúsculas, tracking amplio (letter-spacing: 0.1em)
- Cuerpo: peso regular, tamaño legible
- Nunca usar fuentes serif

### Layout
- Fondo oscuro en toda la aplicación, sin excepciones
- Secciones separadas por cambios sutiles de tono de negro
- Cards con fondo #111111 y borde sutil #2a2a2a
- Imágenes y elementos visuales ocupan espacio generoso
- Espaciado amplio entre secciones (padding vertical grande)

### Componentes
- Botones primarios: fondo #00ff87, texto negro, sin bordes redondeados extremos
- Botones secundarios: fondo transparente, borde #ffffff, texto blanco
- Inputs: fondo #1a1a1a, borde #2a2a2a, texto blanco, sin fondo blanco
- Navbar: fondo negro con transparencia, pegado al top
- Tablas: filas alternas en #111111 y #0a0a0a

### Efectos visuales
- Sombras sutiles en cards (box-shadow oscura, no blanca)
- Hover en botones: brillo leve en el color primario
- Transiciones suaves (200ms) en hovers
- Sin gradientes llamativos — solo en elementos hero si aplica
- Sin bordes redondeados excesivos (máximo border-radius: 4px)

### Patrones prohibidos de diseño
- No usar fondos blancos en ninguna pantalla
- No usar colores pastel ni suaves
- No usar sombras blancas o claras
- No usar border-radius mayor a 6px en cards
- No mezclar múltiples colores de acento