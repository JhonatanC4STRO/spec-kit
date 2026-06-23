import { httpPost } from "./http";
import type { Bracket } from "@shared/types/bracket";
import type { Juego } from "@shared/types/inscripcion";

export function generarBracket(juego: Juego, token: string): Promise<Bracket> {
  return httpPost<Bracket>(`/admin/brackets/${juego}/generar`, undefined, token);
}
