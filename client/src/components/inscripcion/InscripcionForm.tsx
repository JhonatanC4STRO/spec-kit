import { useState, FormEvent, JSX } from "react";
import { crearInscripcion } from "../../services/inscripciones";
import { HttpError } from "../../services/http";
import type { Juego } from "@shared/types/inscripcion";

interface FormState {
  nombreCompleto: string;
  nickname: string;
  juego: Juego | "";
}

const ESTADO_INICIAL: FormState = { nombreCompleto: "", nickname: "", juego: "" };

function InscripcionForm(): JSX.Element {
  const [form, setForm] = useState<FormState>(ESTADO_INICIAL);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<boolean>(false);
  const [enviando, setEnviando] = useState<boolean>(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);

    if (
      form.nombreCompleto.trim() === "" ||
      form.nickname.trim() === "" ||
      form.juego === ""
    ) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setEnviando(true);
    try {
      await crearInscripcion({
        nombreCompleto: form.nombreCompleto,
        nickname: form.nickname,
        juego: form.juego,
      });
      setExito(true);
      setForm(ESTADO_INICIAL);
    } catch (err: unknown) {
      if (err instanceof HttpError) {
        setError(err.message);
      } else {
        setError("Ocurrió un error inesperado");
      }
    } finally {
      setEnviando(false);
    }
  }

  if (exito) {
    return (
      <div className="rounded-md bg-bg-card border border-edge p-4 text-emerald-300">
        Inscripción registrada con éxito.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
      <label className="flex flex-col gap-1">
        Nombre completo
        <input
          className="bg-bg-alt border border-edge text-white rounded px-3 py-2"
          value={form.nombreCompleto}
          onChange={(e): void => setForm({ ...form, nombreCompleto: e.target.value })}
        />
      </label>
      <label className="flex flex-col gap-1">
        Nickname
        <input
          className="bg-bg-alt border border-edge text-white rounded px-3 py-2"
          value={form.nickname}
          onChange={(e): void => setForm({ ...form, nickname: e.target.value })}
        />
      </label>
      <label className="flex flex-col gap-1">
        Juego
        <select
          className="bg-bg-alt border border-edge text-white rounded px-3 py-2"
          value={form.juego}
          onChange={(e): void => setForm({ ...form, juego: e.target.value as Juego })}
        >
          <option value="">Seleccionar juego</option>
          <option value="FC25">FC 25</option>
          <option value="COD_BO2">Call of Duty Black Ops 2</option>
        </select>
      </label>
      {error !== null && <p className="text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={enviando}
        className="bg-primary text-black rounded px-4 py-2 disabled:opacity-50"
      >
        Inscribirme
      </button>
    </form>
  );
}

export default InscripcionForm;
