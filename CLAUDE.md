# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan:
`specs/007-rediseno-visual-gaming/plan.md`
<!-- SPECKIT END -->

## Project

Tournament management system for 2 games:
- **FC 25** → Single-Elimination bracket
- **Call of Duty Black Ops 2** → Double-Elimination bracket

Players self-register via public form. Only the admin can record results and manage the tournament. Built with Spec-Driven Development (Spec Kit) — see `constitution.md` for non-negotiable principles and design system, and `specs/<NNN-feature>/` for per-feature spec/plan/tasks.

## Stack
- `client/` — React 18 + Vite + TypeScript + Tailwind CSS, React Router v7
- `server/` — Node.js + Express + TypeScript, Prisma ORM, JWT (manual) + bcrypt auth
- `shared/types/` — TypeScript types shared between client and server (`auth.ts`, `inscripcion.ts`, `bracket.ts`)
- PostgreSQL database (`server/prisma/schema.prisma`)

## Commands

Run from `server/`:
- `npm run dev` — start API with ts-node-dev (hot reload), reads `server/.env`
- `npm run build` / `npm start` — compile to `dist/` and run
- `npm run prisma:generate` — regenerate Prisma client after schema changes
- `npm run prisma:migrate` — create/apply a dev migration
- `npm run seed` — run `prisma/seed.ts`
- `npm run lint` — ESLint over `.ts`

Run from `client/`:
- `npm run dev` — Vite dev server
- `npm run build` — `tsc -b && vite build`
- `npm run lint` — ESLint over `.ts,.tsx`

No test runner is configured in either package yet.

## Architecture

**Server** (`server/src/`) follows routes → controllers → services:
- `routes/*.routes.ts` — endpoint definitions, mounted in `index.ts`
- `controllers/*.controller.ts` — request/response handling, calls services
- `services/*.ts` — business logic and Prisma queries (DB access only happens here, never in routes/controllers)
- `middleware/auth.middleware.ts` — `requireAdmin` JWT guard; `middleware/async-handler.ts` wraps async route handlers
- `index.ts` mounts: `/api` (public inscripciones/auth/brackets), `/api/admin` (gated by `requireAdmin`), `/api/partidos` (gated by `requireAdmin`)

Admin-gated routers (`admin-inscripciones`, `admin-bracket`, `partidos`) require `requireAdmin` — the admin is the only actor that can mutate tournament state (enforced in constitution.md, not just convention).

**Bracket model** (`server/prisma/schema.prisma`): a `Bracket` belongs to one `Juego` (FC25 | COD_BO2) and has a `formato` (SINGLE_ELIMINATION | DOUBLE_ELIMINATION). `Partido` rows link via `nextMatchId`/`nextLoserMatchId` to model bracket progression, with `lado` (WINNERS | LOSERS) used only for double-elimination. Bracket-generation and result-validation logic lives in `services/bracket.ts` and `services/partido-validation.ts`.

**Client** (`client/src/`):
- `pages/` — route-level views (e.g. `InscripcionPage`, `AdminLoginPage`, `AdminBracketFc25Page`, `AdminBracketCodPage`)
- `components/<domain>/` — UI grouped by domain (`admin/`, `brackets/`, `inscripcion/`, `layout/`)
- `api/` — backend calls (keep fetch logic out of components per constitution.md)
- `hooks/` — reusable logic

## Conventions (from constitution.md)

- Never use `any` in TypeScript; every function has an explicit return type
- Don't install new libraries without approval first
- Every feature needs a spec (`specs/<NNN-name>/spec.md`) before coding
- Commits in Spanish, descriptive
- Components: PascalCase; functions/variables: camelCase; utility files: kebab-case
- REST endpoints: `/api/v1/resource` pattern (note: current routes use `/api/...` without version prefix — follow existing router style in `server/src/routes/`)
- Code/identifiers in English; comments and commit messages in Spanish
- No business logic in UI components; no direct DB calls from routes; never expose passwords/tokens in API responses; no magic numbers/hardcoded IDs

## Design system (gaming/EA Sports FC 25 aesthetic)

Full spec in `constitution.md`. Key constraints when touching `client/` UI:
- Dark theme only — backgrounds `#0a0a0a`/`#111111`/`#1a1a1a`, never white backgrounds or pastel colors
- Primary accent `#00ff87` (neon green) used sparingly — no mixing multiple accent colors
- Font: 'Rajdhani' or 'Barlow Condensed', bold uppercase tracked-out titles, never serif
- `border-radius` max 6px on cards, max 4px on buttons; no heavy gradients except hero elements
- Hover/transition timing: 200ms

## Spec Kit workflow

This repo uses Spec Kit skills (`speckit-specify`, `speckit-plan`, `speckit-tasks`, `speckit-implement`, `speckit-clarify`, `speckit-analyze`, `speckit-checklist`, `speckit-converge`) to drive feature work through `specs/<NNN-feature-name>/` (spec.md → plan.md → tasks.md). Check the active feature's `plan.md` for tech/context before implementing, and its `tasks.md` for the actionable breakdown.
