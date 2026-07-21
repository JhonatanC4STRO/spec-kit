import { Juego } from "@prisma/client";

/** Techo de inscritos por juego (potencia de 2 para evitar byes). */
export const CUPO_MAXIMO_POR_JUEGO = 32;

export interface ConfigJuego {
  jugadoresPorGrupo: number;
  clasificadosPorGrupo: number;
}

/** Configuración de la fase de grupos por juego. */
export function obtenerConfig(juego: Juego): ConfigJuego {
  if (juego === "FC25") {
    return { jugadoresPorGrupo: 4, clasificadosPorGrupo: 2 };
  }
  return { jugadoresPorGrupo: 3, clasificadosPorGrupo: 1 };
}

export function esPotenciaDeDos(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

/**
 * Cantidades de inscritos válidas para armar el torneo de un juego: grupos
 * completos (múltiplo de jugadoresPorGrupo) y un número de clasificados que
 * sea potencia de 2, de modo que el bracket eliminatorio no tenga byes.
 * FC25 → [4, 8, 16, 32]; COD_BO2 → [6, 12, 24].
 */
export function cantidadesValidas(juego: Juego): number[] {
  const { jugadoresPorGrupo, clasificadosPorGrupo } = obtenerConfig(juego);
  const validas: number[] = [];
  for (let grupos = 1; grupos * jugadoresPorGrupo <= CUPO_MAXIMO_POR_JUEGO; grupos++) {
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
