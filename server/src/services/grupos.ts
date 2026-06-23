import { randomInt, randomUUID } from "crypto";
import { PrismaClient, Juego, EstadoFaseGrupos } from "@prisma/client";
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

/** Genera los enfrentamientos round-robin para un grupo (todos vs todos). */
function generarEnfrentamientos(ids: string[]): Array<{ a: string; b: string }> {
  const pares: Array<{ a: string; b: string }> = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      pares.push({ a: ids[i], b: ids[j] });
    }
  }
  return pares;
}

/** Letra de grupo: 0→A, 1→B, … */
function letraGrupo(i: number): string {
  return String.fromCharCode(65 + i);
}

// ─── Queries helpers ──────────────────────────────────────────────────────────

async function obtenerFaseOLanzar(juego: Juego) {
  const fase = await prisma.faseGrupos.findUnique({
    where: { juego },
    include: {
      grupos: {
        include: {
          participantes: true,
          partidos: { orderBy: { createdAt: "asc" } },
        },
      },
    },
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
          jugadorAId: e.a,
          jugadorBId: e.b,
        })),
      });
    }

    return nuevaFase;
  });

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
    grupos: fase.grupos.map((g) => ({
      id: g.id,
      faseId: g.faseId,
      nombre: g.nombre,
      participantes: [...g.participantes]
        .sort(ordenarParticipantes)
        .map((p) => {
          const ins = inscripcionPorId.get(p.inscripcionId);
          return {
            ...p,
            nombreCompleto: ins?.nombreCompleto ?? p.inscripcionId,
            jugador1Nombre: ins?.jugador1Nombre ?? null,
            jugador2Nombre: ins?.jugador2Nombre ?? null,
            nickEquipo: ins?.nickEquipo ?? null,
          };
        }),
      partidos: g.partidos.map((p) => ({
        id: p.id,
        grupoId: p.grupoId,
        jugadorAId: p.jugadorAId,
        jugadorBId: p.jugadorBId,
        scoreA: p.scoreA,
        scoreB: p.scoreB,
        winnerId: p.winnerId,
        resolvedAt: p.resolvedAt?.toISOString() ?? null,
      })),
    })),
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

/**
 * Registra el resultado de un partido de grupo y actualiza las estadísticas
 * de ambos participantes en la tabla de posiciones.
 * Se puede sobreescribir un resultado anterior.
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
    if (fase?.estado === "FINALIZADA") {
      throw new FaseGruposYaFinalizadaError("La fase de grupos ya está finalizada");
    }

    const { scoreA, scoreB } = input;
    const empate = scoreA === scoreB;
    const winnerId = empate ? null : scoreA > scoreB ? partido.jugadorAId : partido.jugadorBId;

    // Si ya había resultado, revertir las stats anteriores
    if (partido.resolvedAt !== null) {
      await revertirStats(tx, partido);
    }

    // Guardar nuevo resultado
    await tx.partidoGrupo.update({
      where: { id: partidoId },
      data: { scoreA, scoreB, winnerId, resolvedAt: new Date() },
    });

    // Actualizar stats jugador A
    await actualizarStats(tx, partido.grupoId, partido.jugadorAId, {
      pj: 1,
      pg: empate ? 0 : scoreA > scoreB ? 1 : 0,
      pe: empate ? 1 : 0,
      pp: empate ? 0 : scoreA < scoreB ? 1 : 0,
      puntos: empate ? 1 : scoreA > scoreB ? 3 : 0,
      gf: scoreA,
      gc: scoreB,
    });

    // Actualizar stats jugador B
    await actualizarStats(tx, partido.grupoId, partido.jugadorBId, {
      pj: 1,
      pg: empate ? 0 : scoreB > scoreA ? 1 : 0,
      pe: empate ? 1 : 0,
      pp: empate ? 0 : scoreB < scoreA ? 1 : 0,
      puntos: empate ? 1 : scoreB > scoreA ? 3 : 0,
      gf: scoreB,
      gc: scoreA,
    });

    // Actualizar estado de la fase
    const totalPartidos = await tx.partidoGrupo.count({
      where: { grupo: { faseId: fase!.id } },
    });
    const partidosResueltos = await tx.partidoGrupo.count({
      where: { grupo: { faseId: fase!.id }, resolvedAt: { not: null } },
    });
    const nuevoEstado: EstadoFaseGrupos =
      partidosResueltos === totalPartidos ? "EN_CURSO" : "EN_CURSO";
    // (se actualiza a FINALIZADA solo cuando el admin cierra la fase explícitamente)
    await tx.faseGrupos.update({
      where: { id: fase!.id },
      data: { estado: nuevoEstado },
    });
  });
}

interface StatsDelta {
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  puntos: number;
  gf: number;
  gc: number;
}

async function actualizarStats(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  grupoId: string,
  inscripcionId: string,
  delta: StatsDelta,
): Promise<void> {
  await tx.grupoParticipante.updateMany({
    where: { grupoId, inscripcionId },
    data: {
      pj: { increment: delta.pj },
      pg: { increment: delta.pg },
      pe: { increment: delta.pe },
      pp: { increment: delta.pp },
      puntos: { increment: delta.puntos },
      gf: { increment: delta.gf },
      gc: { increment: delta.gc },
    },
  });
}

async function revertirStats(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  partido: { grupoId: string; jugadorAId: string; jugadorBId: string; scoreA: number | null; scoreB: number | null; winnerId: string | null },
): Promise<void> {
  if (partido.scoreA === null || partido.scoreB === null) return;
  const { scoreA, scoreB } = partido;
  const empate = scoreA === scoreB;

  await actualizarStats(tx, partido.grupoId, partido.jugadorAId, {
    pj: -1,
    pg: empate ? 0 : scoreA > scoreB ? -1 : 0,
    pe: empate ? -1 : 0,
    pp: empate ? 0 : scoreA < scoreB ? -1 : 0,
    puntos: empate ? -1 : scoreA > scoreB ? -3 : 0,
    gf: -scoreA,
    gc: -scoreB,
  });
  await actualizarStats(tx, partido.grupoId, partido.jugadorBId, {
    pj: -1,
    pg: empate ? 0 : scoreB > scoreA ? -1 : 0,
    pe: empate ? -1 : 0,
    pp: empate ? 0 : scoreB < scoreA ? -1 : 0,
    puntos: empate ? -1 : scoreB > scoreA ? -3 : 0,
    gf: -scoreB,
    gc: -scoreA,
  });
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
      const ordenados = [...grupo.participantes].sort(ordenarParticipantes);
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
  });

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
  });
}
