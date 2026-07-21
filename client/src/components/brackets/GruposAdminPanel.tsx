import { useState, useEffect, useCallback, JSX } from "react";
import {
  getFaseGrupos,
  generarFaseGrupos,
  cerrarFaseGrupos,
  reiniciarFaseGrupos,
  registrarResultadoGrupo,
} from "../../services/grupos";
import { getJugadoresPublico } from "../../services/inscripciones";
import { HttpError } from "../../services/http";
import type { FaseGruposConGrupos, PartidoGrupo } from "@shared/types/grupos";
import type { Juego } from "@shared/types/inscripcion";
import { esCantidadValida, cantidadesValidas } from "../../utils/torneo";
import GrupoCard from "./GrupoCard";

interface GruposAdminPanelProps {
  juego: string;
  token: string;
  onFaseCerrada: () => void; // callback para que el panel padre recargue el bracket
}

interface PartidoModal {
  partido: PartidoGrupo;
  nombreA: string;
  nombreB: string;
}

function GruposAdminPanel({ juego, token, onFaseCerrada }: GruposAdminPanelProps): JSX.Element {
  const [fase, setFase] = useState<FaseGruposConGrupos | null | undefined>(undefined);
  const [nombrePorId, setNombrePorId] = useState<Record<string, string>>({});
  const [modal, setModal] = useState<PartidoModal | null>(null);
  const [scoreA, setScoreA] = useState<string>("");
  const [scoreB, setScoreB] = useState<string>("");
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState<"reiniciar" | "cerrar" | null>(null);
  const [inscritos, setInscritos] = useState<number>(0);

  const cantidadOk: boolean = esCantidadValida(juego as Juego, inscritos);

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
        setInscritos(lista.filter((j) => j.juego === juego).length);
      })
      .catch(() => undefined);
  }, [juego]);

  function nombre(id: string): string {
    return nombrePorId[id] ?? id.slice(0, 8) + "…";
  }

  function abrirModal(partido: PartidoGrupo): void {
    setModal({
      partido,
      nombreA: nombre(partido.jugadorAId),
      nombreB: nombre(partido.jugadorBId),
    });
    setScoreA(partido.scoreA !== null ? String(partido.scoreA) : "");
    setScoreB(partido.scoreB !== null ? String(partido.scoreB) : "");
  }

  async function handleRegistrarResultado(): Promise<void> {
    if (!modal) return;
    const sA = parseInt(scoreA, 10);
    const sB = parseInt(scoreB, 10);
    if (isNaN(sA) || isNaN(sB) || sA < 0 || sB < 0) {
      setError("Introduce marcadores válidos (≥ 0)");
      return;
    }
    setCargando(true);
    setError(null);
    try {
      const nuevaFase = await registrarResultadoGrupo(modal.partido.id, { scoreA: sA, scoreB: sB }, token);
      setFase(nuevaFase);
      setModal(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error registrando resultado");
    } finally {
      setCargando(false);
    }
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
              disabled={cargando || !cantidadOk}
              title={
                cantidadOk
                  ? undefined
                  : `Se necesitan ${cantidadesValidas(juego as Juego).join(", ")} inscritos (hay ${inscritos})`
              }
              className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-black hover:bg-primary/80 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
            </>
          )}
          {fase && (
            <>
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
          {cantidadOk ? (
            <p className="text-xs mt-1">Cierra las inscripciones y haz clic en "Generar grupos".</p>
          ) : (
            <p className="text-xs mt-1 text-amber-400">
              Hay {inscritos} inscrito{inscritos === 1 ? "" : "s"}. Solo se puede generar con{" "}
              {cantidadesValidas(juego as Juego).join(", ")} jugadores.
            </p>
          )}
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
            <GrupoCard
              key={grupo.id}
              grupo={grupo}
              juego={juego}
              estadoFase={fase.estado}
              nombre={nombre}
              onPartidoClick={abrirModal}
            />
          ))}
        </div>
      )}

      {/* Modal de resultado */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-card border border-edge rounded-xl p-6 w-full max-w-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm uppercase tracking-wide">
                Registrar resultado
              </h3>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="text-text-secondary hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Jugador A */}
              <div className="flex-1 text-center">
                <p className="text-white text-xs font-semibold truncate">{modal.nombreA}</p>
                <input
                  type="number"
                  min={0}
                  value={scoreA}
                  onChange={(e) => setScoreA(e.target.value)}
                  className="mt-2 w-full text-center text-2xl font-black bg-bg-base border border-edge rounded-lg py-2 text-white focus:border-primary outline-none"
                  placeholder="0"
                />
              </div>

              <span className="text-text-secondary font-bold text-lg shrink-0">vs</span>

              {/* Jugador B */}
              <div className="flex-1 text-center">
                <p className="text-white text-xs font-semibold truncate">{modal.nombreB}</p>
                <input
                  type="number"
                  min={0}
                  value={scoreB}
                  onChange={(e) => setScoreB(e.target.value)}
                  className="mt-2 w-full text-center text-2xl font-black bg-bg-base border border-edge rounded-lg py-2 text-white focus:border-primary outline-none"
                  placeholder="0"
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button
              type="button"
              onClick={handleRegistrarResultado}
              disabled={cargando}
              className="w-full py-3 rounded-lg font-bold text-sm bg-primary text-black hover:bg-primary/80 transition-colors disabled:opacity-50"
            >
              {cargando ? "Guardando…" : "Guardar resultado"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GruposAdminPanel;
