import { useState, JSX } from "react";
import { generarBracket } from "../../services/bracket";
import { HttpError } from "../../services/http";
import type { Juego } from "@shared/types/inscripcion";
import { esCantidadValida, cantidadesValidas } from "../../utils/torneo";

interface GenerarBracketButtonProps {
  juego: Juego;
  token: string;
  inscritos: number;
  onGenerado: () => void;
}

function GenerarBracketButton({
  juego,
  token,
  inscritos,
  onGenerado,
}: GenerarBracketButtonProps): JSX.Element {
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState<boolean>(false);

  const cantidadOk: boolean = esCantidadValida(juego, inscritos);

  async function handleClick(): Promise<void> {
    if (!window.confirm(`¿Generar el bracket de ${juego}? No se puede deshacer.`)) {
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      await generarBracket(juego, token);
      onGenerado();
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

  return (
    <div className="flex flex-col gap-2">
      <button
        disabled={enviando || !cantidadOk}
        onClick={(): void => {
          handleClick().catch((): void => undefined);
        }}
        title={
          cantidadOk
            ? undefined
            : `Se necesitan ${cantidadesValidas(juego).join(", ")} jugadores (hay ${inscritos})`
        }
        className="bg-primary text-black rounded px-4 py-2 font-semibold hover:brightness-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Generar bracket de {juego}
      </button>
      {!cantidadOk && (
        <p className="text-amber-400 text-sm">
          Hay {inscritos} inscrito{inscritos === 1 ? "" : "s"}. Solo se puede generar con{" "}
          {cantidadesValidas(juego).join(", ")} jugadores.
        </p>
      )}
      {error !== null && <p className="text-red-400">{error}</p>}
    </div>
  );
}

export default GenerarBracketButton;
