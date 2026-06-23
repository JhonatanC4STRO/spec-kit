import { useEffect, useState, JSX } from "react";
import InscripcionForm from "../components/inscripcion/InscripcionForm";
import InscripcionesCerradas from "../components/inscripcion/InscripcionesCerradas";
import { getEstado } from "../services/inscripciones";

function InscripcionPage(): JSX.Element {
  const [abierta, setAbierta] = useState<boolean | null>(null);

  useEffect((): void => {
    getEstado()
      .then((estado): void => setAbierta(estado.abierta))
      .catch((): void => setAbierta(true));
  }, []);

  if (abierta === null) {
    return <div>Cargando...</div>;
  }

  return abierta ? <InscripcionForm /> : <InscripcionesCerradas />;
}

export default InscripcionPage;
