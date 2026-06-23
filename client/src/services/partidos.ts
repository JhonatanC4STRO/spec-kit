import { httpGet, httpPatch } from "./http";
import type { BracketConPartidos, ResultadoPartidoInput, AvancePartido } from "@shared/types/bracket";
import type { Juego } from "@shared/types/inscripcion";

export function getBracket(juego: Juego): Promise<BracketConPartidos> {
  return httpGet<BracketConPartidos>(`/brackets/${juego}`);
}

export function registrarResultado(
  id: string,
  payload: ResultadoPartidoInput,
  token: string,
): Promise<AvancePartido> {
  return httpPatch<AvancePartido>(`/partidos/${id}/resultado`, payload, token);
}
