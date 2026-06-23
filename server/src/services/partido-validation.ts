export class ResultadoInvalidoError extends Error {}

export interface ResultadoPartidoInput {
  scoreA: number;
  scoreB: number;
  penaltyScoreA?: number | null;
  penaltyScoreB?: number | null;
  winnerId: string;
}

export function validarResultado(
  resultado: ResultadoPartidoInput,
  jugadorAId: string,
  jugadorBId: string,
): void {
  if (typeof resultado.scoreA !== "number" || typeof resultado.scoreB !== "number") {
    throw new ResultadoInvalidoError("scoreA y scoreB son requeridos");
  }
  if (resultado.scoreA < 0 || resultado.scoreB < 0) {
    throw new ResultadoInvalidoError("scoreA y scoreB deben ser >= 0");
  }

  if (resultado.scoreA === resultado.scoreB) {
    const { penaltyScoreA, penaltyScoreB } = resultado;
    if (
      penaltyScoreA === undefined ||
      penaltyScoreA === null ||
      penaltyScoreB === undefined ||
      penaltyScoreB === null
    ) {
      throw new ResultadoInvalidoError(
        "Hubo empate: penaltyScoreA y penaltyScoreB son requeridos",
      );
    }
    if (penaltyScoreA === penaltyScoreB) {
      throw new ResultadoInvalidoError("penaltyScoreA y penaltyScoreB deben ser distintos");
    }
  }

  if (resultado.winnerId !== jugadorAId && resultado.winnerId !== jugadorBId) {
    throw new ResultadoInvalidoError("winnerId debe coincidir con jugadorAId o jugadorBId");
  }
}
