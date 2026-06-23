import { useEffect, useState, JSX } from "react";
import InscripcionForm from "../components/inscripcion/InscripcionForm";
import InscripcionesCerradas from "../components/inscripcion/InscripcionesCerradas";
import { getEstado } from "../services/inscripciones";
import type { EstadoInscripciones } from "@shared/types/inscripcion";

function InscripcionPage(): JSX.Element {
  const [estado, setEstado] = useState<EstadoInscripciones | null>(null);

  useEffect((): void => {
    getEstado()
      .then((nuevoEstado): void => setEstado(nuevoEstado))
      .catch((): void => setEstado({ FC25: { abierta: true }, COD_BO2: { abierta: true } }));
  }, []);

  if (estado === null) {
    return <div>Cargando...</div>;
  }

  const hayJuegoAbierto = estado.FC25.abierta || estado.COD_BO2.abierta;

  return hayJuegoAbierto ? <InscripcionForm estado={estado} /> : <InscripcionesCerradas />;
}

export default InscripcionPage;
