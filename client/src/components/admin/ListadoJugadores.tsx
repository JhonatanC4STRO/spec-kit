import { JSX } from "react";
import type { ListadoPorJuego } from "@shared/types/inscripcion";

interface ListadoJugadoresProps {
  listado: ListadoPorJuego;
  onEliminar: (id: string) => void;
}

function tabla(
  titulo: string,
  jugadores: ListadoPorJuego["FC25"],
  onEliminar: (id: string) => void,
): JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-bold">{titulo}</h2>
      {jugadores.length === 0 ? (
        <p className="text-text-secondary">Sin inscriptos</p>
      ) : (
        <table className="border-collapse w-full">
          <thead>
            <tr>
              <th className="border border-edge px-2 py-1 text-left">Nombre</th>
              <th className="border border-edge px-2 py-1 text-left">Nickname</th>
              <th className="border border-edge px-2 py-1 text-left">Fecha</th>
              <th className="border border-edge px-2 py-1"></th>
            </tr>
          </thead>
          <tbody>
            {jugadores.map((jugador, indice): JSX.Element => (
              <tr key={jugador.id} className={indice % 2 === 0 ? "bg-bg-base" : "bg-bg-card"}>
                <td className="border border-edge px-2 py-1">{jugador.nombreCompleto}</td>
                <td className="border border-edge px-2 py-1">{jugador.nickname}</td>
                <td className="border border-edge px-2 py-1">
                  {new Date(jugador.createdAt).toLocaleString()}
                </td>
                <td className="border border-edge px-2 py-1">
                  <button
                    className="text-red-400"
                    onClick={(): void => onEliminar(jugador.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ListadoJugadores({ listado, onEliminar }: ListadoJugadoresProps): JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      {tabla("FC 25", listado.FC25, onEliminar)}
      {tabla("Call of Duty Black Ops 2", listado.COD_BO2, onEliminar)}
    </div>
  );
}

export default ListadoJugadores;
