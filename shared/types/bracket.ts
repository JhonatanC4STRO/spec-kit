import type { Juego } from "./inscripcion";

/**
 * Bracket y Partido: esquema canónico de 004-generar-bracket-torneo,
 * consumido también por 005-registrar-resultados-bracket.
 */
export type FormatoBracket = "SINGLE_ELIMINATION" | "DOUBLE_ELIMINATION";
export type LadoBracket = "WINNERS" | "LOSERS";

export interface Bracket {
  id: string;
  juego: Juego;
  formato: FormatoBracket;
  createdAt: string;
}

export interface Partido {
  id: string;
  bracketId: string;
  ronda: number;
  lado: LadoBracket | null;
  jugadorAId: string | null;
  jugadorBId: string | null;
  scoreA: number | null;
  scoreB: number | null;
  penaltyScoreA: number | null;
  penaltyScoreB: number | null;
  winnerId: string | null;
  nextMatchId: string | null;
  nextLoserMatchId: string | null;
  resolvedAt: string | null;
}

export interface BracketConPartidos extends Bracket {
  partidos: Partido[];
  campeonId: string | null;
}

export interface ResultadoPartidoInput {
  scoreA: number;
  scoreB: number;
  penaltyScoreA?: number | null;
  penaltyScoreB?: number | null;
  winnerId: string;
}

export interface AvancePartido {
  partido: Partido;
  campeonId: string | null;
}
