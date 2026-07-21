import { randomInt, randomUUID } from "crypto";
import { PrismaClient, Juego, Prisma } from "@prisma/client";
import type { FaseGruposConGrupos, ResultadoPartidoGrupoInput } from "@shared/types/grupos";

const prisma = new PrismaClient();

// ─── Configuración del torneo ─────────────────────────────────────────────────
function obtenerConfig(juego: Juego): { jugadoresPorGrupo: number; clasificadosPorGrupo: number } {
  if (juego === "FC25") {
    return { jugadoresPorGrupo: 4, clasificadosPorGrupo: 2 };
  } else {
    return { jugadoresPorGrupo: 3, clasificadosPorGrupo: 1 };
  }
}

// ─── Errores propios ──────────────────────────────────────────────────────────
export class FaseGruposYaExisteError extends Error {}
export class FaseGruposNoEncontradaError extends Error {}
export class PartidoGrupoNoEncontradoError extends Error {}
export class FaseGruposNoFinalizadaError extends Error {}
export class FaseGruposYaFinalizadaError extends Error {}
export class JugadoresInsuficientesGruposError extends Error {}
export class PartidoGrupoYaResueltoError extends Error {}

// ─── Utilidades ───────────────────────────────────────────────────────────────

function shuffle<T>(arr: readonly T[]): T[] {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

const BYE = "__BYE__";

/**
 * Genera los enfrentamientos round-robin (todos vs todos) agrupados por ronda
 * usando el método circular: con N participantes (par) hay N-1 rondas de N/2
 * partidos cada una; si N es impar se agrega un "bye" y esa ronda queda con
 * un partido menos.
 */
function generarEnfrentamientos(ids: string[]): Array<{ ronda: number; a: string; b: string }> {
  const lista = ids.length % 2 === 0 ? [...ids] : [...ids, BYE];
  const n = lista.length;
  const rondas = n - 1;
  const mitad = n / 2;
  const resultado: Array<{ ronda: number; a: string; b: string }> = [];

  let circulo = [...lista];
  for (let r = 0; r < rondas; r++) {
    for (let i = 0; i < mitad; i++) {
      const a = circulo[i];
      const b = circulo[n - 1 - i];
      if (a !== BYE && b !== BYE) {
        resultado.push({ ronda: r + 1, a, b });
      }
    }
    const fijo = circulo[0];
    const resto = circulo.slice(1);
    resto.unshift(resto.pop() as string);
    circulo = [fijo, ...resto];
  }
  return resultado;
}

/** Letra de grupo: 0→A, 1→B, … */
function letraGrupo(i: number): string {
  return String.fromCharCode(65 + i);
}

// ─── Queries helpers ──────────────────────────────────────────────────────────

const FASE_INCLUDE = {
  grupos: {
    include: {
      participantes: true,
      partidos: { orderBy: [{ ronda: "asc" }, { createdAt: "asc" }] },
    },
  },
} satisfies Prisma.FaseGruposInclude;

type FaseCompleta = Prisma.FaseGruposGetPayload<{ include: typeof FASE_INCLUDE }>;

async function obtenerFaseOLanzar(juego: Juego): Promise<FaseCompleta> {
  const fase = await prisma.faseGrupos.findUnique({
    where: { juego },
    include: FASE_INCLUDE,
  });
  if (!fase) throw new FaseGruposNoEncontradaError("No existe fase de grupos para este juego");
  return fase;
}

/** Dado el ID de un PartidoGrupo, devuelve el Juego de la fase a la que pertenece. */
export async function getJuegoDePartidoGrupo(partidoId: string): Promise<string | null> {
  const partido = await prisma.partidoGrupo.findUnique({
    where: { id: partidoId },
    include: { grupo: { include: { fase: true } } },
  });
  return partido?.grupo.fase.juego ?? null;
}

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Genera la fase de grupos para el juego indicado.
 * Divide aleatoriamente todos los inscritos en grupos de JUGADORES_POR_GRUPO.
 * Crea todos los partidos round-robin dentro de cada grupo.
 */
export async function generarFaseGrupos(
  juego: string,
): Promise<{ id: string }> {
  const juegoEnum = juego as Juego;

  const existente = await prisma.faseGrupos.findUnique({ where: { juego: juegoEnum } });
  if (existente) throw new FaseGruposYaExisteError("Ya existe una fase de grupos para este juego");

  const inscritos = await prisma.inscripcion.findMany({ where: { juego: juegoEnum } });
  const config = obtenerConfig(juegoEnum);
  if (inscritos.length < config.jugadoresPorGrupo) {
    throw new JugadoresInsuficientesGruposError(
      `Se necesitan al menos ${config.jugadoresPorGrupo} inscritos para generar los grupos`,
    );
  }

  const mezclados = shuffle(inscritos.map((i) => i.id));

  // Dividir en grupos de jugadoresPorGrupo
  const gruposBloques: string[][] = [];
  for (let i = 0; i < mezclados.length; i += config.jugadoresPorGrupo) {
    gruposBloques.push(mezclados.slice(i, i + config.jugadoresPorGrupo));
  }

  const fase = await prisma.$transaction(async (tx) => {
    const nuevaFase = await tx.faseGrupos.create({ data: { juego: juegoEnum } });

    for (let gi = 0; gi < gruposBloques.length; gi++) {
      const bloque = gruposBloques[gi];
      const grupo = await tx.grupo.create({
        data: {
          faseId: nuevaFase.id,
          nombre: `Grupo ${letraGrupo(gi)}`,
        },
      });

      // Participantes
      await tx.grupoParticipante.createMany({
        data: bloque.map((inscripcionId) => ({
          id: randomUUID(),
          grupoId: grupo.id,
          inscripcionId,
        })),
      });

      // Partidos round-robin
      const enfrentamientos = generarEnfrentamientos(bloque);
      await tx.partidoGrupo.createMany({
        data: enfrentamientos.map((e) => ({
          id: randomUUID(),
          grupoId: grupo.id,
          ronda: e.ronda,
          jugadorAId: e.a,
          jugadorBId: e.b,
        })),
      });
    }

    return nuevaFase;
  }, { timeout: 20_000, maxWait: 10_000 });

  return { id: fase.id };
}

/**
 * Devuelve la fase de grupos completa con tabla de posiciones
 * (participantes ordenados por puntos > dif. de goles > goles a favor).
 * Enriquece los participantes con nombreCompleto.
 */
export async function getFaseGrupos(juego: string): Promise<FaseGruposConGrupos> {
  const juegoEnum = juego as Juego;
  const fase = await obtenerFaseOLanzar(juegoEnum);

  // Mapear nombres de jugadores
  const inscripcionIds = fase.grupos.flatMap((g) =>
    g.participantes.map((p) => p.inscripcionId),
  );
  const inscripciones = await prisma.inscripcion.findMany({
    where: { id: { in: inscripcionIds } },
    select: {
      id: true,
      nombreCompleto: true,
      jugador1Nombre: true,
      jugador2Nombre: true,
      nickEquipo: true,
    },
  });
  const inscripcionPorId = new Map(inscripciones.map((i) => [i.id, i]));

  return {
    id: fase.id,
    juego: fase.juego,
    estado: fase.estado,
    createdAt: fase.createdAt.toISOString(),
    grupos: fase.grupos.map((g) => {
      const statsPorId = calcularStatsGrupo(
        g.participantes.map((p) => p.inscripcionId),
        g.partidos,
      );
      return {
      id: g.id,
      faseId: g.faseId,
      nombre: g.nombre,
      participantes: g.participantes
        .map((p) => {
          const ins = inscripcionPorId.get(p.inscripcionId);
          return {
            ...p,
            ...statsDe(statsPorId, p.inscripcionId),
            nombreCompleto: ins?.nombreCompleto ?? p.inscripcionId,
            jugador1Nombre: ins?.jugador1Nombre ?? null,
            jugador2Nombre: ins?.jugador2Nombre ?? null,
            nickEquipo: ins?.nickEquipo ?? null,
          };
        })
        .sort(ordenarParticipantes),
      partidos: g.partidos.map((p) => ({
        id: p.id,
        grupoId: p.grupoId,
        ronda: p.ronda,
        jugadorAId: p.jugadorAId,
        jugadorBId: p.jugadorBId,
        scoreA: p.scoreA,
        scoreB: p.scoreB,
        winnerId: p.winnerId,
        resolvedAt: p.resolvedAt?.toISOString() ?? null,
      })),
      };
    }),
  };
}

function ordenarParticipantes(
  a: { puntos: number; gf: number; gc: number },
  b: { puntos: number; gf: number; gc: number },
): number {
  if (b.puntos !== a.puntos) return b.puntos - a.puntos;
  const difA = a.gf - a.gc;
  const difB = b.gf - b.gc;
  if (difB !== difA) return difB - difA;
  return b.gf - a.gf;
}

// ─── Tabla de posiciones derivada ─────────────────────────────────────────────
// Las stats no se almacenan: se calculan siempre desde los partidos resueltos
// del grupo, así nunca pueden descuadrarse con los resultados.

interface StatsGrupo {
  puntos: number;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
}

interface PartidoGrupoResuelto {
  jugadorAId: string;
  jugadorBId: string;
  scoreA: number | null;
  scoreB: number | null;
  resolvedAt: Date | null;
}

function statsIniciales(): StatsGrupo {
  return { puntos: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 };
}

function acumularResultado(stats: StatsGrupo, favor: number, contra: number): void {
  stats.pj += 1;
  stats.gf += favor;
  stats.gc += contra;
  if (favor > contra) {
    stats.pg += 1;
    stats.puntos += 3;
  } else if (favor === contra) {
    stats.pe += 1;
    stats.puntos += 1;
  } else {
    stats.pp += 1;
  }
}

/** Calcula la tabla de posiciones de un grupo: inscripcionId → stats. */
function calcularStatsGrupo(
  inscripcionIds: readonly string[],
  partidos: readonly PartidoGrupoResuelto[],
): Map<string, StatsGrupo> {
  const stats = new Map<string, StatsGrupo>();
  for (const id of inscripcionIds) {
    stats.set(id, statsIniciales());
  }
  for (const p of partidos) {
    if (p.resolvedAt === null || p.scoreA === null || p.scoreB === null) continue;
    const statsA = stats.get(p.jugadorAId);
    const statsB = stats.get(p.jugadorBId);
    if (statsA) acumularResultado(statsA, p.scoreA, p.scoreB);
    if (statsB) acumularResultado(statsB, p.scoreB, p.scoreA);
  }
  return stats;
}

function statsDe(statsPorId: Map<string, StatsGrupo>, inscripcionId: string): StatsGrupo {
  return statsPorId.get(inscripcionId) ?? statsIniciales();
}

/**
 * Registra el resultado de un partido de grupo.
 * Se puede sobreescribir un resultado anterior: la tabla de posiciones se
 * deriva de los partidos al leer, así que no hay stats que mantener.
 */
export async function registrarResultadoPartidoGrupo(
  partidoId: string,
  input: ResultadoPartidoGrupoInput,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const partido = await tx.partidoGrupo.findUnique({ where: { id: partidoId } });
    if (!partido) throw new PartidoGrupoNoEncontradoError("Partido de grupo no encontrado");

    const fase = await tx.faseGrupos.findFirst({
      where: { grupos: { some: { id: partido.grupoId } } },
    });
    if (!fase) throw new FaseGruposNoEncontradaError("No existe fase de grupos para este partido");
    if (fase.estado === "FINALIZADA") {
      throw new FaseGruposYaFinalizadaError("La fase de grupos ya está finalizada");
    }

    const { scoreA, scoreB } = input;
    const empate = scoreA === scoreB;
    const winnerId = empate ? null : scoreA > scoreB ? partido.jugadorAId : partido.jugadorBId;

    await tx.partidoGrupo.update({
      where: { id: partidoId },
      data: { scoreA, scoreB, winnerId, resolvedAt: new Date() },
    });

    // (pasa a FINALIZADA solo cuando el admin cierra la fase explícitamente)
    await tx.faseGrupos.update({
      where: { id: fase.id },
      data: { estado: "EN_CURSO" },
    });
  }, { timeout: 20_000, maxWait: 10_000 });
}

