import { JSX } from "react";
import type { ListadoPorJuego, EstadoInscripciones, Juego } from "@shared/types/inscripcion";
import ToggleInscripciones from "./ToggleInscripciones";

interface ListadoJugadoresProps {
  listado: ListadoPorJuego;
  estado: EstadoInscripciones;
  token: string;
  onCambioEstado: (juego: Juego, abierta: boolean) => void;
  onEliminar: (id: string) => void;
}

function tabla(
  titulo: string,
  juego: Juego,
  jugadores: ListadoPorJuego["FC25"],
  abierta: boolean,
  token: string,
  onCambioEstado: (juego: Juego, abierta: boolean) => void,
  onEliminar: (id: string) => void,
): JSX.Element {
  const esCod = juego === "COD_BO2";

  return (
    <div className="bg-bg-card border border-edge rounded p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-bold uppercase tracking-wide text-sm text-primary">
          {titulo} ({jugadores.length})
        </h2>
        <ToggleInscripciones
          juego={juego}
          abierta={abierta}
          token={token}
          onCambio={(nuevaAbierta): void => onCambioEstado(juego, nuevaAbierta)}
        />
      </div>
      {jugadores.length === 0 ? (
        <p className="text-text-secondary text-sm">Sin inscriptos</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="border-collapse w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-bg-alt">
                <th className="border border-edge px-3 py-2 text-left text-text-secondary uppercase tracking-wide text-xs w-12">
                  #
                </th>
                {esCod ? (
                  <>
                    <th className="border border-edge px-3 py-2 text-left text-text-secondary uppercase tracking-wide text-xs">
                      Nombre del Equipo
                    </th>
                    <th className="border border-edge px-3 py-2 text-left text-text-secondary uppercase tracking-wide text-xs">
                      Jugador 1
                    </th>
                    <th className="border border-edge px-3 py-2 text-left text-text-secondary uppercase tracking-wide text-xs">
                      Jugador 2
                    </th>
                    <th className="border border-edge px-3 py-2 text-left text-text-secondary uppercase tracking-wide text-xs">
                      Datos Representante
                    </th>
                    <th className="border border-edge px-3 py-2 text-left text-text-secondary uppercase tracking-wide text-xs">
                      Tag
                    </th>
                  </>
                ) : (
                  <>
                    <th className="border border-edge px-3 py-2 text-left text-text-secondary uppercase tracking-wide text-xs">
                      Nombre
                    </th>
                    <th className="border border-edge px-3 py-2 text-left text-text-secondary uppercase tracking-wide text-xs">
                      Documento
                    </th>
                    <th className="border border-edge px-3 py-2 text-left text-text-secondary uppercase tracking-wide text-xs">
                      Nickname / ID
                    </th>
                  </>
                )}
                <th className="border border-edge px-3 py-2 text-left text-text-secondary uppercase tracking-wide text-xs">
                  Fecha
                </th>
                <th className="border border-edge px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {jugadores.map((jugador, indice): JSX.Element => (
                <tr
                  key={jugador.id}
                  className={`${indice % 2 === 0 ? "bg-bg-base" : "bg-bg-card"} hover:bg-bg-alt transition-colors duration-200`}
                >
                  <td className="border border-edge px-3 py-2 text-text-secondary">
                    {indice + 1}
                  </td>
                  {esCod ? (
                    <>
                      <td className="border border-edge px-3 py-2 text-white font-semibold">
                        {jugador.nickname}
                      </td>
                      <td className="border border-edge px-3 py-2 text-white">
                        {jugador.jugador1Nombre}
                      </td>
                      <td className="border border-edge px-3 py-2 text-white">
                        {jugador.jugador2Nombre}
                      </td>
                      <td className="border border-edge px-3 py-2 text-text-secondary text-xs">
                        <div><span className="text-white/60">Ficha:</span> {jugador.ficha}</div>
                        <div><span className="text-white/60">Programa:</span> {jugador.programa}</div>
                        <div><span className="text-white/60">Email:</span> {jugador.correo}</div>
                        <div><span className="text-white/60">Tel:</span> {jugador.telefono}</div>
                      </td>
                      <td className="border border-edge px-3 py-2 text-amber-400 font-mono">
                        {jugador.nickEquipo || "-"}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="border border-edge px-3 py-2 text-white">
                        {jugador.nombreCompleto}
                      </td>
                      <td className="border border-edge px-3 py-2 text-white">
                        {jugador.documento || "-"}
                      </td>
                      <td className="border border-edge px-3 py-2 text-white">
                        {jugador.nickname || "-"}
                      </td>
                    </>
                  )}
                  <td className="border border-edge px-3 py-2 text-text-secondary">
                    {new Date(jugador.createdAt).toLocaleString()}
                  </td>
                  <td className="border border-edge px-3 py-2 text-center">
                    <button
                      className="text-red-400 hover:text-red-300 transition-colors duration-200 font-bold"
                      onClick={(): void => onEliminar(jugador.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ListadoJugadores({
  listado,
  estado,
  token,
  onCambioEstado,
  onEliminar,
}: ListadoJugadoresProps): JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      {tabla(
        "FC 25",
        "FC25",
        listado.FC25,
        estado.FC25.abierta,
        token,
        onCambioEstado,
        onEliminar,
      )}
      {tabla(
        "Call of Duty Black Ops 2",
        "COD_BO2",
        listado.COD_BO2,
        estado.COD_BO2.abierta,
        token,
        onCambioEstado,
        onEliminar,
      )}
    </div>
  );
}

export default ListadoJugadores;
