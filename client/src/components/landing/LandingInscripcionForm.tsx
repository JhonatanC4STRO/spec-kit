import { useState, FormEvent, useEffect, JSX } from "react";
import { crearInscripcion } from "../../services/inscripciones";
import { getEstado } from "../../services/inscripciones";
import { HttpError } from "../../services/http";
import type { Juego, EstadoInscripciones, CrearInscripcionRequest } from "@shared/types/inscripcion";

interface FormState {
  nombreCompleto: string;
  nickname: string;
  documento: string;
  juego: Juego | "";
  jugador1Nombre: string;
  jugador2Nombre: string;
  ficha: string;
  programa: string;
  correo: string;
  telefono: string;
  nickEquipo: string;
}

const ESTADO_INICIAL: FormState = {
  nombreCompleto: "",
  nickname: "",
  documento: "",
  juego: "",
  jugador1Nombre: "",
  jugador2Nombre: "",
  ficha: "",
  programa: "",
  correo: "",
  telefono: "",
  nickEquipo: "",
};

const GAME_OPTIONS: { value: Juego; label: string; icon: string; color: string }[] = [
  { value: "FC25", label: "EA Sports FC 25", icon: "⚽", color: "#00c853" },
  { value: "COD_BO2", label: "Call of Duty: Black Ops 2", icon: "🔫", color: "#ff6d00" },
];

