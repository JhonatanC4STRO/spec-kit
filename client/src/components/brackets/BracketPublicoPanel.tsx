import { useState, useEffect, useCallback, useRef, JSX } from "react";
import { getBracket } from "../../services/partidos";
import { getJugadoresPublico } from "../../services/inscripciones";
import { getFaseGrupos } from "../../services/grupos";
import { HttpError } from "../../services/http";
import type { BracketConPartidos, Partido } from "@shared/types/bracket";
import type { FaseGruposConGrupos } from "@shared/types/grupos";
import type { Juego } from "@shared/types/inscripcion";
import GruposPublicoView from "./GruposPublicoView";
import {
  SingleEliminationBracket,
  DoubleEliminationBracket,
  createTheme,
} from "@g-loot/react-tournament-brackets";
import type {
  MatchType,
  ParticipantType,
  MatchComponentProps,
} from "@g-loot/react-tournament-brackets";

interface BracketPublicoPanelProps {
  juego: Juego;
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
    width: 200,
    boxHeight: 66,
    canvasPadding: 16,
    spaceBetweenColumns: 32,
    spaceBetweenRows: 20,
    connectorColor: "#2a2a2a",
    connectorColorHighlight: "#00ff87",
    roundHeader: {
      backgroundColor: "#1a1a1a",
      fontColor: "#999999",
      fontSize: 11,
    },
  },
};

