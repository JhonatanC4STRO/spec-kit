import { JSX } from "react";

interface ConfirmarEliminacionProps {
  nombreJugador: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

function ConfirmarEliminacion({
  nombreJugador,
  onConfirmar,
  onCancelar,
}: ConfirmarEliminacionProps): JSX.Element {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="bg-bg-card border border-edge text-white rounded p-6 flex flex-col gap-4">
        <p>¿Eliminar a {nombreJugador}? Esta acción no se puede deshacer.</p>
        <div className="flex gap-2 justify-end">
          <button
            className="px-3 py-1 border border-edge text-white rounded"
            onClick={onCancelar}
          >
            Cancelar
          </button>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded"
            onClick={onConfirmar}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmarEliminacion;