/**
 * Cierra la fase de grupos:
 * - Marca los CLASIFICADOS_POR_GRUPO mejores de cada grupo como clasificado=true
 * - Cambia el estado a FINALIZADA
 * Devuelve los IDs de inscripción de los clasificados (para generar el bracket).
 */
export async function cerrarFaseGrupos(juego: string): Promise<string[]> {
  const juegoEnum = juego as Juego;
  const fase = await obtenerFaseOLanzar(juegoEnum);
  if (fase.estado === "FINALIZADA") {
    throw new FaseGruposYaFinalizadaError("La fase de grupos ya está finalizada");
  }

  const clasificadosIds: string[] = [];

  await prisma.$transaction(async (tx) => {
    for (const grupo of fase.grupos) {
      const statsPorId = calcularStatsGrupo(
        grupo.participantes.map((p) => p.inscripcionId),
        grupo.partidos,
      );
      const ordenados = [...grupo.participantes].sort((a, b) =>
        ordenarParticipantes(
          statsDe(statsPorId, a.inscripcionId),
          statsDe(statsPorId, b.inscripcionId),
        ),
      );
      const config = obtenerConfig(juegoEnum);
      const top = ordenados.slice(0, config.clasificadosPorGrupo);

      for (const p of top) {
        await tx.grupoParticipante.update({
          where: { id: p.id },
          data: { clasificado: true },
        });
        clasificadosIds.push(p.inscripcionId);
      }
    }

    await tx.faseGrupos.update({
      where: { id: fase.id },
      data: { estado: "FINALIZADA" },
    });
  }, { timeout: 20_000, maxWait: 10_000 });

  return clasificadosIds;
}

/**
 * Reinicia la fase de grupos (borra todo: grupos, participantes, partidos).
 */
export async function reiniciarFaseGrupos(juego: string): Promise<void> {
  const juegoEnum = juego as Juego;
  const fase = await prisma.faseGrupos.findUnique({ where: { juego: juegoEnum } });
  if (!fase) throw new FaseGruposNoEncontradaError("No existe fase de grupos para este juego");

  await prisma.$transaction(async (tx) => {
    // Borrar en orden para respetar FKs
    const grupos = await tx.grupo.findMany({ where: { faseId: fase.id } });
    const grupoIds = grupos.map((g) => g.id);
    await tx.partidoGrupo.deleteMany({ where: { grupoId: { in: grupoIds } } });
    await tx.grupoParticipante.deleteMany({ where: { grupoId: { in: grupoIds } } });
    await tx.grupo.deleteMany({ where: { faseId: fase.id } });
    await tx.faseGrupos.delete({ where: { id: fase.id } });
  }, { timeout: 20_000, maxWait: 10_000 });
}
