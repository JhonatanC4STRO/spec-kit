import { JSX } from "react";
import ResultadoForm from "./ResultadoForm";
import type { BracketConPartidos, Partido } from "@shared/types/bracket";

interface BracketViewProps {
  bracket: BracketConPartidos;
  token: string;
  onActualizado: () => void;
}

function tituloLado(lado: Partido["lado"]): string {
  if (lado === "WINNERS") {
    return "Bracket de ganadores";
  }
  if (lado === "LOSERS") {
    return "Bracket de perdedores";
  }
  return "Bracket";
}

function agruparPorLadoYRonda(
  partidos: readonly Partido[],
): Map<string, Map<number, Partido[]>> {
  const grupos = new Map<string, Map<number, Partido[]>>();
  for (const partido of partidos) {
    const clave: string = partido.lado ?? "UNICO";
    if (!grupos.has(clave)) {
      grupos.set(clave, new Map());
    }
    const porRonda = grupos.get(clave) as Map<number, Partido[]>;
    if (!porRonda.has(partido.ronda)) {
      porRonda.set(partido.ronda, []);
    }
    (porRonda.get(partido.ronda) as Partido[]).push(partido);
  }
  return grupos;
}

function BracketView({ bracket, token, onActualizado }: BracketViewProps): JSX.Element {
  const grupos = agruparPorLadoYRonda(bracket.partidos);

  return (
    <div className="flex flex-col gap-6">
      {bracket.campeonId !== null && (
        <p className="font-bold text-emerald-300">Campeón: {bracket.campeonId}</p>
      )}
      {Array.from(grupos.entries()).map(([clave, porRonda]): JSX.Element => (
        <div key={clave} className="flex flex-col gap-4">
          <h2 className="font-bold">
            {tituloLado(clave === "UNICO" ? null : (clave as Partido["lado"]))}
          </h2>
          {Array.from(porRonda.entries())
            .sort(([a], [b]): number => a - b)
            .map(([ronda, partidos]): JSX.Element => (
              <div key={ronda} className="flex flex-col gap-2">
                <h3 className="font-semibold">Ronda {ronda}</h3>
                {partidos.map((partido): JSX.Element => (
                  <div
                    key={partido.id}
                    className="flex flex-col gap-1 bg-bg-card border border-edge rounded p-2"
                  >
                    <p>
                      {partido.jugadorAId ?? "BYE"} vs {partido.jugadorBId ?? "BYE"}
                      {partido.winnerId !== null && (
                        <span className="ml-2 text-emerald-300">
                          Ganador: {partido.winnerId} ({partido.scoreA}-{partido.scoreB}
                          {partido.penaltyScoreA !== null
                            ? `, penales ${partido.penaltyScoreA}-${partido.penaltyScoreB}`
                            : ""}
                          )
                        </span>
                      )}
                    </p>
                    {partido.jugadorAId !== null && partido.jugadorBId !== null && (
                      <ResultadoForm
                        partido={partido}
                        token={token}
                        onRegistrado={onActualizado}
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

export default BracketView;
