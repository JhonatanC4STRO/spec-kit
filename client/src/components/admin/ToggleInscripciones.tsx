import { useState, JSX } from "react";
import { actualizarEstado } from "../../services/inscripciones";

interface ToggleInscripcionesProps {
  abierta: boolean;
  token: string;
  onCambio: (abierta: boolean) => void;
}

function ToggleInscripciones({
  abierta,
  token,
  onCambio,
}: ToggleInscripcionesProps): JSX.Element {
  const [enviando, setEnviando] = useState<boolean>(false);

  async function handleToggle(): Promise<void> {
    setEnviando(true);
    try {
      const resultado = await actualizarEstado(!abierta, token);
      onCambio(resultado.abierta);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <button
      disabled={enviando}
      onClick={handleToggle}
      className="px-3 py-1 border border-white text-white rounded disabled:opacity-50"
    >
      {abierta ? "Cerrar inscripciones" : "Abrir inscripciones"}
    </button>
  );
}

export default ToggleInscripciones;
