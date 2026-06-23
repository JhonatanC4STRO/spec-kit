import { useState, JSX } from "react";
import { generarBracket } from "../../services/bracket";
import { HttpError } from "../../services/http";
import type { Juego } from "@shared/types/inscripcion";

interface GenerarBracketButtonProps {
  juego: Juego;
  token: string;
  onGenerado: () => void;
}

function GenerarBracketButton({
  juego,
  token,
  onGenerado,
}: GenerarBracketButtonProps): JSX.Element {
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState<boolean>(false);

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
        disabled={enviando}
        onClick={(): void => {
          handleClick().catch((): void => undefined);
        }}
        className="bg-primary text-black rounded px-4 py-2 font-semibold hover:brightness-110 transition-all duration-200 disabled:opacity-50"
      >
        Generar bracket de {juego}
      </button>
      {error !== null && <p className="text-red-400">{error}</p>}
    </div>
  );
}

export default GenerarBracketButton;
