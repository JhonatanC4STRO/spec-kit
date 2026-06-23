import { useState, JSX } from "react";
import { reiniciarBracket } from "../../services/bracket";
import { HttpError } from "../../services/http";
import type { Juego } from "@shared/types/inscripcion";

interface ReiniciarBracketButtonProps {
  juego: Juego;
  token: string;
  onReiniciado: () => void;
}

function ReiniciarBracketButton({
  juego,
  token,
  onReiniciado,
}: ReiniciarBracketButtonProps): JSX.Element {
  const [confirmando, setConfirmando] = useState<boolean>(false);
  const [enviando, setEnviando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirmar(): Promise<void> {
    setError(null);
    setEnviando(true);
    try {
      await reiniciarBracket(juego, token);
      setConfirmando(false);
      onReiniciado();
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
    <>
      <button
        type="button"
        onClick={(): void => setConfirmando(true)}
        className="px-3 py-1 border border-red-400 text-red-400 rounded hover:bg-red-400/10 transition-colors duration-200"
      >
        Reiniciar bracket
      </button>

      {confirmando && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-bg-card border border-edge text-white rounded p-6 flex flex-col gap-4 max-w-sm">
            <h2 className="font-bold uppercase tracking-wide text-sm text-white">
              Reiniciar bracket
            </h2>
            <p className="text-text-secondary text-sm">
              ¿Reiniciar el bracket de {juego}? Se borrarán todos los partidos
              y resultados registrados. Esta acción no se puede deshacer.
            </p>
            {error !== null && (
              <p className="text-red-400 text-sm border border-red-400/30 bg-red-400/10 rounded px-2 py-1">
                {error}
              </p>
            )}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                disabled={enviando}
                className="px-3 py-1 border border-edge text-white rounded hover:border-primary hover:text-primary transition-colors duration-200 disabled:opacity-50"
                onClick={(): void => setConfirmando(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={enviando}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-400 transition-colors duration-200 disabled:opacity-50"
                onClick={(): void => {
                  handleConfirmar().catch((): void => undefined);
                }}
              >
                Reiniciar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ReiniciarBracketButton;
