import { useState, useEffect, useCallback, JSX } from "react";
import {
  getFaseGrupos,
  generarFaseGrupos,
  cerrarFaseGrupos,
  reiniciarFaseGrupos,
} from "../../services/grupos";
import { getJugadoresPublico } from "../../services/inscripciones";
import { HttpError } from "../../services/http";
import type { FaseGruposConGrupos } from "@shared/types/grupos";

interface GruposAdminPanelProps {
  juego: string;
  token: string;
  onFaseCerrada: () => void; // callback para que el panel padre recargue el bracket
}

function GruposAdminPanel({ juego, token, onFaseCerrada }: GruposAdminPanelProps): JSX.Element {
  const [fase, setFase] = useState<FaseGruposConGrupos | null | undefined>(undefined);
  const [nombrePorId, setNombrePorId] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState<"reiniciar" | "cerrar" | null>(null);

  const cargar = useCallback((): void => {
    getFaseGrupos(juego)
      .then((f) => setFase(f))
      .catch((e: unknown) => {
        if (e instanceof HttpError && e.status === 404) setFase(null);
      });
  }, [juego]);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    getJugadoresPublico()
      .then((lista) => {
        const m: Record<string, string> = {};
        lista.forEach((j) => { m[j.id] = j.nombreCompleto; });
        setNombrePorId(m);
      })
      .catch(() => undefined);
  }, []);

  function nombre(id: string): string {
    return nombrePorId[id] ?? id.slice(0, 8) + "…";
  }

  async function handleGenerar(): Promise<void> {
    setCargando(true);
    setError(null);
    try {
      await generarFaseGrupos(juego, token);
      cargar();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error generando grupos");
    } finally {
      setCargando(false);
    }
  }

  async function handleCerrar(): Promise<void> {
    setCargando(true);
    setError(null);
    try {
      await cerrarFaseGrupos(juego, token);
      onFaseCerrada();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error cerrando fase");
    } finally {
      setCargando(false);
      setConfirmando(null);
    }
  }

  async function handleReiniciar(): Promise<void> {
    setCargando(true);
    setError(null);
    try {
      await reiniciarFaseGrupos(juego, token);
      setFase(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error reiniciando grupos");
    } finally {
      setCargando(false);
      setConfirmando(null);
    }
  }


  // ─── Render ────────────────────────────────────────────────────────────────

  const estadoBadge =
    fase?.estado === "PENDIENTE"
      ? { text: "Pendiente", cls: "text-amber-400 bg-amber-400/10 border-amber-400/30" }
      : fase?.estado === "EN_CURSO"
        ? { text: "En curso", cls: "text-blue-400 bg-blue-400/10 border-blue-400/30" }
        : { text: "Finalizada", cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30" };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold uppercase tracking-wide text-white">
            Fase de Grupos
          </h2>
          {fase && (
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded border font-semibold ${estadoBadge.cls}`}>
              {estadoBadge.text}
            </span>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-2 flex-wrap">
          {fase == null && (
            <button
              type="button"
              onClick={handleGenerar}
              disabled={cargando}
              className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-black hover:bg-primary/80 transition-colors duration-200 disabled:opacity-50"
            >
              {cargando ? "Generando…" : "⚡ Generar grupos"}
            </button>
          )}
          {fase && fase.estado !== "FINALIZADA" && (
            <>
              {confirmando === "cerrar" ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCerrar}
                    disabled={cargando}
                    className="px-4 py-2 rounded-lg text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmando(null)}
                    className="px-4 py-2 rounded-lg text-sm font-bold bg-edge text-white hover:bg-white/10 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmando("cerrar")}
                  disabled={cargando}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-emerald-900/40 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/60 transition-colors duration-200 disabled:opacity-50"
                >
                  🏁 Cerrar fase y generar bracket
                </button>
              )}
              {confirmando === "reiniciar" ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleReiniciar}
                    disabled={cargando}
                    className="px-4 py-2 rounded-lg text-sm font-bold bg-red-600 text-white hover:bg-red-500 transition-colors"
                  >
                    Confirmar reinicio
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmando(null)}
                    className="px-4 py-2 rounded-lg text-sm font-bold bg-edge text-white hover:bg-white/10 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmando("reiniciar")}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-red-900/30 border border-red-500/30 text-red-400 hover:bg-red-900/50 transition-colors"
                >
                  ↩ Reiniciar grupos
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded px-3 py-2">
          {error}
        </p>
      )}

      {/* Sin fase todavía */}
      {fase === null && (
        <div className="bg-bg-card border border-edge rounded-xl p-6 text-center text-text-secondary">
          <p>No se ha generado la fase de grupos.</p>
          <p className="text-xs mt-1">Cierra las inscripciones y haz clic en "Generar grupos".</p>
        </div>
      )}

      {/* Cargando */}
      {fase === undefined && (
        <p className="text-text-secondary animate-pulse text-sm">Cargando…</p>
      )}

      {/* Grupos */}
      {fase && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {fase.grupos.map((grupo) => (
            <div key={grupo.id} className="bg-bg-card border border-edge rounded-xl overflow-hidden">
              {/* Nombre del grupo */}
              <div className="px-4 py-3 border-b border-edge bg-white/5">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                  {grupo.nombre}
                </h3>
              </div>

              {/* Equipos (solo para COD_BO2) */}
              {juego === "COD_BO2" && (
                <div className="px-4 pt-4">
                  <p className="text-[10px] uppercase tracking-widest text-text-secondary mb-2 font-bold">
                    Equipos del Grupo
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                    {grupo.participantes.map((p) => {
                      const apodo = p.nickEquipo ? `${p.nombreCompleto} (${p.nickEquipo})` : p.nombreCompleto;
                      return (
                        <div
                          key={p.id}
                          className="bg-bg-base border border-edge/60 rounded-lg p-2.5 flex flex-col gap-1.5 relative overflow-hidden"
                          style={{
                            background: "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,109,0,0.02) 100%)",
                          }}
                        >
                          {/* Head of the card: Team Apodo */}
                          <div className="border-b border-edge/40 pb-1">
                            <h4 className="text-white text-xs font-bold truncate tracking-wide text-orange-500">
                              {apodo}
                            </h4>
                          </div>
                          {/* Body of the card: Player names */}
                          <div className="flex flex-col gap-0.5 text-[11px] text-text-secondary">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="text-[10px]">👤</span>
                              <span className="truncate">{p.jugador1Nombre || "Jugador 1"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="text-[10px]">👤</span>
                              <span className="truncate">{p.jugador2Nombre || "Jugador 2"}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tabla de posiciones */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-edge text-text-secondary">
                      <th className="text-left px-4 py-2 font-medium">{juego === "FC25" ? "Jugador" : "Equipo"}</th>
                      <th className="px-2 py-2 font-medium">PJ</th>
                      <th className="px-2 py-2 font-medium">PG</th>
                      <th className="px-2 py-2 font-medium">PE</th>
                      <th className="px-2 py-2 font-medium">PP</th>
                      <th className="px-2 py-2 font-medium">GF</th>
                      <th className="px-2 py-2 font-medium">GC</th>
                      <th className="px-2 py-2 font-medium">DG</th>
                      <th className="px-2 py-2 font-medium text-primary">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grupo.participantes.map((p, idx) => {
                      const clasificadosCount = juego === "FC25" ? 2 : 1;
                      const clasifica = idx < clasificadosCount && fase.estado !== "PENDIENTE";
                      return (
                        <tr
                          key={p.id}
                          className={`border-b border-edge/50 ${
                            clasifica ? "bg-emerald-900/10" : ""
                          }`}
                        >
                          <td className="px-4 py-2 text-white font-medium flex items-center gap-2">
                            {clasifica && (
                              <span className="text-emerald-400 text-[10px]">✓</span>
                            )}
                            <span className="truncate max-w-[120px]">
                              {p.nombreCompleto ?? nombre(p.inscripcionId)}
                            </span>
                          </td>
                        <td className="px-2 py-2 text-center text-text-secondary">{p.pj}</td>
                        <td className="px-2 py-2 text-center text-emerald-400">{p.pg}</td>
                        <td className="px-2 py-2 text-center text-text-secondary">{p.pe}</td>
                        <td className="px-2 py-2 text-center text-red-400">{p.pp}</td>
                        <td className="px-2 py-2 text-center text-text-secondary">{p.gf}</td>
                        <td className="px-2 py-2 text-center text-text-secondary">{p.gc}</td>
                        <td className="px-2 py-2 text-center text-text-secondary">
                          {p.gf - p.gc >= 0 ? `+${p.gf - p.gc}` : p.gf - p.gc}
                        </td>
                        <td className="px-2 py-2 text-center font-bold text-white">{p.puntos}</td>
                      </tr>
                    );
                  })}
                </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GruposAdminPanel;
