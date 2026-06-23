import { useMemo, useState, JSX } from "react";
import {
  SingleEliminationBracket,
  DoubleEliminationBracket,
  createTheme,
} from "@g-loot/react-tournament-brackets";
import type { MatchType, ParticipantType, MatchComponentProps } from "@g-loot/react-tournament-brackets";
import ResultadoForm from "./ResultadoForm";
import type { BracketConPartidos, Partido } from "@shared/types/bracket";

interface BracketViewProps {
  bracket: BracketConPartidos;
  token: string;
  onActualizado: () => void;
  jugadoresPorId: Record<string, string>;
}

const torneoTheme = createTheme({
  textColor: { main: "#ffffff", highlighted: "#00ff87", dark: "#999999", disabled: "#555555" },
  matchBackground: { wonColor: "#111111", lostColor: "#0a0a0a" },
  score: {
    text: { highlightedWonColor: "#00ff87", highlightedLostColor: "#999999" },
    background: { wonColor: "#0a0a0a", lostColor: "#0a0a0a" },
  },
  border: { color: "#2a2a2a", highlightedColor: "#00ff87" },
  roundHeaders: { background: "#1a1a1a" },
  canvasBackground: "#0a0a0a",
});

const bracketOptions = {
  style: {
    width: 240,
    boxHeight: 72,
    canvasPadding: 20,
    spaceBetweenColumns: 40,
    spaceBetweenRows: 24,
    connectorColor: "#2a2a2a",
    connectorColorHighlight: "#00ff87",
    roundHeader: {
      backgroundColor: "#1a1a1a",
      fontColor: "#999999",
      fontSize: 12,
    },
  },
};

function nombreSlot(
  id: string | null,
  jugado: boolean,
  jugadoresPorId: Record<string, string>,
): string {
  if (id === null) {
    return jugado ? "BYE" : "Pendiente";
  }
  return jugadoresPorId[id] ?? id;
}

function construirParticipantes(
  partido: Partido,
  jugadoresPorId: Record<string, string>,
): [ParticipantType, ParticipantType] {
  const jugado: boolean = partido.winnerId !== null;
  return [
    {
      id: partido.jugadorAId ?? `${partido.id}-A`,
      name: nombreSlot(partido.jugadorAId, jugado, jugadoresPorId),
      isWinner: jugado && partido.winnerId === partido.jugadorAId,
      resultText: partido.scoreA !== null ? String(partido.scoreA) : null,
    },
    {
      id: partido.jugadorBId ?? `${partido.id}-B`,
      name: nombreSlot(partido.jugadorBId, jugado, jugadoresPorId),
      isWinner: jugado && partido.winnerId === partido.jugadorBId,
      resultText: partido.scoreB !== null ? String(partido.scoreB) : null,
    },
  ];
}

function aMatchType(partido: Partido, jugadoresPorId: Record<string, string>): MatchType {
  return {
    id: partido.id,
    name: partido.id,
    nextMatchId: partido.nextMatchId,
    nextLooserMatchId: partido.nextLoserMatchId ?? undefined,
    tournamentRoundText: String(partido.ronda),
    startTime: "",
    state: partido.winnerId !== null ? "DONE" : "NO_PARTY",
    participants: construirParticipantes(partido, jugadoresPorId),
  };
}

