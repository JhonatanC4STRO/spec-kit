# Research: Registro de Resultados y Avance de Bracket

## 1. Framework de testing

**Decision**: Vitest para unit e integration tests; sin runner adicional para
contract tests (se cubren con Vitest + llamadas directas al Route Handler).

**Rationale**: Vitest tiene soporte nativo para TypeScript y ESM sin
configuración extra, integra bien con Next.js App Router y es el estándar de
facto en proyectos Next.js 15 nuevos. Evita el overhead de configuración de
Jest con módulos ESM/App Router.

**Alternatives considered**:
- Jest: requiere configuración adicional (ts-jest / babel) para App Router y
  ESM; más lento en watch mode.
- Cypress component testing: orientado a UI, no aporta valor para testear
  lógica pura de avance de bracket en `/lib`.

## 2. Modelado de avance de bracket (single y double elimination)

**Decision**: Cada `Partido` generado en 004 almacena punteros precalculados
`nextMatchId` (a dónde avanza el ganador) y `nextLoserMatchId` (a dónde cae el
perdedor, solo en double-elimination). Al registrar un resultado, el sistema
solo escribe el `winnerId` en el partido actual y coloca al ganador/perdedor en
los slots correspondientes de los partidos apuntados — sin recalcular la
estructura del bracket.

**Rationale**: Es el patrón estándar usado por generadores de brackets
(ej. challonge): la topología se fija una sola vez al generar el bracket
(consistente con FR-007 de 004, "no se puede modificar la estructura"), y
avanzar un resultado es una escritura O(1) en lugar de recorrer el árbol.
Evita bugs de recomputar el bracket completo en cada resultado.

**Alternatives considered**:
- Recalcular el árbol de emparejamientos en cada avance: más complejo, mayor
  riesgo de inconsistencia, sin beneficio dado que la estructura es inmutable.
- Modelar el bracket como grafo genérico sin punteros directos: requiere
  lógica de traversal adicional en cada lectura sin ganancia real para este
  alcance.

## 3. Representación de empate resuelto a penales

**Decision**: Campos nullable `penaltyScoreA` / `penaltyScoreB` en `Partido`,
poblados únicamente cuando `scoreA === scoreB`. El campo `winnerId` siempre es
explícito (lo decide el admin), nunca derivado automáticamente por el sistema
a partir de los puntajes.

**Rationale**: Cumple FR-002 (empate se resuelve a penales) manteniendo la
decisión de quién gana siempre auditable y explícita, sin lógica implícita de
"mayor puntaje gana" que podría chocar con el resultado real de penales.

**Alternatives considered**:
- Entidad separada `TandaPenales`: sobre-ingeniería para un dato de un solo
  resultado por partido.
- Derivar el ganador automáticamente comparando `scoreA`/`scoreB` y solo pedir
  penales si son iguales, sin campo `winnerId` explícito: más frágil ante
  casos borde (ej. doble carga accidental).

## 4. Ventana de edición de un resultado (FR-007)

**Decision**: Antes de aceptar una corrección sobre un `Partido` ya resuelto,
el sistema verifica si el partido apuntado por `nextMatchId` (o
`nextLoserMatchId` para el perdedor) ya tiene `winnerId` no nulo. Si es así,
rechaza la corrección con un error de conflicto; si no, permite sobrescribir
el resultado y reasignar los slots afectados.

**Rationale**: Mapea 1:1 con la regla de negocio del spec ("editable solo si
el ganador todavía no jugó su partido siguiente"), sin necesitar versionado ni
recomputo en cascada.

**Alternatives considered**:
- Recomputo en cascada de todos los partidos posteriores: permite edición sin
  ventana pero con complejidad y riesgo de inconsistencia muy por encima del
  alcance pedido (descartado explícitamente por el usuario al elegir la
  Opción B sobre la C en la clarificación).
- Inmutabilidad total de resultados: más simple pero el usuario pidió
  explícitamente permitir corrección bajo la ventana descrita.
