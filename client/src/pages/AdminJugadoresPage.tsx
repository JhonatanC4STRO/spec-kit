import { useEffect, useState, JSX } from "react";
import { Navigate } from "react-router-dom";
import ListadoJugadores from "../components/admin/ListadoJugadores";
import ConfirmarEliminacion from "../components/admin/ConfirmarEliminacion";
import {
  getListadoAdmin,
  eliminarJugador,
  getEstado,
} from "../services/inscripciones";
import { getToken } from "../services/authStore";
import type { ListadoPorJuego, Inscripcion, EstadoInscripciones } from "@shared/types/inscripcion";

function AdminJugadoresPage(): JSX.Element {
  const token: string | null = getToken();
  const [listado, setListado] = useState<ListadoPorJuego | null>(null);
  const [estado, setEstado] = useState<EstadoInscripciones | null>(null);
  const [aEliminar, setAEliminar] = useState<Inscripcion | null>(null);

  async function cargar(): Promise<void> {
    if (token === null) {
      return;
    }
    const [nuevoListado, nuevoEstado] = await Promise.all([
      getListadoAdmin(token),
      getEstado(),
    ]);
    setListado(nuevoListado);
    setEstado(nuevoEstado);
  }

  useEffect((): void => {
    cargar().catch((): void => undefined);
  }, []);

  function buscarJugador(id: string): Inscripcion | undefined {
    if (listado === null) {
      return undefined;
    }
    return [...listado.FC25, ...listado.COD_BO2].find((j): boolean => j.id === id);
  }

  async function confirmarEliminacion(): Promise<void> {
    if (aEliminar === null || token === null) {
      return;
    }
    await eliminarJugador(aEliminar.id, token);
    setAEliminar(null);
    await cargar();
  }

  if (token === null) {
    return <Navigate to="/admin/login" replace />;
  }

  if (listado === null || estado === null) {
    return <p className="text-text-secondary">Cargando...</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold uppercase tracking-wide text-white">
        Jugadores Inscritos
      </h1>
      <ListadoJugadores
        listado={listado}
        estado={estado}
        token={token}
        onCambioEstado={(juego, abierta): void =>
          setEstado((previo) => (previo === null ? previo : { ...previo, [juego]: { abierta } }))
        }
        onEliminar={(id): void => setAEliminar(buscarJugador(id) ?? null)}
      />
      {aEliminar !== null && (
        <ConfirmarEliminacion
          nombreJugador={aEliminar.nombreCompleto}
          onConfirmar={(): void => {
            confirmarEliminacion().catch((): void => undefined);
          }}
          onCancelar={(): void => setAEliminar(null)}
        />
      )}
    </div>
  );
}

export default AdminJugadoresPage;
