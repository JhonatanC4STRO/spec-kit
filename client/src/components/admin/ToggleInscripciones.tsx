import { useState, JSX } from "react";
import { actualizarEstado } from "../../services/inscripciones";
import type { Juego } from "@shared/types/inscripcion";

interface ToggleInscripcionesProps {
  juego: Juego;
  abierta: boolean;
  token: string;
  onCambio: (abierta: boolean) => void;
}

function ToggleInscripciones({
  juego,
  abierta,
  token,
  onCambio,
}: ToggleInscripcionesProps): JSX.Element {
  const [enviando, setEnviando] = useState<boolean>(false);

  async function handleToggle(): Promise<void> {
    setEnviando(true);
    try {
      const resultado = await actualizarEstado(juego, !abierta, token);
      onCambio(resultado.abierta);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <button
      disabled={enviando}
      onClick={handleToggle}
      className="px-3 py-1 border border-white text-white rounded hover:border-primary hover:text-primary transition-colors duration-200 disabled:opacity-50"
    >
      {abierta ? "Cerrar inscripciones" : "Abrir inscripciones"}
    </button>
  );
}

export default ToggleInscripciones;
