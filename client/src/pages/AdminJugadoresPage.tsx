import { useEffect, useState, JSX } from "react";
import { Navigate } from "react-router-dom";
import ListadoJugadores from "../components/admin/ListadoJugadores";
import ConfirmarEliminacion from "../components/admin/ConfirmarEliminacion";
import ToggleInscripciones from "../components/admin/ToggleInscripciones";
import {
  getListadoAdmin,
  eliminarJugador,
  getEstado,
} from "../services/inscripciones";
import { getToken } from "../services/authStore";
import type { ListadoPorJuego, Inscripcion } from "@shared/types/inscripcion";

function AdminJugadoresPage(): JSX.Element {
  const token: string | null = getToken();
  const [listado, setListado] = useState<ListadoPorJuego | null>(null);
  const [abierta, setAbierta] = useState<boolean | null>(null);
  const [aEliminar, setAEliminar] = useState<Inscripcion | null>(null);

  async function cargar(): Promise<void> {
    if (token === null) {
      return;
    }
    const [nuevoListado, estado] = await Promise.all([
      getListadoAdmin(token),
      getEstado(),
    ]);
    setListado(nuevoListado);
    setAbierta(estado.abierta);
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

  if (listado === null || abierta === null) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <ToggleInscripciones abierta={abierta} token={token} onCambio={setAbierta} />
      <ListadoJugadores
        listado={listado}
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