function nombreSlot(
  id: string | null,
  jugado: boolean,
  jugadoresPorId: Record<string, string>,
): string {
  if (id === null) return jugado ? "BYE" : "Pendiente";
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

function aMatchType(
  partido: Partido,
  jugadoresPorId: Record<string, string>,
): MatchType {
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

function ReadOnlyMatchCard({
  topParty,
  bottomParty,
  topWon,
  bottomWon,
}: MatchComponentProps): JSX.Element {
  return (
    <div className="flex flex-col gap-1 bg-bg-card border border-edge rounded p-2 h-full justify-center text-xs sm:text-sm">
      <div className="flex items-center justify-between gap-1">
        <span
          className={`truncate max-w-[120px] ${topWon ? "text-emerald-300 font-semibold" : "text-white"}`}
        >
          {topParty.name}
        </span>
        {topParty.resultText !== null && topParty.resultText !== "" && (
          <span className="text-text-secondary shrink-0 font-mono">
            {topParty.resultText}
          </span>
        )}
      </div>
      <div className="border-t border-edge" />
      <div className="flex items-center justify-between gap-1">
        <span
          className={`truncate max-w-[120px] ${bottomWon ? "text-emerald-300 font-semibold" : "text-white"}`}
        >
          {bottomParty.name}
        </span>
        {bottomParty.resultText !== null && bottomParty.resultText !== "" && (
          <span className="text-text-secondary shrink-0 font-mono">
            {bottomParty.resultText}
          </span>
        )}
      </div>
    </div>
  );
}

function BracketPublicoPanel({ juego }: BracketPublicoPanelProps): JSX.Element {
  const [bracket, setBracket] = useState<BracketConPartidos | null | undefined>(undefined);
  const [fase, setFase] = useState<FaseGruposConGrupos | null | undefined>(undefined);
  const [jugadoresPorId, setJugadoresPorId] = useState<Record<string, string>>({});
  const [showSwipeHint, setShowSwipeHint] = useState<boolean>(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const cargar = useCallback((): void => {
    getBracket(juego)
      .then((b): void => setBracket(b))
      .catch((err: unknown): void => {
        if (err instanceof HttpError && err.status === 404) setBracket(null);
      });
  }, [juego]);

  useEffect((): (() => void) => {
    cargar();
    const intervalo = setInterval(cargar, 30_000);
    return (): void => clearInterval(intervalo);
  }, [cargar]);

  // Cargar fase de grupos (FC25 y COD_BO2)
  const cargarFase = useCallback((): void => {
    if (juego !== "FC25" && juego !== "COD_BO2") return;
    getFaseGrupos(juego)
      .then((f): void => setFase(f))
      .catch((err: unknown): void => {
        if (err instanceof HttpError && err.status === 404) setFase(null);
      });
  }, [juego]);

  useEffect((): (() => void) => {
    cargarFase();
    const intervalo = setInterval(cargarFase, 30_000);
    return (): void => clearInterval(intervalo);
  }, [cargarFase]);

  useEffect((): void => {
    getJugadoresPublico()
      .then((lista): void => {
        const mapa: Record<string, string> = {};
        for (const j of lista) mapa[j.id] = j.nombreCompleto;
        setJugadoresPorId(mapa);
      })
      .catch((): void => undefined);
  }, []);

  // Ocultar el hint de swipe cuando el usuario mueva el scroll
  useEffect((): (() => void) => {
    const el = scrollRef.current;
    if (!el) return (): void => undefined;
    const onScroll = (): void => setShowSwipeHint(false);
    el.addEventListener("scroll", onScroll, { once: true });
    return (): void => el.removeEventListener("scroll", onScroll);
  }, [bracket]);

  const juegoLabel = juego === "FC25" ? "FC 25" : "Call of Duty: BO2";
  const juegoEmoji = juego === "FC25" ? "⚽" : "🔫";

  const upperPartidos = bracket?.partidos.filter((p): boolean => p.lado !== "LOSERS") ?? [];
  const lowerPartidos = bracket?.partidos.filter((p): boolean => p.lado === "LOSERS") ?? [];
  const esDoble: boolean =
    bracket?.formato === "DOUBLE_ELIMINATION" && lowerPartidos.length > 0;

  return (
    <section className="flex flex-col gap-4 md:gap-6">

      {/* Header */}
      <div className="flex flex-col gap-0.5">
        <p className="text-[10px] uppercase tracking-widest text-text-secondary">
          Bracket público · solo lectura
        </p>
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide text-white flex items-center gap-2">
          {juegoEmoji} {juegoLabel}
        </h1>
        <p className="text-text-secondary text-xs">
          Actualización automática cada 30 s
        </p>
      </div>

      {/* Cargando */}
      {bracket === undefined && (
        <div className="flex items-center gap-3 text-text-secondary">
          <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin inline-block" />
          Cargando bracket…
        </div>
      )}

      {/* Fase de grupos */}
      {(juego === "FC25" || juego === "COD_BO2") && fase != null && (
        <>
          <div className="bg-bg-card border border-edge rounded-xl p-4 md:p-5">
            <GruposPublicoView fase={fase} nombrePorId={jugadoresPorId} />
          </div>

          {/* Divisor */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-edge" />
            <span className="text-[10px] uppercase tracking-widest text-text-secondary">
              Bracket eliminatorio
            </span>
            <div className="flex-1 border-t border-edge" />
          </div>
        </>
      )}

      {/* Sin bracket */}
      {bracket === null && (
        <div className="bg-bg-card border border-edge rounded-xl p-6 sm:p-10 text-center">
          <p className="text-4xl mb-3">⏳</p>
          <p className="text-text-secondary text-base sm:text-lg">
            El bracket de{" "}
            <span className="text-white font-semibold">{juegoLabel}</span>{" "}
            aún no ha sido generado.
          </p>
          <p className="text-text-secondary text-xs sm:text-sm mt-2">
            Vuelve más tarde o consulta a los organizadores.
          </p>
        </div>
      )}

      {/* Campeón */}
      {bracket != null && bracket.campeonId !== null && (
        <div className="bg-gradient-to-r from-yellow-900/40 to-yellow-600/10 border border-yellow-500/50 rounded-xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
          <span className="text-3xl sm:text-4xl shrink-0">🏆</span>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-yellow-400">
              Campeón del torneo
            </p>
            <p className="text-lg sm:text-2xl font-bold text-yellow-300 truncate">
              {nombreSlot(bracket.campeonId, true, jugadoresPorId)}
            </p>
          </div>
        </div>
      )}

      {/* Bracket visual */}
      {bracket != null && (
        <div className="relative">
          {/* Hint de swipe — solo aparece en móvil antes del primer scroll */}
          {showSwipeHint && (
            <div className="flex sm:hidden items-center justify-center gap-2 text-xs text-text-secondary mb-2 animate-pulse">
              <span>👈</span>
              <span>Desliza para ver el bracket completo</span>
              <span>👉</span>
            </div>
          )}

          {/* Contenedor con scroll horizontal */}
          <div
            ref={scrollRef}
            className="bg-bg-card border border-edge rounded-xl overflow-auto"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {esDoble ? (
              <DoubleEliminationBracket
                matches={{
                  upper: upperPartidos.map((p): MatchType => aMatchType(p, jugadoresPorId)),
                  lower: lowerPartidos.map((p): MatchType => aMatchType(p, jugadoresPorId)),
                }}
                matchComponent={ReadOnlyMatchCard}
                theme={torneoTheme}
                options={bracketOptions}
              />
            ) : (
              <SingleEliminationBracket
                matches={upperPartidos.map((p): MatchType => aMatchType(p, jugadoresPorId))}
                matchComponent={ReadOnlyMatchCard}
                theme={torneoTheme}
                options={bracketOptions}
              />
            )}
          </div>

          {/* Degradado derecho para indicar que hay más contenido */}
          <div
            className="pointer-events-none absolute top-0 right-0 bottom-0 w-8 sm:hidden rounded-r-xl"
            style={{
              background: "linear-gradient(to right, transparent, rgba(10,10,10,0.8))",
            }}
          />
        </div>
      )}
    </section>
  );
}

export default BracketPublicoPanel;
