import type { Juego } from "@shared/types/inscripcion";

// Debe reflejar la misma regla del backend (server/src/services/torneo-config.ts).
const CUPO_MAXIMO = 32;

function config(juego: Juego): { jugadoresPorGrupo: number; clasificadosPorGrupo: number } {
  return juego === "FC25"
    ? { jugadoresPorGrupo: 4, clasificadosPorGrupo: 2 }
    : { jugadoresPorGrupo: 3, clasificadosPorGrupo: 1 };
}

function esPotenciaDeDos(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

/** FC25 → [4, 8, 16, 32]; COD_BO2 → [6, 12, 24]. */
export function cantidadesValidas(juego: Juego): number[] {
  const { jugadoresPorGrupo, clasificadosPorGrupo } = config(juego);
  const validas: number[] = [];
  for (let grupos = 1; grupos * jugadoresPorGrupo <= CUPO_MAXIMO; grupos++) {
    const clasificados = grupos * clasificadosPorGrupo;
    if (clasificados >= 2 && esPotenciaDeDos(clasificados)) {
      validas.push(grupos * jugadoresPorGrupo);
    }
  }
  return validas;
}

export function esCantidadValida(juego: Juego, n: number): boolean {
  return cantidadesValidas(juego).includes(n);
}