function LandingInscripcionForm(): JSX.Element {
  const [form, setForm] = useState<FormState>(ESTADO_INICIAL);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<boolean>(false);
  const [enviando, setEnviando] = useState<boolean>(false);
  const [estado, setEstado] = useState<EstadoInscripciones | null>(null);

  useEffect((): void => {
    getEstado()
      .then((nuevoEstado): void => setEstado(nuevoEstado))
      .catch((): void =>
        setEstado({ FC25: { abierta: true }, COD_BO2: { abierta: true } }),
      );
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);

    if (form.juego === "") {
      setError("Por favor selecciona un juego.");
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
        setError("Todos los campos son obligatorios.");
        return;
      }
    } else if (form.juego === "COD_BO2") {
      if (
        form.nickname.trim() === "" ||
        form.jugador1Nombre.trim() === "" ||
        form.jugador2Nombre.trim() === "" ||
        form.ficha.trim() === "" ||
        form.programa.trim() === "" ||
        form.correo.trim() === "" ||
        form.telefono.trim() === ""
      ) {
        setError("Todos los campos obligatorios del equipo y representante son requeridos.");
        return;
      }
    }

    setEnviando(true);
    try {
      const payload: CrearInscripcionRequest = {
        juego: form.juego,
        nickname: form.nickname,
        nombreCompleto: form.juego === "FC25" ? form.nombreCompleto : form.nickname,
      };

      if (form.juego === "FC25") {
        payload.documento = form.documento;
        payload.ficha = form.ficha;
        payload.programa = form.programa;
        payload.correo = form.correo;
        payload.telefono = form.telefono;
      } else {
        payload.jugador1Nombre = form.jugador1Nombre;
        payload.jugador2Nombre = form.jugador2Nombre;
        payload.ficha = form.ficha;
        payload.programa = form.programa;
        payload.correo = form.correo;
        payload.telefono = form.telefono;
        payload.nickEquipo = form.nickEquipo;
      }

      await crearInscripcion(payload);
      setExito(true);
      setForm(ESTADO_INICIAL);
    } catch (err: unknown) {
      if (err instanceof HttpError) {
        setError(err.message);
      } else {
        setError("Ocurrió un error inesperado. Intenta de nuevo.");
      }
    } finally {
      setEnviando(false);
    }
  }

  const hayJuegoAbierto =
    estado === null || estado.FC25.abierta || estado.COD_BO2.abierta;

  return (
    <section
      id="inscripcion"
      className="py-20 px-4 wide:px-10 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #0d120d 100%)" }}
    >
      {/* Background decorations */}
      <div
        className="absolute top-0 left-0 w-72 h-72 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: "#00c853" }}
      />
      <div
        className="absolute bottom-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: "#ff6d00" }}
      />

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="text-xs tracking-widest uppercase font-bold text-green-400 mb-3 block">
            📋 Registro oficial
          </span>
          <h2
            className="text-4xl md:text-5xl font-black mb-4"
            style={{
              background: "linear-gradient(135deg, #ffffff, #00c853)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Inscríbete al torneo
          </h2>
          <p className="text-gray-400 text-base max-w-md mx-auto">
            Completa el formulario para reservar tu cupo. Las inscripciones son
            gratuitas y están disponibles para todos los aprendices del SENA.
          </p>
        </div>

        {/* Form card */}
        <div
          className="rounded-2xl border p-8 md:p-10"
          style={{
            borderColor: "rgba(0,200,83,0.2)",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(0,200,83,0.03) 100%)",
            backdropFilter: "blur(12px)",
          }}
        >
          {exito ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-black text-white mb-2">
                ¡Inscripción exitosa!
              </h3>
              <p className="text-gray-400 mb-6">
                Tu cupo ha sido registrado. Estaremos comunicándonos contigo
                por los medios del SENA con los detalles del torneo.
              </p>
              <button
                type="button"
                id="inscripcion-nueva-btn"
                onClick={(): void => setExito(false)}
                className="px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105"
                style={{ background: "#00c853", color: "#000" }}
              >
                Registrar otro participante
              </button>
            </div>
          ) : !hayJuegoAbierto ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Inscripciones cerradas
              </h3>
              <p className="text-gray-400 text-sm">
                Las inscripciones para todos los juegos están cerradas
                temporalmente. Sigue las redes del SENA para más información.
              </p>
            </div>
          ) : (
            <form id="landing-inscripcion-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Game selection */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-300">
                  Juego en el que quieres competir
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {GAME_OPTIONS.map((option) => {
                    const isOpen = estado === null || estado[option.value].abierta;
                    const isSelected = form.juego === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        id={`game-select-${option.value}`}
                        disabled={!isOpen}
                        onClick={(): void => {
                          if (isOpen) {
                            setForm({ ...ESTADO_INICIAL, juego: option.value });
                          }
                        }}
                        className="rounded-xl p-4 text-left transition-all duration-300 border disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02]"
                        style={{
                          borderColor: isSelected
                            ? option.color
                            : "rgba(255,255,255,0.12)",
                          background: isSelected
                            ? `${option.color}15`
                            : "rgba(255,255,255,0.04)",
                          boxShadow: isSelected
                            ? `0 0 20px ${option.color}30`
                            : "none",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{option.icon}</span>
                          <div>
                            <div
                              className="text-sm font-bold"
                              style={{ color: isSelected ? option.color : "#fff" }}
                            >
                              {option.label}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {isOpen ? "Inscripciones abiertas" : "Inscripciones cerradas"}
                            </div>
                          </div>
                          {isSelected && (
                            <span
                              className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{ background: option.color, color: "#000" }}
                            >
                              ✓
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* HINT if no game selected */}
              {form.juego === "" && (
                <div className="text-center py-6 border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                  <p className="text-text-secondary text-sm">
                    Selecciona un juego arriba para completar el formulario.
                  </p>
                </div>
              )}

              {/* FC25 Fields */}
              {form.juego === "FC25" && (
                <>
                  {/* Nombre completo */}
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="inscripcion-nombre"
                      className="text-sm font-semibold text-gray-300"
                    >
                      Nombre completo
                    </label>
                    <input
                      id="inscripcion-nombre"
                      type="text"
                      placeholder="Ej: Juan Carlos Pérez"
                      className="rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-300"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                      value={form.nombreCompleto}
                      onChange={(e): void =>
                        setForm({ ...form, nombreCompleto: e.target.value })
                      }
                      onFocus={(e): void => {
                        e.currentTarget.style.borderColor = "#00c853";
                        e.currentTarget.style.boxShadow = "0 0 0 2px rgba(0,200,83,0.15)";
                      }}
                      onBlur={(e): void => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                  </div>

                  {/* Documento */}
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="inscripcion-documento"
                      className="text-sm font-semibold text-gray-300"
                    >
                      Número de documento
                    </label>
                    <input
                      id="inscripcion-documento"
                      type="text"
                      placeholder="Ej: 1012345678"
                      className="rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-300"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                      value={form.documento}
                      onChange={(e): void =>
                        setForm({ ...form, documento: e.target.value })
                      }
                      onFocus={(e): void => {
                        e.currentTarget.style.borderColor = "#00c853";
                        e.currentTarget.style.boxShadow = "0 0 0 2px rgba(0,200,83,0.15)";
                      }}
                      onBlur={(e): void => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                  </div>

                  {/* Ficha y Programa */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="inscripcion-ficha-fc25" className="text-sm font-semibold text-gray-300">
                        Ficha
                      </label>
                      <input
                        id="inscripcion-ficha-fc25"
                        type="text"
                        placeholder="Ej: 2711234"
                        className="rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-300"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.12)",
                        }}
                        value={form.ficha}
                        onChange={(e): void => setForm({ ...form, ficha: e.target.value })}
                        onFocus={(e): void => {
                          e.currentTarget.style.borderColor = "#00c853";
                          e.currentTarget.style.boxShadow = "0 0 0 2px rgba(0,200,83,0.15)";
                        }}
                        onBlur={(e): void => {
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="inscripcion-programa-fc25" className="text-sm font-semibold text-gray-300">
                        Programa
                      </label>
                      <input
                        id="inscripcion-programa-fc25"
                        type="text"
                        placeholder="Ej: ADSO"
                        className="rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-300"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.12)",
                        }}
                        value={form.programa}
                        onChange={(e): void => setForm({ ...form, programa: e.target.value })}
                        onFocus={(e): void => {
                          e.currentTarget.style.borderColor = "#00c853";
                          e.currentTarget.style.boxShadow = "0 0 0 2px rgba(0,200,83,0.15)";
                        }}
                        onBlur={(e): void => {
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                    </div>
                  </div>

                  {/* Correo */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="inscripcion-correo-fc25" className="text-sm font-semibold text-gray-300">
                      Correo electrónico
                    </label>
                    <input
                      id="inscripcion-correo-fc25"
                      type="email"
                      placeholder="Ej: estudiante@sena.edu.co"
                      className="rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-300"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                      value={form.correo}
                      onChange={(e): void => setForm({ ...form, correo: e.target.value })}
                      onFocus={(e): void => {
                        e.currentTarget.style.borderColor = "#00c853";
                        e.currentTarget.style.boxShadow = "0 0 0 2px rgba(0,200,83,0.15)";
                      }}
                      onBlur={(e): void => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                  </div>

                  {/* Teléfono */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="inscripcion-telefono-fc25" className="text-sm font-semibold text-gray-300">
                      Teléfono / WhatsApp
                    </label>
                    <input
                      id="inscripcion-telefono-fc25"
                      type="tel"
                      placeholder="Ej: 3123456789"
                      className="rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-300"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                      value={form.telefono}
                      onChange={(e): void => setForm({ ...form, telefono: e.target.value })}
                      onFocus={(e): void => {
                        e.currentTarget.style.borderColor = "#00c853";
                        e.currentTarget.style.boxShadow = "0 0 0 2px rgba(0,200,83,0.15)";
                      }}
                      onBlur={(e): void => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                  </div>

                </>
              )}

              {/* COD BO2 Fields (from requested spec form image) */}
              {form.juego === "COD_BO2" && (
                <>
                  <div className="border-t border-white/10 pt-4 flex flex-col gap-5">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-orange-500 flex items-center gap-2">
                      <span>🛡️</span> INFORMACIÓN DEL EQUIPO
                    </h4>

                    {/* Nombre del equipo */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="inscripcion-nombre-equipo" className="text-sm font-semibold text-gray-300">
                        Nombre del equipo
                      </label>
                      <input
                        id="inscripcion-nombre-equipo"
                        type="text"
                        placeholder="Ej: Los Insuperables"
                        className="rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-300"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.12)",
                        }}
                        value={form.nickname}
                        onChange={(e): void => setForm({ ...form, nickname: e.target.value })}
                        onFocus={(e): void => {
                          e.currentTarget.style.borderColor = "#ff6d00";
                          e.currentTarget.style.boxShadow = "0 0 0 2px rgba(255,109,0,0.15)";
                        }}
                        onBlur={(e): void => {
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                    </div>

                    {/* Jugador 1 */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="inscripcion-jugador1" className="text-sm font-semibold text-gray-300">
                        Jugador 1 (Nombre Completo)
                      </label>
                      <input
                        id="inscripcion-jugador1"
                        type="text"
                        placeholder="Ej: Carlos Mario Gomez"
                        className="rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-300"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.12)",
                        }}
                        value={form.jugador1Nombre}
                        onChange={(e): void => setForm({ ...form, jugador1Nombre: e.target.value })}
                        onFocus={(e): void => {
                          e.currentTarget.style.borderColor = "#ff6d00";
                          e.currentTarget.style.boxShadow = "0 0 0 2px rgba(255,109,0,0.15)";
                        }}
                        onBlur={(e): void => {
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                    </div>

                    {/* Jugador 2 */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="inscripcion-jugador2" className="text-sm font-semibold text-gray-300">
                        Jugador 2 (Nombre Completo)
                      </label>
                      <input
                        id="inscripcion-jugador2"
                        type="text"
                        placeholder="Ej: Andrés Felipe Pérez"
                        className="rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-300"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.12)",
                        }}
                        value={form.jugador2Nombre}
                        onChange={(e): void => setForm({ ...form, jugador2Nombre: e.target.value })}
                        onFocus={(e): void => {
                          e.currentTarget.style.borderColor = "#ff6d00";
                          e.currentTarget.style.boxShadow = "0 0 0 2px rgba(255,109,0,0.15)";
                        }}
                        onBlur={(e): void => {
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4 flex flex-col gap-5">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-orange-500 flex items-center gap-2">
                      <span>👤</span> INFORMACIÓN DEL REPRESENTANTE
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Ficha */}
                      <div className="flex flex-col gap-2">
                        <label htmlFor="inscripcion-ficha" className="text-sm font-semibold text-gray-300">
                          Ficha
                        </label>
                        <input
                          id="inscripcion-ficha"
                          type="text"
                          placeholder="Ej: 2711234"
                          className="rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-300"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.12)",
                          }}
                          value={form.ficha}
                          onChange={(e): void => setForm({ ...form, ficha: e.target.value })}
                          onFocus={(e): void => {
                            e.currentTarget.style.borderColor = "#ff6d00";
                            e.currentTarget.style.boxShadow = "0 0 0 2px rgba(255,109,0,0.15)";
                          }}
                          onBlur={(e): void => {
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        />
                      </div>

                      {/* Programa */}
                      <div className="flex flex-col gap-2">
                        <label htmlFor="inscripcion-programa" className="text-sm font-semibold text-gray-300">
                          Programa
                        </label>
                        <input
                          id="inscripcion-programa"
                          type="text"
                          placeholder="Ej: ADSO"
                          className="rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-300"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.12)",
                          }}
                          value={form.programa}
                          onChange={(e): void => setForm({ ...form, programa: e.target.value })}
                          onFocus={(e): void => {
                            e.currentTarget.style.borderColor = "#ff6d00";
                            e.currentTarget.style.boxShadow = "0 0 0 2px rgba(255,109,0,0.15)";
                          }}
                          onBlur={(e): void => {
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        />
                      </div>

                      {/* Correo */}
                      <div className="flex flex-col gap-2">
                        <label htmlFor="inscripcion-correo" className="text-sm font-semibold text-gray-300">
                          Correo electrónico
                        </label>
                        <input
                          id="inscripcion-correo"
                          type="email"
                          placeholder="Ej: representante@sena.edu.co"
                          className="rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-300"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.12)",
                          }}
                          value={form.correo}
                          onChange={(e): void => setForm({ ...form, correo: e.target.value })}
                          onFocus={(e): void => {
                            e.currentTarget.style.borderColor = "#ff6d00";
                            e.currentTarget.style.boxShadow = "0 0 0 2px rgba(255,109,0,0.15)";
                          }}
                          onBlur={(e): void => {
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        />
                      </div>

                      {/* Teléfono */}
                      <div className="flex flex-col gap-2">
                        <label htmlFor="inscripcion-telefono" className="text-sm font-semibold text-gray-300">
                          Teléfono / WhatsApp
                        </label>
                        <input
                          id="inscripcion-telefono"
                          type="tel"
                          placeholder="Ej: 3123456789"
                          className="rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-300"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.12)",
                          }}
                          value={form.telefono}
                          onChange={(e): void => setForm({ ...form, telefono: e.target.value })}
                          onFocus={(e): void => {
                            e.currentTarget.style.borderColor = "#ff6d00";
                            e.currentTarget.style.boxShadow = "0 0 0 2px rgba(255,109,0,0.15)";
                          }}
                          onBlur={(e): void => {
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        />
                      </div>
                    </div>

                    {/* Nick del equipo */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="inscripcion-nick-equipo" className="text-sm font-semibold text-gray-300">
                        Nick del equipo (opcional)
                      </label>
                      <input
                        id="inscripcion-nick-equipo"
                        type="text"
                        placeholder="Ej: Tag del equipo"
                        className="rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-300"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.12)",
                        }}
                        value={form.nickEquipo}
                        onChange={(e): void => setForm({ ...form, nickEquipo: e.target.value })}
                        onFocus={(e): void => {
                          e.currentTarget.style.borderColor = "#ff6d00";
                          e.currentTarget.style.boxShadow = "0 0 0 2px rgba(255,109,0,0.15)";
                        }}
                        onBlur={(e): void => {
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Error */}
              {error !== null && (
                <div
                  className="rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2"
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#f87171",
                  }}
                >
                  <span>⚠️</span> {error}
                </div>
              )}

              {/* Submit button */}
              {form.juego !== "" && (
                <button
                  id="inscripcion-submit-btn"
                  type="submit"
                  disabled={enviando}
                  className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    background: enviando
                      ? "#555"
                      : form.juego === "FC25"
                        ? "linear-gradient(135deg, #00c853, #00e676)"
                        : "linear-gradient(135deg, #ff6d00, #ff8f00)",
                    color: "#000",
                    boxShadow: enviando
                      ? "none"
                      : form.juego === "FC25"
                        ? "0 0 30px rgba(0,200,83,0.3)"
                        : "0 0 30px rgba(255,109,0,0.3)",
                  }}
                >
                  {enviando ? "⏳ Registrando..." : "🎮 Confirmar inscripción"}
                </button>
              )}

              <p className="text-center text-xs text-gray-600">
                Al inscribirte aceptas el reglamento oficial del torneo. Solo
                aprendices activos del SENA pueden participar.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default LandingInscripcionForm;
