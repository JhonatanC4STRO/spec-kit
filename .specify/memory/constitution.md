<!--
Sync Impact Report
Version change: 2.1.0 → 2.2.0 (MINOR — nuevo principio agregado)
Modified principles: ninguno
Added principles: VI. Identidad Visual Gaming (fondo `#0a0a0a`, primario
  `#00ff87`, tipografía Rajdhani, tarjetas oscuras con bordes sutiles,
  legibilidad/contraste obligatorios), aprobado explícitamente por el
  usuario el 2026-06-21 al pedir el rediseño visual en
  007-rediseno-visual-gaming.
Added sections: ninguna (el principio nuevo vive dentro de Core Principles)
Removed sections: ninguna
Changes: resuelve la dependencia de gobernanza señalada por
  007-rediseno-visual-gaming/spec.md — sin este principio, el Constitution
  Check de `/speckit-plan` no tenía referencia normativa para validar la
  paleta/tipografía del rediseño. El nuevo principio remite al detalle
  completo ya documentado en `/constitution.md` (raíz, sección "Diseño —
  Estética Gaming"), en lugar de duplicarlo. Como parte del mismo cambio se
  eliminó de `/constitution.md` un bloque "## Diseño" obsoleto ("Sin temas
  oscuros forzados") que había quedado duplicado y contradecía la sección
  detallada de estética gaming agregada después en el mismo archivo.
Templates requiring updates:
  ✅ .specify/templates/plan-template.md (gate genérico, sin texto de
     principios hardcodeado — no requiere cambios)
  ✅ .specify/templates/spec-template.md (sin referencias a diseño visual)
  ✅ .specify/templates/tasks-template.md (sin referencias a diseño visual)
Follow-up TODOs: `/constitution.md` (raíz del repo, fuera de
  `.specify/memory/`) tenía "Sin temas oscuros forzados" en su sección
  Diseño, contradiciendo este principio — actualizado en el mismo cambio
  para evitar dos documentos de gobernanza contradictorios.

---
Sync Impact Report (histórico)
Version change: 2.0.0 → 2.1.0 (MINOR — nueva dependencia aprobada al stack)
Modified principles: ninguno
Added sections: ninguna
Removed sections: ninguna
Changes: se agrega `react-router-dom` al Stack Tecnológico (frontend), para
  habilitar rutas reales de la SPA (`/`, `/admin/login`, `/admin/jugadores`),
  aprobado explícitamente por el usuario el 2026-06-20.
Templates requiring updates: ninguno (sin referencias duras a routing)
Follow-up TODOs: ninguno

---
Sync Impact Report (histórico)
Version change: 1.0.0 → 2.0.0 (MAJOR — cambio de arquitectura incompatible)
Modified principles:
  - III. Server-First Data Fetching → III. Capa de Servicios para Fetching
    (ya no aplica Server Components/Next.js; se redefine para SPA React+Vite
    consumiendo API REST de Express)
Added sections: ninguna (reestructuración del Stack Tecnológico existente)
Removed sections:
  - Referencias a Next.js App Router, `/app`, `/app/api/` (incompatibles con
    la nueva arquitectura de dos proyectos separados)
Templates requiring updates:
  ✅ .specify/templates/plan-template.md (gate genérico, sin referencias duras a Next.js)
  ✅ .specify/templates/spec-template.md (sin referencias a stack)
  ✅ .specify/templates/tasks-template.md (sin referencias a stack)
  ⚠ specs/005-registrar-resultados-bracket/plan.md — requiere reescritura manual
    (ya en curso, fuera de este comando) para reflejar /client + /server
Follow-up TODOs: ninguno
-->

# SDD Práctica Constitution

## Core Principles

### I. Seguridad de Tipos (NON-NEGOTIABLE)
Nunca usar `any` en TypeScript. Toda función MUST declarar su tipo de retorno
explícito. Rationale: el tipado explícito previene errores silenciosos de
contrato entre capas (API, lib, componentes) y hace el código auto-documentado
sin depender de inferencia implícita que se rompe al refactorizar.

### II. Spec-First Development
Toda feature MUST tener su spec (`spec.md`) antes de codear. No se escribe
código de feature sin que exista la especificación correspondiente aprobada.
Rationale: evita retrabajo y deriva de alcance; la spec es la fuente de verdad
para validar que la implementación cumple el requisito original.

### III. Capa de Servicios para Fetching
Toda llamada a la API MUST pasar por funciones dedicadas en
`/client/src/services` (wrappers de `fetch`); MUST NOT haber `fetch` embebido
directamente en el JSX de un componente. Componentes consumen esas funciones
vía hooks o llamadas explícitas en manejadores de eventos / `useEffect`
acotado a sincronización, nunca lógica de parseo o manejo de errores de red
inline. Rationale: centraliza el manejo de errores y el formato de las
respuestas de la API, evita duplicar lógica de fetch en cada componente y
mantiene los componentes testeables de forma aislada.

### IV. Separación de Responsabilidades
No mezclar lógica de negocio en los componentes de UI. Componentes en
`/client/src/components` MUST ser puros (sin lógica de negocio); lógica de
negocio del backend vive en `/server/src/services`, no en controladores ni
rutas de Express. No hardcodear strings de colores: MUST usar clases de
Tailwind. Rationale: mantiene componentes testeables/reusables y centraliza
reglas de negocio en un solo lugar por capa.

### V. Dependencias y Convenciones Aprobadas
No instalar librerías sin aprobación previa. Convenciones de nombrado
obligatorias: componentes en PascalCase (`TaskCard.tsx`), funciones/variables
en camelCase (`getUserById`), archivos de utilidad en kebab-case
(`auth-helpers.ts`), rutas de API siempre bajo `/server/src/routes/`,
expuestas con prefijo `/api/`. Rationale: controla superficie de dependencias
(seguridad, bundle size) y mantiene consistencia predecible en todo el código
base.

### VI. Identidad Visual Gaming
Toda interfaz (pública y admin) MUST usar la paleta y tipografía de marca:
fondo principal `#0a0a0a`, color primario de acción/acento `#00ff87` (verde
neón), y Rajdhani como tipografía principal del texto. Las tarjetas y
contenedores de contenido (formularios, listados, bracket, tarjetas de
resultado) MUST tener fondo oscuro diferenciado del fondo general (`#111111`
o `#1a1a1a`), con bordes sutiles (`#2a2a2a`) que las delimiten. Los estados
semánticos ya existentes en la interfaz (error, éxito/confirmación,
deshabilitado) MUST seguir siendo distinguibles entre sí y respecto al color
primario de marca dentro de esta paleta oscura; el contraste texto/fondo
MUST mantenerse legible en todas las pantallas — la estética MUST NOT
sacrificar la legibilidad. El detalle completo del sistema de diseño
(tonos secundarios/terciarios, tipografía de respaldo, estilos de botones,
inputs, tablas, efectos hover/transición, y patrones de diseño prohibidos)
vive en `/constitution.md` (raíz del repo, sección "Diseño — Estética
Gaming"), que esta feature trata como la fuente de verdad para valores
exactos no cubiertos aquí. Rationale: fija los valores no-negociables de la
identidad visual a nivel de gate, sin duplicar el detalle de implementación
ya documentado, para que cada feature nueva mantenga consistencia de marca
y no reintroduzca un estilo o un problema de contraste ya resuelto.

## Stack Tecnológico

- Frontend: React + Vite, en `/client`
- Backend: Node.js + Express, en `/server`
- TypeScript en ambos proyectos
- Tailwind CSS (frontend)
- react-router-dom (frontend) — routing de la SPA (aprobado 2026-06-20)
- PostgreSQL + Prisma (backend)
- JWT manual con bcrypt (backend)

Estructura de carpetas obligatoria:
- `/client/src/components` → componentes de UI puros (sin lógica)
- `/client/src/pages` → vistas/rutas del frontend
- `/client/src/services` → wrappers de `fetch` hacia la API
- `/server/src/routes` → definición de rutas Express (prefijo `/api/`)
- `/server/src/controllers` → manejo de request/response, sin lógica de negocio
- `/server/src/services` → lógica de negocio del backend
- `/server/prisma` → schema y migraciones
- `/shared/types` → interfaces y tipos TypeScript compartidos entre frontend y backend

## Flujo de Trabajo y Calidad

- Código, variables y comentarios MUST estar en español.
- Commits MUST estar en español y ser descriptivos.
- Toda feature sigue el flujo Spec Kit: spec → plan → tasks → implement antes
  de mergear.

## Governance

Esta constitución prevalece sobre cualquier otra práctica o preferencia
individual. Las enmiendas requieren: (1) propuesta escrita del cambio y su
motivo, (2) actualización de versión según semver (MAJOR: cambios incompatibles
o eliminación de principios; MINOR: nuevo principio o expansión material;
PATCH: aclaraciones de redacción), (3) propagación a plantillas dependientes
(`plan-template.md`, `spec-template.md`, `tasks-template.md`) si aplica.

Toda PR o revisión de código MUST verificar cumplimiento de los principios
anteriores. Cualquier complejidad o desviación (ej. instalar librería no
aprobada) MUST justificarse explícitamente en el plan antes de avanzar.

**Version**: 2.2.0 | **Ratified**: 2026-06-20 | **Last Amended**: 2026-06-21
