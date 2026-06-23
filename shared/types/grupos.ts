import type { Juego } from "./inscripcion";

export type EstadoFaseGrupos = "PENDIENTE" | "EN_CURSO" | "FINALIZADA";

export interface FaseGrupos {
  id: string;
  juego: Juego;
  estado: EstadoFaseGrupos;
  createdAt: string;
}

export interface GrupoParticipante {
  id: string;
  grupoId: string;
  inscripcionId: string;
  puntos: number;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  clasificado: boolean;
  /** Nombre del jugador (enriquecido en el servidor al devolver) */
  nombreCompleto?: string;
  // COD BO2 team details
  jugador1Nombre?: string | null;
  jugador2Nombre?: string | null;
  nickEquipo?: string | null;
}

export interface PartidoGrupo {
  id: string;
  grupoId: string;
  ronda: number | null;
  jugadorAId: string;
  jugadorBId: string;
  scoreA: number | null;
  scoreB: number | null;
  winnerId: string | null;
  resolvedAt: string | null;
}

export interface Grupo {
  id: string;
  faseId: string;
  nombre: string;
  participantes: GrupoParticipante[];
  partidos: PartidoGrupo[];
}

export interface FaseGruposConGrupos extends FaseGrupos {
  grupos: Grupo[];
}

export interface ResultadoPartidoGrupoInput {
  scoreA: number;
  scoreB: number;
}
