import { JSX, useState } from "react";
import { crearSesionEpayco, seleccionarPagoEfectivo } from "../../services/pagos";
import { HttpError } from "../../services/http";
import type { PagoResumen } from "@shared/types/pago";

interface PagoInscripcionProps {
  pago: PagoResumen;
}

interface EpaycoCheckoutHooks {
  onCreated?: (data: unknown) => void;
  onResponse?: (response: unknown) => void;
  onClosed?: (errors?: unknown) => void;
  onErrors?: (error: unknown) => void;
}

interface EpaycoCheckout {
  setHooks: (hooks: EpaycoCheckoutHooks) => void;
  open: () => void;
}

interface EpaycoGlobal {
  checkout: {
    configure: (options: { sessionId: string; type: "onpage" | "standard"; test: boolean }) => EpaycoCheckout;
  };
}

declare global {
  interface Window {
    ePayco?: EpaycoGlobal;
  }
}

function PagoInscripcion({ pago }: PagoInscripcionProps): JSX.Element {
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<boolean>(false);
  const [pagoLocal, setPagoLocal] = useState<PagoResumen>(pago);

  async function pagarConEpayco(): Promise<void> {
    setError(null);
    setMensaje(null);

    if (window.ePayco === undefined) {
      setError("El checkout de ePayco no cargó correctamente. Intenta recargar la página.");
      return;
    }

    setProcesando(true);
    try {
      const sesion = await crearSesionEpayco(pagoLocal.id);
      const checkout = window.ePayco.checkout.configure({
        sessionId: sesion.sessionId,
        type: "onpage",
        test: sesion.test,
      });

      checkout.setHooks({
        onCreated: (): void => setMensaje("Checkout creado. Completa el pago en ePayco."),
        onResponse: (): void =>
          setMensaje("Pago procesado por ePayco. Esperando confirmación oficial."),
        onClosed: (): void => setProcesando(false),
        onErrors: (): void => {
          setError("ePayco reportó un error durante el pago.");
          setProcesando(false);
        },
      });

      checkout.open();
    } catch (err: unknown) {
      setProcesando(false);
      if (err instanceof HttpError) {
        setError(err.message);
      } else {
        setError("No fue posible iniciar el pago en ePayco.");
      }
    }
  }

  async function pagarEnEfectivo(): Promise<void> {
    setError(null);
    setMensaje(null);
    setProcesando(true);
    try {
      const resultado = await seleccionarPagoEfectivo(pagoLocal.id);
      setPagoLocal({
        ...pagoLocal,
        metodo: resultado.metodo,
        estado: resultado.estado,
      });
      setMensaje("Pago en efectivo seleccionado. El admin confirmará cuando reciba el dinero.");
    } catch (err: unknown) {
      if (err instanceof HttpError) {
        setError(err.message);
      } else {
        setError("No fue posible registrar el pago en efectivo.");
      }
    } finally {
      setProcesando(false);
    }
  }

  const pagoConfirmado = pagoLocal.estado === "PAGADO";

  return (
    <div className="rounded-md border border-edge bg-bg-card p-4 text-white">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-wide text-text-secondary">
          Estado de inscripción
        </p>
        <p className="text-xl font-bold text-primary">
          {pagoConfirmado ? "Pagada" : "Pendiente de pago"}
        </p>
        <p className="text-sm text-text-secondary">
          Valor: {pagoLocal.moneda} {pagoLocal.monto}
        </p>
      </div>

      {!pagoConfirmado && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={procesando}
            onClick={(): void => {
              pagarConEpayco().catch((): void => undefined);
            }}
            className="rounded bg-primary px-4 py-2 font-bold uppercase tracking-wide text-black transition-colors duration-200 hover:bg-primary/90 disabled:opacity-50"
          >
            {procesando ? "Procesando..." : "Pagar inscripción"}
          </button>
          <button
            type="button"
            disabled={procesando}
            onClick={(): void => {
              pagarEnEfectivo().catch((): void => undefined);
            }}
            className="rounded border border-edge bg-bg-alt px-4 py-2 font-bold uppercase tracking-wide text-white transition-colors duration-200 hover:border-primary disabled:opacity-50"
          >
            Pagar en efectivo
          </button>
        </div>
      )}

      {mensaje !== null && <p className="mt-3 text-sm text-emerald-300">{mensaje}</p>}
      {error !== null && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}

export default PagoInscripcion;
