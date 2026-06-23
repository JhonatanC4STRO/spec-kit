import { randomInt, randomUUID } from "crypto";
import { PrismaClient, Juego, FormatoBracket, LadoBracket, Partido, Bracket, Prisma } from "@prisma/client";
import { obtenerEstadoJuego } from "./inscripciones";
import { validarResultado, ResultadoPartidoInput } from "./partido-validation";

const prisma = new PrismaClient();

export class InscripcionesAbiertasError extends Error {}
export class BracketYaExisteError extends Error {}
export class JugadoresInsuficientesError extends Error {}
export class BracketNoEncontradoError extends Error {}
export class PartidoNoEncontradoError extends Error {}
export class JugadoresIncompletosError extends Error {}
export class VentanaEdicionCerradaError extends Error {}

interface PartidoDraft {
  id: string;
  ronda: number;
  lado: LadoBracket | null;
  jugadorAId: string | null;
  jugadorBId: string | null;
  winnerId: string | null;
  nextMatchId: string | null;
  nextLoserMatchId: string | null;
  resolvedAt: Date | null;
}

function shuffle<T>(items: readonly T[]): T[] {
  const resultado: T[] = [...items];
  for (let i = resultado.length - 1; i > 0; i -= 1) {
    const j: number = randomInt(i + 1);
    [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
  }
  return resultado;
}

function siguientePotenciaDeDos(n: number): number {
  let potencia: number = 1;
  while (potencia < n) {
    potencia *= 2;
  }
  return potencia;
}

function nuevoPartido(ronda: number, lado: LadoBracket | null): PartidoDraft {
  return {
    id: randomUUID(),
    ronda,
    lado,
    jugadorAId: null,
    jugadorBId: null,
    winnerId: null,
    nextMatchId: null,
    nextLoserMatchId: null,
    resolvedAt: null,
  };
}

function asignarSlot(partido: PartidoDraft, valor: string | null, esSlotA: boolean): void {
  if (esSlotA) {
    partido.jugadorAId = valor;
  } else {
    partido.jugadorBId = valor;
  }
}

/**
 * Construye las rondas del bracket de ganadores (WB). Solo la ronda 1 puede
 * resolverse automáticamente por "bye" en tiempo de generación, porque es la
 * única ronda cuyos participantes ya se conocen; las rondas siguientes
 * dependen de resultados que registra 005 más adelante.
 */
function construirRondasGanadores(
  jugadoresIds: readonly string[],
  size: number,
  formato: FormatoBracket,
): PartidoDraft[][] {
  const ladoWB: LadoBracket | null = formato === "DOUBLE_ELIMINATION" ? "WINNERS" : null;
  const nRondas: number = Math.log2(size);
  const rondas: PartidoDraft[][] = [];

  for (let r = 1; r <= nRondas; r += 1) {
    const cantidad: number = size / 2 ** r;
    const ronda: PartidoDraft[] = [];
    for (let i = 0; i < cantidad; i += 1) {
      ronda.push(nuevoPartido(r, ladoWB));
    }
    rondas.push(ronda);
  }

  // Reparte los jugadores reales primero en el slot A de cada partido (orden
  // de partidos aleatorio) y recién después en el slot B con los que
  // sobren. Como siempre hay más jugadores reales que partidos (size/2 <
  // jugadoresIds.length por construcción de `size`), el slot A nunca queda
  // vacío: ningún partido puede terminar con sus dos slots en "bye" a la
  // vez (lo que dejaría una posición fantasma sin ganador posible).
  const ronda1: PartidoDraft[] = rondas[0];
  const pool: string[] = shuffle(jugadoresIds);
  const ordenA: number[] = shuffle(ronda1.map((_p, i): number => i));
  const ordenB: number[] = shuffle(ronda1.map((_p, i): number => i));

  for (const indice of ordenA) {
    ronda1[indice].jugadorAId = pool.shift() ?? null;
  }
  for (const indice of ordenB) {
    ronda1[indice].jugadorBId = pool.shift() ?? null;
  }

  for (let r = 0; r < rondas.length - 1; r += 1) {
    const actual: PartidoDraft[] = rondas[r];
    const siguiente: PartidoDraft[] = rondas[r + 1];
    for (let i = 0; i < actual.length; i += 1) {
      actual[i].nextMatchId = siguiente[Math.floor(i / 2)].id;
    }
  }

  for (const partido of ronda1) {
    const ambosVacios: boolean = partido.jugadorAId === null && partido.jugadorBId === null;
    const exactamenteUno: boolean =
      (partido.jugadorAId === null) !== (partido.jugadorBId === null);
    if (ambosVacios) {
      continue;
    }
    if (exactamenteUno) {
      const ganador: string = (partido.jugadorAId ?? partido.jugadorBId) as string;
      partido.winnerId = ganador;
      partido.resolvedAt = new Date();
      if (partido.nextMatchId !== null) {
        const indice: number = ronda1.indexOf(partido);
        const destino: PartidoDraft = rondas[1][Math.floor(indice / 2)];
        asignarSlot(destino, ganador, indice % 2 === 0);
      }
    }
  }

  return rondas;
}

/**
 * Construye el bracket de perdedores (LB) para double-elimination siguiendo
 * el patrón estándar: ronda LB (2i-1) consolida entre sí a los ganadores de
 * la ronda LB anterior (o a los perdedores de WB ronda 1 en i=1); ronda LB
 * (2i) mezcla ese ganador con el perdedor de WB ronda (i+1). Todas las
 * posiciones nacen vacías: a diferencia de WB ronda 1, en LB nunca se conoce
 * de antemano quién llega, por lo que no hay byes que resolver aquí.
 */
function construirRondasPerdedores(
  rondasGanadores: PartidoDraft[][],
  nRondasWB: number,
): PartidoDraft[][] {
  if (nRondasWB < 2) {
    return [];
  }

  const rondasLB: PartidoDraft[][] = [];

  for (let i = 1; i <= nRondasWB - 1; i += 1) {
    const cantidad: number = rondasGanadores[i].length;
    const consolidar: PartidoDraft[] = Array.from({ length: cantidad }, (): PartidoDraft =>
      nuevoPartido(2 * i - 1, "LOSERS"),
    );
    const mezclar: PartidoDraft[] = Array.from({ length: cantidad }, (): PartidoDraft =>
      nuevoPartido(2 * i, "LOSERS"),
    );
    rondasLB.push(consolidar, mezclar);
  }

  for (let par = 0; par < rondasLB.length; par += 2) {
    const consolidar: PartidoDraft[] = rondasLB[par];
    const mezclar: PartidoDraft[] = rondasLB[par + 1];
    for (let i = 0; i < consolidar.length; i += 1) {
      consolidar[i].nextMatchId = mezclar[i].id;
    }
  }

  for (let par = 1; par < rondasLB.length; par += 2) {
    const mezclar: PartidoDraft[] = rondasLB[par];
    const siguienteConsolidar: PartidoDraft[] | undefined = rondasLB[par + 1];
    if (siguienteConsolidar === undefined) {
      continue;
    }
    for (let i = 0; i < mezclar.length; i += 1) {
      mezclar[i].nextMatchId = siguienteConsolidar[Math.floor(i / 2)].id;
    }
  }

  const wbRonda1: PartidoDraft[] = rondasGanadores[0];
  const lbConsolidar1: PartidoDraft[] = rondasLB[0];
  for (let i = 0; i < wbRonda1.length; i += 1) {
    wbRonda1[i].nextLoserMatchId = lbConsolidar1[Math.floor(i / 2)].id;
  }

  for (let i = 1; i <= nRondasWB - 1; i += 1) {
    const wbRondaI: PartidoDraft[] = rondasGanadores[i];
    const lbMezclarI: PartidoDraft[] = rondasLB[2 * (i - 1) + 1];
    for (let j = 0; j < wbRondaI.length; j += 1) {
      wbRondaI[j].nextLoserMatchId = lbMezclarI[j].id;
    }
  }

  return rondasLB;
}

function construirGranFinal(
  rondasGanadores: PartidoDraft[][],
  rondasPerdedores: PartidoDraft[][],
  nRondasWB: number,
): PartidoDraft | null {
  if (rondasPerdedores.length === 0) {
    return null;
  }

  const wbFinal: PartidoDraft = rondasGanadores[nRondasWB - 1][0];
  const lbFinal: PartidoDraft = rondasPerdedores[rondasPerdedores.length - 1][0];
  const granFinal: PartidoDraft = nuevoPartido(nRondasWB + 1, null);

  wbFinal.nextMatchId = granFinal.id;
  lbFinal.nextMatchId = granFinal.id;

  return granFinal;
}

export async function generarBracket(
  juego: string,
  jugadoresOverride?: string[],
): Promise<{ id: string; juego: Juego }> {
  const estado = await obtenerEstadoJuego(juego as Juego);
  if (estado.abierta) {
    throw new InscripcionesAbiertasError("Las inscripciones siguen abiertas");
  }

  const bracketExistente = await prisma.bracket.findUnique({ where: { juego: juego as Juego } });
  if (bracketExistente !== null) {
    throw new BracketYaExisteError("Ya existe un bracket generado para este juego");
  }

  let jugadoresIds: string[];
  if (jugadoresOverride !== undefined && jugadoresOverride.length > 0) {
    jugadoresIds = shuffle(jugadoresOverride);
  } else {
    const inscripciones = await prisma.inscripcion.findMany({ where: { juego: juego as Juego } });
    if (inscripciones.length < 2) {
      throw new JugadoresInsuficientesError("Se requieren al menos 2 jugadores inscritos");
    }
    jugadoresIds = shuffle(inscripciones.map((i): string => i.id));
  }

  if (jugadoresIds.length < 2) {
    throw new JugadoresInsuficientesError("Se requieren al menos 2 jugadores clasificados");
  }

  const formato: FormatoBracket =
    juego === "FC25" ? "SINGLE_ELIMINATION" : "DOUBLE_ELIMINATION";
  const size: number = siguientePotenciaDeDos(jugadoresIds.length);
  const nRondasWB: number = Math.log2(size);

  const rondasGanadores: PartidoDraft[][] = construirRondasGanadores(
    jugadoresIds,
    size,
    formato,
  );
  const rondasPerdedores: PartidoDraft[][] =
    formato === "DOUBLE_ELIMINATION"
      ? construirRondasPerdedores(rondasGanadores, nRondasWB)
      : [];
  const granFinal: PartidoDraft | null = construirGranFinal(
    rondasGanadores,
    rondasPerdedores,
    nRondasWB,
  );

  const todosLosPartidos: PartidoDraft[] = [
    ...rondasGanadores.flat(),
    ...rondasPerdedores.flat(),
    ...(granFinal !== null ? [granFinal] : []),
  ];

  const bracket = await prisma.$transaction(async (tx) => {
    const creado = await tx.bracket.create({
      data: { juego: juego as Juego, formato },
    });
    await tx.partido.createMany({
      data: todosLosPartidos.map((p) => ({
        id: p.id,
        bracketId: creado.id,
        ronda: p.ronda,
        lado: p.lado,
        jugadorAId: p.jugadorAId,
        jugadorBId: p.jugadorBId,
        winnerId: p.winnerId,
        nextMatchId: p.nextMatchId,
        nextLoserMatchId: p.nextLoserMatchId,
        resolvedAt: p.resolvedAt,
      })),
    });
    return creado;
  });

  return { id: bracket.id, juego: bracket.juego };
}

/**
 * Las funciones siguientes (005-registrar-resultados-bracket) operan sobre
 * el esquema canónico `Bracket`/`Partido` creado arriba por 004: solo leen y
 * actualizan `winnerId`/slots vía los punteros `nextMatchId`/
 * `nextLoserMatchId` ya precalculados, sin recomputar la estructura.
 */

function obtenerCampeonId(partidos: readonly Partido[]): string | null {
  const final = partidos.find(
    (p): boolean => p.nextMatchId === null && p.nextLoserMatchId === null,
  );
  return final?.winnerId ?? null;
}

export async function reiniciarBracket(juego: string): Promise<void> {
  const bracket = await prisma.bracket.findUnique({ where: { juego: juego as Juego } });
  if (bracket === null) {
    throw new BracketNoEncontradoError("No existe bracket para este juego");
  }
  await prisma.$transaction(async (tx) => {
    await tx.partido.deleteMany({ where: { bracketId: bracket.id } });
    await tx.bracket.delete({ where: { id: bracket.id } });
  });
}

export async function getBracket(
  juego: string,
): Promise<Bracket & { partidos: Partido[]; campeonId: string | null }> {
  const bracket = await prisma.bracket.findUnique({
    where: { juego: juego as Juego },
    include: { partidos: { orderBy: { ronda: "asc" } } },
  });
  if (bracket === null) {
    throw new BracketNoEncontradoError("No existe bracket para este juego");
  }
  return { ...bracket, campeonId: obtenerCampeonId(bracket.partidos) };
}

async function puedeEditarResultadoTx(
  tx: Prisma.TransactionClient,
  partido: Pick<Partido, "nextMatchId" | "nextLoserMatchId">,
): Promise<boolean> {
  const candidatos: string[] = [partido.nextMatchId, partido.nextLoserMatchId].filter(
    (id): id is string => id !== null,
  );
  if (candidatos.length === 0) {
    return true;
  }
  const siguientes = await tx.partido.findMany({ where: { id: { in: candidatos } } });
  return siguientes.every((p): boolean => p.winnerId === null);
}

export async function puedeEditarResultado(
  partido: Pick<Partido, "nextMatchId" | "nextLoserMatchId">,
): Promise<boolean> {
  return puedeEditarResultadoTx(prisma, partido);
}

async function colocarEnSlot(
  tx: Prisma.TransactionClient,
  targetMatchId: string,
  valorNuevo: string,
  valorAnterior: string | null,
): Promise<void> {
  const target = await tx.partido.findUnique({ where: { id: targetMatchId } });
  if (target === null) {
    return;
  }
  if (valorAnterior !== null && target.jugadorAId === valorAnterior) {
    await tx.partido.update({ where: { id: targetMatchId }, data: { jugadorAId: valorNuevo } });
    return;
  }
  if (valorAnterior !== null && target.jugadorBId === valorAnterior) {
    await tx.partido.update({ where: { id: targetMatchId }, data: { jugadorBId: valorNuevo } });
    return;
  }
  if (target.jugadorAId === null) {
    await tx.partido.update({ where: { id: targetMatchId }, data: { jugadorAId: valorNuevo } });
    return;
  }
  if (target.jugadorBId === null) {
    await tx.partido.update({ where: { id: targetMatchId }, data: { jugadorBId: valorNuevo } });
  }
}

export async function avanzarGanador(
  partidoId: string,
  resultado: ResultadoPartidoInput,
): Promise<{ partido: Partido; campeonId: string | null }> {
  return prisma.$transaction(async (tx) => {
    const partido = await tx.partido.findUnique({ where: { id: partidoId } });
    if (partido === null) {
      throw new PartidoNoEncontradoError("No existe el partido");
    }
    if (partido.jugadorAId === null || partido.jugadorBId === null) {
      throw new JugadoresIncompletosError(
        "El partido todavía no tiene ambos jugadores asignados",
      );
    }
    if (partido.winnerId !== null) {
      const puedeEditar: boolean = await puedeEditarResultadoTx(tx, partido);
      if (!puedeEditar) {
        throw new VentanaEdicionCerradaError(
          "El partido siguiente ya tiene resultado registrado",
        );
      }
    }

    validarResultado(resultado, partido.jugadorAId, partido.jugadorBId);

    const winnerIdAnterior: string | null = partido.winnerId;
    const perdedorIdAnterior: string | null =
      winnerIdAnterior === null
        ? null
        : winnerIdAnterior === partido.jugadorAId
          ? partido.jugadorBId
          : partido.jugadorAId;

    const actualizado = await tx.partido.update({
      where: { id: partidoId },
      data: {
        scoreA: resultado.scoreA,
        scoreB: resultado.scoreB,
        penaltyScoreA: resultado.penaltyScoreA ?? null,
        penaltyScoreB: resultado.penaltyScoreB ?? null,
        winnerId: resultado.winnerId,
        resolvedAt: new Date(),
      },
    });

    const perdedorId: string =
      resultado.winnerId === partido.jugadorAId ? partido.jugadorBId : partido.jugadorAId;

    if (actualizado.nextMatchId !== null) {
      await colocarEnSlot(tx, actualizado.nextMatchId, resultado.winnerId, winnerIdAnterior);
    }
    if (actualizado.lado === "WINNERS" && actualizado.nextLoserMatchId !== null) {
      await colocarEnSlot(tx, actualizado.nextLoserMatchId, perdedorId, perdedorIdAnterior);
    }

    const campeonId: string | null =
      actualizado.nextMatchId === null && actualizado.nextLoserMatchId === null
        ? actualizado.winnerId
        : null;

    return { partido: actualizado, campeonId };
  });
}
