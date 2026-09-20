import { JSX, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getPago } from "../services/pagos";
import type { PagoResumen } from "@shared/types/pago";

function PagoRespuestaPage(): JSX.Element {
  const [params] = useSearchParams();
  const pagoId = params.get("pagoId");
  const refPayco = params.get("ref_payco");
  const [pago, setPago] = useState<PagoResumen | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect((): void => {
    if (pagoId === null) {
      setError("No se encontró la referencia interna del pago.");
      return;
    }

    getPago(pagoId)
      .then((nuevoPago): void => setPago(nuevoPago))
      .catch((): void =>
        setError("No fue posible consultar el estado del pago. Intenta más tarde."),
      );
  }, [pagoId]);

  const titulo = pago?.estado === "PAGADO" ? "Pago confirmado" : "Respuesta recibida";
  const descripcion =
    pago?.estado === "PAGADO"
      ? "Tu inscripción ya está marcada como pagada."
      : "La redirección del navegador no confirma el pago por sí sola. El sistema actualizará tu inscripción cuando llegue la confirmación oficial de ePayco.";

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-4 rounded-md border border-edge bg-bg-card p-6 text-white">
      <p className="text-sm font-bold uppercase tracking-wide text-primary">ePayco</p>
      <h1 className="text-3xl font-bold uppercase tracking-wide">{titulo}</h1>
      <p className="text-text-secondary">{descripcion}</p>

      {refPayco !== null && (
        <p className="text-sm text-text-secondary">
          Referencia ePayco: <span className="text-white">{refPayco}</span>
        </p>
      )}

      {pago !== null && (
        <div className="rounded bg-bg-alt p-4 text-sm">
          <p>Estado: {pago.estado}</p>
          <p>Método: {pago.metodo}</p>
          <p>Referencia interna: {pago.referenciaInterna}</p>
        </div>
      )}

      {error !== null && <p className="text-red-400">{error}</p>}

      <Link
        to="/home"
        className="w-fit rounded bg-primary px-4 py-2 font-bold uppercase tracking-wide text-black transition-colors duration-200 hover:bg-primary/90"
      >
        Volver al inicio
      </Link>
    </section>
  );
}

export default PagoRespuestaPage;
