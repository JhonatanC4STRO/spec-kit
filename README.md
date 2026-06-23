# Torneo SENA — FC 25 / Call of Duty Black Ops 2

Sistema de gestión de torneos para 2 juegos:

- **FC 25** → bracket de eliminación simple
- **Call of Duty Black Ops 2** → fase de grupos + bracket de eliminación doble

Los jugadores se inscriben desde un formulario público. Solo el administrador puede registrar resultados y gestionar el torneo.

## Stack

- `client/` — React 18 + Vite + TypeScript + Tailwind CSS
- `server/` — Node.js + Express + TypeScript + Prisma ORM
- `shared/types/` — tipos TypeScript compartidos entre client y server
- PostgreSQL (base de datos)

## Requisitos previos

- Node.js 18 o superior
- PostgreSQL en ejecución (local o remoto)
- npm

## 1. Clonar el repositorio

```bash
git clone https://github.com/JhonatanC4STRO/spec-kit.git
cd spec-kit
```

## 2. Base de datos

Hay dos formas de tener Postgres para desarrollo:

**Opción A — Base de datos local:** crea una base vacía en tu Postgres local:

```sql
CREATE DATABASE torneo;
```

**Opción B — Base de datos compartida del equipo:** el proyecto usa una instancia de Postgres en un VPS compartido para que todos vean los mismos datos. Pide el `DATABASE_URL` completo a quien administra el VPS (no está en el repo por seguridad) y pégalo en tu `server/.env`. No se necesita crear ni migrar nada: el esquema ya está aplicado.

## 3. Backend (`server/`)

```bash
cd server
npm install
```

Copia el archivo de ejemplo de variables de entorno y completa tus datos:

```bash
cp .env.example .env
```

Edita `server/.env`:

```env
DATABASE_URL="postgresql://USUARIO:PASSWORD@localhost:5432/torneo?schema=public"
PORT=3000
JWT_SECRET="reemplazar-con-secreto-largo-aleatorio"
```

Aplica las migraciones y genera el cliente de Prisma:

```bash
npm run prisma:migrate
npm run prisma:generate
```

(Opcional) Carga datos iniciales — crea un admin de prueba y abre las inscripciones de ambos juegos:

```bash
npm run seed
```

Esto crea el administrador:

- **Email:** `admin@torneo.com`
- **Password:** `admin123`

Inicia el backend en modo desarrollo (puerto `3000`):

```bash
npm run dev
```

## 4. Frontend (`client/`)

En otra terminal:

```bash
cd client
npm install
npm run dev
```

El frontend corre en `http://localhost:5173` y proxea las peticiones `/api` al backend en `http://localhost:3000` (configurado en `vite.config.ts`), así que no necesita variables de entorno propias.

## 5. Usar la app

- Landing pública: `http://localhost:5173/home`
- Formulario de inscripción: `http://localhost:5173/`
- Login admin: `http://localhost:5173/admin/login`
- Brackets públicos (solo lectura): `http://localhost:5173/bracket/fc25` y `/bracket/cod-bo2`

## Comandos útiles

**Backend** (`server/`):

| Comando | Descripción |
|---|---|
| `npm run dev` | API con hot reload |
| `npm run build` / `npm start` | compila a `dist/` y ejecuta |
| `npm run prisma:generate` | regenera el cliente Prisma tras cambios al schema |
| `npm run prisma:migrate` | crea/aplica una migración de desarrollo |
| `npm run seed` | ejecuta `prisma/seed.ts` |
| `npm run lint` | ESLint sobre `.ts` |

**Frontend** (`client/`):

| Comando | Descripción |
|---|---|
| `npm run dev` | servidor Vite |
| `npm run build` | `tsc -b && vite build` |
| `npm run lint` | ESLint sobre `.ts,.tsx` |

## Notas

- No hay test runner configurado todavía en ninguno de los dos paquetes.
- Documentación de arquitectura y convenciones del proyecto en [CLAUDE.md](CLAUDE.md).
- Especificaciones por feature (spec → plan → tasks) en `specs/<NNN-feature>/`.
