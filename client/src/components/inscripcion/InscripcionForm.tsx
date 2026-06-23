import { useState, FormEvent, JSX } from "react";
import { crearInscripcion } from "../../services/inscripciones";
import { HttpError } from "../../services/http";
import type { Juego, EstadoInscripciones } from "@shared/types/inscripcion";

interface FormState {
  nombreCompleto: string;
  nickname: string;
  documento: string;
  ficha: string;
  programa: string;
  correo: string;
  telefono: string;
  juego: Juego | "";
}

interface InscripcionFormProps {
  estado: EstadoInscripciones;
}

const ESTADO_INICIAL: FormState = {
  nombreCompleto: "",
  nickname: "",
  documento: "",
  ficha: "",
  programa: "",
  correo: "",
  telefono: "",
  juego: "",
};

function InscripcionForm({ estado }: InscripcionFormProps): JSX.Element {
  const [form, setForm] = useState<FormState>(ESTADO_INICIAL);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<boolean>(false);
  const [enviando, setEnviando] = useState<boolean>(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);

    if (form.juego === "") {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (form.juego === "FC25") {
      if (
        form.nombreCompleto.trim() === "" ||
        form.documento.trim() === "" ||
        form.ficha.trim() === "" ||
        form.programa.trim() === "" ||
        form.correo.trim() === "" ||
        form.telefono.trim() === ""
      ) {
        setError("Todos los campos son obligatorios");
        return;
      }
    } else if (form.nombreCompleto.trim() === "" || form.nickname.trim() === "") {
      setError("Todos los campos son obligatorios");
      return;
    }

    setEnviando(true);
    try {
      await crearInscripcion({
        nombreCompleto: form.nombreCompleto,
        nickname: form.nickname,
        juego: form.juego,
        ...(form.juego === "FC25"
          ? {
              documento: form.documento,
              ficha: form.ficha,
              programa: form.programa,
              correo: form.correo,
              telefono: form.telefono,
            }
          : {}),
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
      {form.juego === "FC25" && (
        <>
          <label className="flex flex-col gap-1">
            Número de documento
            <input
              className="bg-bg-alt border border-edge text-white rounded px-3 py-2"
              value={form.documento}
              onChange={(e): void => setForm({ ...form, documento: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            Ficha
            <input
              className="bg-bg-alt border border-edge text-white rounded px-3 py-2"
              value={form.ficha}
              onChange={(e): void => setForm({ ...form, ficha: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            Programa
            <input
              className="bg-bg-alt border border-edge text-white rounded px-3 py-2"
              value={form.programa}
              onChange={(e): void => setForm({ ...form, programa: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            Correo electrónico
            <input
              className="bg-bg-alt border border-edge text-white rounded px-3 py-2"
              value={form.correo}
              onChange={(e): void => setForm({ ...form, correo: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            Teléfono / WhatsApp
            <input
              className="bg-bg-alt border border-edge text-white rounded px-3 py-2"
              value={form.telefono}
              onChange={(e): void => setForm({ ...form, telefono: e.target.value })}
            />
          </label>
        </>
      )}
      <label className="flex flex-col gap-1">
        Nickname{form.juego === "FC25" ? " / ID (opcional)" : ""}
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
          <option value="FC25" disabled={!estado.FC25.abierta}>
            FC 25{!estado.FC25.abierta && " (cerrado)"}
          </option>
          <option value="COD_BO2" disabled={!estado.COD_BO2.abierta}>
            Call of Duty Black Ops 2{!estado.COD_BO2.abierta && " (cerrado)"}
          </option>
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