function BracketView({
  bracket,
  token,
  onActualizado,
  jugadoresPorId,
}: BracketViewProps): JSX.Element {
  const [partidoActivo, setPartidoActivo] = useState<Partido | null>(null);

  const partidosPorId = useMemo((): Map<string, Partido> => {
    const mapa = new Map<string, Partido>();
    for (const partido of bracket.partidos) {
      mapa.set(partido.id, partido);
    }
    return mapa;
  }, [bracket.partidos]);

  const upperPartidos = bracket.partidos.filter((p): boolean => p.lado !== "LOSERS");
  const lowerPartidos = bracket.partidos.filter((p): boolean => p.lado === "LOSERS");
  const esDoble: boolean = bracket.formato === "DOUBLE_ELIMINATION" && lowerPartidos.length > 0;

  function abrirPartido(matchId: string | number): void {
    const partido = partidosPorId.get(String(matchId));
    if (partido === undefined) {
      return;
    }
    const completo: boolean = partido.jugadorAId !== null && partido.jugadorBId !== null;
    if (completo && partido.winnerId === null) {
      setPartidoActivo(partido);
    }
  }

  function MatchCard({ match, topParty, bottomParty, topWon, bottomWon }: MatchComponentProps): JSX.Element {
    const partido = partidosPorId.get(String(match.id));
    const pendiente: boolean =
      partido !== undefined && partido.winnerId === null &&
      (partido.jugadorAId === null || partido.jugadorBId === null);
    const accionable: boolean =
      partido !== undefined &&
      partido.winnerId === null &&
      partido.jugadorAId !== null &&
      partido.jugadorBId !== null;

    return (
      <div
        onClick={accionable ? (): void => abrirPartido(match.id) : undefined}
        className={`flex flex-col gap-1 bg-bg-card border border-edge rounded p-2 h-full justify-center text-sm ${
          accionable ? "cursor-pointer hover:border-primary transition-colors duration-200" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={topWon ? "text-emerald-300 font-semibold" : "text-white"}>
            {topParty.name}
          </span>
          {topParty.resultText !== null && topParty.resultText !== "" && (
            <span className="text-text-secondary">{topParty.resultText}</span>
          )}
        </div>
        <div className="border-t border-edge" />
        <div className="flex items-center justify-between">
          <span className={bottomWon ? "text-emerald-300 font-semibold" : "text-white"}>
            {bottomParty.name}
          </span>
          {bottomParty.resultText !== null && bottomParty.resultText !== "" && (
            <span className="text-text-secondary">{bottomParty.resultText}</span>
          )}
        </div>
        {pendiente && (
          <span className="text-[10px] text-amber-300">Esperando ronda anterior</span>
        )}
        {accionable && (
          <span className="text-[10px] text-primary">Click para registrar resultado</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {bracket.campeonId !== null && (
        <div className="bg-bg-card border border-primary rounded p-4">
          <span className="text-xs uppercase tracking-widest text-text-secondary">
            Campeón
          </span>
          <p className="font-bold text-emerald-300 text-lg">
            {nombreSlot(bracket.campeonId, true, jugadoresPorId)}
          </p>
        </div>
      )}

      <div className="bg-bg-card border border-edge rounded overflow-auto">
        {esDoble ? (
          <DoubleEliminationBracket
            matches={{
              upper: upperPartidos.map((p): MatchType => aMatchType(p, jugadoresPorId)),
              lower: lowerPartidos.map((p): MatchType => aMatchType(p, jugadoresPorId)),
            }}
            matchComponent={MatchCard}
            theme={torneoTheme}
            options={bracketOptions}
          />
        ) : (
          <SingleEliminationBracket
            matches={upperPartidos.map((p): MatchType => aMatchType(p, jugadoresPorId))}
            matchComponent={MatchCard}
            theme={torneoTheme}
            options={bracketOptions}
          />
        )}
      </div>

      {partidoActivo !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-bg-card border border-edge text-white rounded p-6 flex flex-col gap-4 max-w-sm w-full">
            <div className="flex items-center justify-between">
              <h2 className="font-bold uppercase tracking-wide text-sm text-white">
                Registrar resultado
              </h2>
              <button
                type="button"
                onClick={(): void => setPartidoActivo(null)}
                className="text-text-secondary hover:text-white transition-colors duration-200"
              >
                ✕
              </button>
            </div>
            <ResultadoForm
              partido={partidoActivo}
              token={token}
              onRegistrado={(): void => {
                setPartidoActivo(null);
                onActualizado();
              }}
              nombreA={nombreSlot(partidoActivo.jugadorAId, false, jugadoresPorId)}
              nombreB={nombreSlot(partidoActivo.jugadorBId, false, jugadoresPorId)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default BracketView;
