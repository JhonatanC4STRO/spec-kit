# Research: Generación de Bracket del Torneo

## 1. Framework de testing

**Decision**: Vitest, igual que el resto del proyecto.

**Rationale**: Consistencia con 001, 002, 003 y 005.

## 2. Aleatorización del sorteo de posiciones

**Decision**: Fisher-Yates shuffle implementado a mano usando
`crypto.randomInt` (módulo `crypto` nativo de Node) en lugar de
`Math.random()`.

**Rationale**: El sorteo de un torneo es información pública y auditable; un
generador menos uniforme o potencialmente predecible (`Math.random()` en
algunos motores) puede ser cuestionado por los participantes como
"amañado". `crypto.randomInt` no agrega dependencias nuevas (es built-in) y
da una garantía más defendible de aleatoriedad uniforme.

**Alternatives considered**:
- `Math.random()`: estadísticamente aceptable pero menos defendible ante un
  reclamo de manipulación del sorteo.
- Librería npm de shuffle (ej. `lodash.shuffle`): dependencia nueva sin
  aprobación previa, innecesaria dado que `crypto.randomInt` + Fisher-Yates
  es trivial de implementar a mano.

## 3. Construcción de la estructura con punteros precalculados

**Decision**: Al generar, se construye primero el árbol del bracket de
ganadores como árbol binario completo (slots = siguiente potencia de 2 ≥
cantidad de inscriptos, con "bye" en los slots sobrantes asignados también
aleatoriamente), enlazando cada par de partidos de la ronda N a su partido
de la ronda N+1 vía `nextMatchId`. Para `DOUBLE_ELIMINATION`, se construye en
paralelo el bracket de perdedores con el mapeo estándar (cada partido de
ganadores de la ronda N apunta a un partido específico del bracket de
perdedores) y se enlaza `nextLoserMatchId`. Todo se persiste en una sola
transacción Prisma.

**Rationale**: Mismo razonamiento que 005-registrar-resultados-bracket
(research.md, sección 2): fijar la topología una sola vez al generar permite
que el avance de resultados sea una escritura O(1) sin recomputar el árbol.
Como 004 es quien genera la estructura, es la responsable de calcular estos
punteros correctamente para que 005 los use sin reinterpretarlos.

**Alternatives considered**:
- Persistir solo los jugadores asignados y calcular la estructura del árbol
  dinámicamente en cada lectura/avance: más complejo y propenso a
  inconsistencias; ya descartado en el research de 005.

## 4. Orden de validación de precondiciones

**Decision**: Validar en este orden al recibir la solicitud de generación:
(1) `EstadoInscripciones.abierta` debe ser `false`; (2) no debe existir ya un
`Bracket` para ese juego; (3) debe haber al menos 2 inscriptos en ese juego.
La primera condición que falle determina la respuesta (409 para 1 y 2, 400
para 3).

**Rationale**: Las condiciones 1 y 2 son chequeos de estado global rápidos
que evitan trabajo innecesario (no hace falta contar inscriptos si las
inscripciones siguen abiertas o si ya hay un bracket); dejar la validación de
cantidad al final da un mensaje de error más específico cuando sí aplica.

**Alternatives considered**: validar todas las condiciones y devolver una
lista de errores — innecesario para un flujo de un solo botón con un único
motivo de rechazo relevante a la vez.
