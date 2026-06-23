# Data Model: Panel Admin de Jugadores Inscritos

Sin entidades nuevas. Esta feature opera sobre las entidades ya definidas en
[001-inscripcion-torneo/data-model.md](../001-inscripcion-torneo/data-model.md):

- **Inscripcion**: leída (agrupada por `juego`) y eliminada por esta feature.
  Eliminar una fila libera automáticamente su `(juego, nicknameNormalizado)`
  bajo el constraint único ya existente — no requiere lógica adicional.
- **EstadoInscripciones**: leída/escrita vía el contrato ya definido en 001
  (ver research.md, sección 3); esta feature no la modifica.

## Operación: listar agrupado por juego

No es una entidad, es una proyección de lectura:

```text
listarAgrupadoPorJuego(): { FC25: Inscripcion[], COD_BO2: Inscripcion[] }
```

Calculada a partir de todas las filas de `Inscripcion`, ordenadas por
`createdAt` ascendente dentro de cada grupo.

## Operación: eliminar jugador

```text
eliminar(id: string): void
```

- Si el `id` no existe, se trata como no-op exitoso (idempotente) — cubre el
  edge case de doble clic del spec ("ignora la segunda solicitud sin mostrar
  error fatal").
