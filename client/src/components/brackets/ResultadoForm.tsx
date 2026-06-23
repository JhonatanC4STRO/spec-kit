import { useState, JSX } from "react";
import { registrarResultado } from "../../services/partidos";
import { HttpError } from "../../services/http";
import type { Partido } from "@shared/types/bracket";

interface ResultadoFormProps {
  partido: Partido;
  token: string;
  onRegistrado: () => void;
  nombreA: string;
  nombreB: string;
}

function ResultadoForm({
  partido,
  token,
  onRegistrado,
  nombreA,
  nombreB,
}: ResultadoFormProps): JSX.Element {
  const [scoreA, setScoreA] = useState<string>(partido.scoreA?.toString() ?? "");
  const [scoreB, setScoreB] = useState<string>(partido.scoreB?.toString() ?? "");
  const [penaltyScoreA, setPenaltyScoreA] = useState<string>(
    partido.penaltyScoreA?.toString() ?? "",
  );
  const [penaltyScoreB, setPenaltyScoreB] = useState<string>(
    partido.penaltyScoreB?.toString() ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState<boolean>(false);

  const empatado: boolean = scoreA !== "" && scoreB !== "" && scoreA === scoreB;

  function calcularGanador(): string | null {
    if (scoreA === "" || scoreB === "") {
      return null;
    }
    if (!empatado) {
      return Number(scoreA) > Number(scoreB) ? partido.jugadorAId : partido.jugadorBId;
    }
    if (penaltyScoreA === "" || penaltyScoreB === "" || penaltyScoreA === penaltyScoreB) {
      return null;
    }
    return Number(penaltyScoreA) > Number(penaltyScoreB)
      ? partido.jugadorAId
      : partido.jugadorBId;
  }

  const ganadorId: string | null = calcularGanador();
  const nombreGanador: string | null =
    ganadorId === null ? null : ganadorId === partido.jugadorAId ? nombreA : nombreB;

  async function handleSubmit(): Promise<void> {
    if (ganadorId === null) {
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      await registrarResultado(
        partido.id,
        {
          scoreA: Number(scoreA),
          scoreB: Number(scoreB),
          penaltyScoreA: empatado ? Number(penaltyScoreA) : null,
          penaltyScoreB: empatado ? Number(penaltyScoreB) : null,
          winnerId: ganadorId,
        },
        token,
      );
      onRegistrado();
    } catch (err: unknown) {
      if (err instanceof HttpError) {
        setError(err.message);
      } else {
        setError("Ocurrió un error inesperado");
      }
    } finally {
      setEnviando(false);
    }
  }

  if (partido.jugadorAId === null || partido.jugadorBId === null) {
    return <p className="text-text-secondary">Partido todavía no definido</p>;
  }

  return (
    <div className="flex flex-col gap-3 bg-bg-alt border border-edge p-3 rounded">
      <div className="flex gap-2">
        <label className="flex flex-col gap-1 text-xs text-text-secondary flex-1">
          Puntos {nombreA}
          <input
            type="number"
            min={0}
            value={scoreA}
            onChange={(e): void => setScoreA(e.target.value)}
            className="bg-bg-card border border-edge text-white px-2 py-1 rounded focus:outline-none focus:border-primary transition-colors duration-200"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-text-secondary flex-1">
          Puntos {nombreB}
          <input
            type="number"
            min={0}
            value={scoreB}
            onChange={(e): void => setScoreB(e.target.value)}
            className="bg-bg-card border border-edge text-white px-2 py-1 rounded focus:outline-none focus:border-primary transition-colors duration-200"
          />
        </label>
      </div>
      {empatado && (
        <div className="flex gap-2">
          <label className="flex flex-col gap-1 text-xs text-text-secondary flex-1">
            Penales {nombreA}
            <input
              type="number"
              min={0}
              value={penaltyScoreA}
              onChange={(e): void => setPenaltyScoreA(e.target.value)}
              className="bg-bg-card border border-edge text-white px-2 py-1 rounded focus:outline-none focus:border-primary transition-colors duration-200"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-text-secondary flex-1">
            Penales {nombreB}
            <input
              type="number"
              min={0}
              value={penaltyScoreB}
              onChange={(e): void => setPenaltyScoreB(e.target.value)}
              className="bg-bg-card border border-edge text-white px-2 py-1 rounded focus:outline-none focus:border-primary transition-colors duration-200"
            />
          </label>
        </div>
      )}
      <p className="text-xs text-text-secondary">
        Ganador:{" "}
        <span className={nombreGanador !== null ? "text-emerald-300 font-semibold" : ""}>
          {nombreGanador ?? "Completa los puntajes"}
        </span>
      </p>
      <button
        disabled={enviando || ganadorId === null}
        onClick={(): void => {
          handleSubmit().catch((): void => undefined);
        }}
        className="bg-primary text-black rounded px-4 py-2 font-semibold hover:brightness-110 transition-all duration-200 disabled:opacity-50 self-start"
      >
        {partido.winnerId === null ? "Registrar resultado" : "Corregir resultado"}
      </button>
      {error !== null && (
        <p className="text-red-400 text-sm border border-red-400/30 bg-red-400/10 rounded px-2 py-1">
          {error}
        </p>
      )}
    </div>
  );
}

export default ResultadoForm;
