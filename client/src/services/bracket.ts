import { httpPost, httpDelete } from "./http";
import type { Bracket } from "@shared/types/bracket";
import type { Juego } from "@shared/types/inscripcion";

export function generarBracket(juego: Juego, token: string): Promise<Bracket> {
  return httpPost<Bracket>(`/admin/brackets/${juego}/generar`, undefined, token);
}

export function reiniciarBracket(juego: Juego, token: string): Promise<void> {
  return httpDelete<void>(`/admin/brackets/${juego}`, token);
}
