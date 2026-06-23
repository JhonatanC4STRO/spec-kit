import { useState, JSX } from "react";
import { registrarResultado } from "../../services/partidos";
import { HttpError } from "../../services/http";
import type { Partido } from "@shared/types/bracket";

interface ResultadoFormProps {
  partido: Partido;
  token: string;
  onRegistrado: () => void;
}

function ResultadoForm({ partido, token, onRegistrado }: ResultadoFormProps): JSX.Element {
  const [scoreA, setScoreA] = useState<string>(partido.scoreA?.toString() ?? "");
  const [scoreB, setScoreB] = useState<string>(partido.scoreB?.toString() ?? "");
  const [penaltyScoreA, setPenaltyScoreA] = useState<string>(
    partido.penaltyScoreA?.toString() ?? "",
  );
  const [penaltyScoreB, setPenaltyScoreB] = useState<string>(
    partido.penaltyScoreB?.toString() ?? "",
  );
  const [winnerId, setWinnerId] = useState<string>(partido.winnerId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState<boolean>(false);

  const empatado: boolean = scoreA !== "" && scoreB !== "" && scoreA === scoreB;

  async function handleSubmit(): Promise<void> {
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
          winnerId,
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
    <div className="flex flex-col gap-2 bg-bg-alt border border-edge p-2 rounded">
      <div className="flex gap-2">
        <input
          type="number"
          min={0}
          value={scoreA}
          onChange={(e): void => setScoreA(e.target.value)}
          placeholder="Puntos jugador A"
          className="bg-bg-card border border-edge text-white px-2 py-1 w-36"
        />
        <input
          type="number"
          min={0}
          value={scoreB}
          onChange={(e): void => setScoreB(e.target.value)}
          placeholder="Puntos jugador B"
          className="bg-bg-card border border-edge text-white px-2 py-1 w-36"
        />
      </div>
      {empatado && (
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            value={penaltyScoreA}
            onChange={(e): void => setPenaltyScoreA(e.target.value)}
            placeholder="Penales A"
            className="bg-bg-card border border-edge text-white px-2 py-1 w-36"
          />
          <input
            type="number"
            min={0}
            value={penaltyScoreB}
            onChange={(e): void => setPenaltyScoreB(e.target.value)}
            placeholder="Penales B"
            className="bg-bg-card border border-edge text-white px-2 py-1 w-36"
          />
        </div>
      )}
      <select
        value={winnerId}
        onChange={(e): void => setWinnerId(e.target.value)}
        className="bg-bg-card border border-edge text-white px-2 py-1"
      >
        <option value="">Seleccionar ganador</option>
        <option value={partido.jugadorAId}>Jugador A ({partido.jugadorAId})</option>
        <option value={partido.jugadorBId}>Jugador B ({partido.jugadorBId})</option>
      </select>
      <button
        disabled={enviando || winnerId === ""}
        onClick={(): void => {
          handleSubmit().catch((): void => undefined);
        }}
        className="bg-primary text-black rounded px-4 py-2 disabled:opacity-50 self-start"
      >
        {partido.winnerId === null ? "Registrar resultado" : "Corregir resultado"}
      </button>
      {error !== null && <p className="text-red-400">{error}</p>}
    </div>
  );
}

export default ResultadoForm;
