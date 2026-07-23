import { useState, JSX } from "react";
import type { EstadoFaseGrupos, Grupo, PartidoGrupo } from "@shared/types/grupos";

interface GrupoCardProps {
  grupo: Grupo;
  juego: string;
  estadoFase: EstadoFaseGrupos;
  nombre: (id: string) => string;
  onPartidoClick?: (partido: PartidoGrupo) => void;
  mostrarPartidosSiempre?: boolean;
  partidoActivo?: PartidoGrupo | null;
  scoreA?: string;
  scoreB?: string;
  errorResultado?: string | null;
  guardandoResultado?: boolean;
  onScoreAChange?: (value: string) => void;
  onScoreBChange?: (value: string) => void;
  onGuardarResultado?: () => void;
  onCancelarResultado?: () => void;
  onMarcarWalkover?: () => void;
}

type Tab = "posiciones" | "partidos";

function resultadoDe(partido: PartidoGrupo, inscripcionId: string): "W" | "T" | "L" | null {
  if (partido.resolvedAt === null) return null;
  if (partido.winnerId === null) return "T";
  return partido.winnerId === inscripcionId ? "W" : "L";
}

const RESULTADO_ESTILO: Record<"W" | "T" | "L", string> = {
  W: "bg-blue-500 text-white",
  T: "bg-edge text-white",
  L: "bg-red-500 text-white",
};

function agruparPorRonda(partidos: PartidoGrupo[]): Array<{ ronda: number; partidos: PartidoGrupo[] }> {
  const mapa = new Map<number, PartidoGrupo[]>();
  partidos.forEach((p) => {
    const r = p.ronda ?? 0;
    if (!mapa.has(r)) mapa.set(r, []);
    mapa.get(r)!.push(p);
  });
  return [...mapa.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([ronda, partidos]) => ({ ronda, partidos }));
}

function GrupoCard({
  grupo,
  juego,
  estadoFase,
  nombre,
  onPartidoClick,
  mostrarPartidosSiempre = false,
  partidoActivo = null,
  scoreA = "",
  scoreB = "",
  errorResultado = null,
  guardandoResultado = false,
  onScoreAChange,
  onScoreBChange,
  onGuardarResultado,
  onCancelarResultado,
  onMarcarWalkover,
}: GrupoCardProps): JSX.Element {
  const [tab, setTab] = useState<Tab>("posiciones");
  const clasificadosCount = juego === "FC25" ? 2 : 1;
  const clickable = onPartidoClick !== undefined && estadoFase !== "FINALIZADA";
  const rondas = agruparPorRonda(grupo.partidos);
  const mostrarPosiciones = mostrarPartidosSiempre || tab === "posiciones";
  const mostrarPartidos = mostrarPartidosSiempre || tab === "partidos";
  const puedeEditarResultado: boolean =
    partidoActivo !== null &&
    onGuardarResultado !== undefined &&
    onScoreAChange !== undefined &&
    onScoreBChange !== undefined;

  function escudoClass(index: number): string {
    const colores: string[] = [
      "border-emerald-400 text-emerald-400",
      "border-yellow-400 text-yellow-400",
      "border-sky-400 text-sky-400",
      "border-violet-400 text-violet-400",
    ];
    return colores[index % colores.length];
  }

  function jugadorIndex(inscripcionId: string): number {
    const index = grupo.participantes.findIndex((p): boolean => p.inscripcionId === inscripcionId);
    return index === -1 ? 0 : index;
  }

  return (
    <div className="bg-bg-card border border-edge rounded-md overflow-hidden">
      {/* Header con tabs */}
      <div className="flex flex-col gap-3 border-b border-edge bg-white/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-bold text-white text-lg uppercase tracking-wide flex items-center gap-3">
          <span className="text-text-secondary text-base">::</span>
          {grupo.nombre}
        </h3>
        {mostrarPartidosSiempre ? (
          <span className="text-[10px] uppercase tracking-widest text-text-secondary">
            Posiciones y partidos
          </span>
        ) : (
          <div className="flex w-full rounded-md bg-white/5 p-1 sm:w-auto">
            <button
              type="button"
              onClick={() => setTab("posiciones")}
              className={`flex-1 rounded px-4 py-2 text-sm font-semibold transition-colors duration-200 sm:flex-none ${
                tab === "posiciones"
                  ? "bg-white/10 text-white"
                  : "text-text-secondary hover:text-white"
              }`}
            >
              Posiciones
            </button>
            <button
              type="button"
              onClick={() => setTab("partidos")}
              className={`flex-1 rounded px-4 py-2 text-sm font-semibold transition-colors duration-200 sm:flex-none ${
                tab === "partidos"
                  ? "bg-emerald-500/10 text-primary shadow-[inset_0_-2px_0_#00ff87]"
                  : "text-text-secondary hover:text-white"
              }`}
            >
              Partidos
            </button>
          </div>
        )}
      </div>

      {mostrarPosiciones && (
        <>
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
                      className="bg-bg-base border border-edge/60 rounded-lg p-2.5 flex flex-col gap-1.5"
                      style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,109,0,0.02) 100%)",
                      }}
                    >
                      <div className="border-b border-edge/40 pb-1">
                        <h4 className="text-orange-500 text-xs font-bold truncate tracking-wide">
                          {apodo}
                        </h4>
                      </div>
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
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-edge text-text-secondary">
                  <th className="text-left px-4 py-3 font-bold uppercase text-[11px] tracking-wide">Rango</th>
                  <th className="text-left px-3 py-3 font-bold uppercase text-[11px] tracking-wide">
                    {juego === "FC25" ? "Jugador" : "Equipo"}
                  </th>
                  <th className="px-3 py-3 font-bold uppercase text-[11px] tracking-wide">Partido G-P-E</th>
                  <th className="px-3 py-3 font-bold uppercase text-[11px] tracking-wide">DG</th>
                  <th className="px-3 py-3 font-bold uppercase text-[11px] tracking-wide text-primary">Pts</th>
                  <th className="px-3 py-3 font-bold uppercase text-[11px] tracking-wide">Historial del partido</th>
                </tr>
              </thead>
              <tbody>
                {grupo.participantes.map((p, idx) => {
                  const clasifica = idx < clasificadosCount && estadoFase !== "PENDIENTE";
                  const dg = p.gf - p.gc;
                  const historial = grupo.partidos
                    .filter((m) => m.jugadorAId === p.inscripcionId || m.jugadorBId === p.inscripcionId)
                    .map((m) => resultadoDe(m, p.inscripcionId))
                    .filter((r): r is "W" | "T" | "L" => r !== null)
                    .slice(-3);
                  return (
                    <tr
                      key={p.id}
                      className={`border-b border-edge/40 ${
                        idx % 2 === 0 ? "bg-white/[0.02]" : ""
                      } ${clasifica ? "bg-emerald-900/10" : ""}`}
                    >
                      <td className="px-4 py-3 text-text-secondary font-semibold">
                        {clasifica ? <span className="text-emerald-400">{idx + 1}</span> : idx + 1}
                      </td>
                      <td className="px-3 py-3 text-white font-semibold">
                        <span className="truncate block max-w-[140px]">
                          {p.nombreCompleto ?? nombre(p.inscripcionId)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center text-text-secondary font-mono">
                        {p.pg} - {p.pp} - {p.pe}
                      </td>
                      <td className="px-3 py-3 text-center text-text-secondary">
                        {dg >= 0 ? `+${dg}` : dg}
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-white">{p.puntos}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {historial.length === 0 ? (
                            <span className="text-text-secondary">—</span>
                          ) : (
                            historial.map((r, i) => (
                              <span
                                key={i}
                                className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${RESULTADO_ESTILO[r]}`}
                              >
                                {r}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {mostrarPartidos && (
        <div className={`p-4 sm:p-6 ${mostrarPartidosSiempre ? "border-t border-edge" : ""}`}>
          {mostrarPartidosSiempre && (
            <p className="text-[10px] uppercase tracking-widest text-text-secondary font-bold mb-3">
              Partidos del grupo
            </p>
          )}
          <div className="grid gap-6 md:grid-cols-3">
            {rondas.map(({ ronda, partidos }) => (
              <div key={ronda} className="flex flex-col gap-3">
                <p className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-primary font-bold">
                  <span className="h-px flex-1 bg-primary/30" />
                  Ronda {ronda}
                  <span className="h-px flex-1 bg-primary/30" />
                </p>
                {partidos.map((partido) => {
                  const resuelto = partido.resolvedAt !== null;
                  const activo = partidoActivo?.id === partido.id;
                  return (
                    <button
                      key={partido.id}
                      type="button"
                      disabled={!clickable}
                      onClick={() => clickable && onPartidoClick?.(partido)}
                      className={`relative flex min-h-[66px] items-center gap-3 rounded-md border px-3 py-3 text-left text-sm transition-colors duration-200 ${
                        activo
                          ? "border-primary bg-primary/10 shadow-[0_0_0_1px_rgba(0,255,135,0.25)]"
                          : resuelto
                            ? "border-edge bg-white/5"
                            : "border-edge bg-white/[0.03]"
                      } ${clickable ? "cursor-pointer hover:border-primary/50 hover:bg-white/10" : "cursor-default"}`}
                    >
                      <span className={`h-5 w-5 shrink-0 rounded border-2 ${escudoClass(jugadorIndex(partido.jugadorAId))}`} />
                      <span
                        className={`min-w-0 flex-1 truncate ${
                          resuelto && partido.winnerId === partido.jugadorAId
                            ? "text-emerald-300 font-semibold"
                            : "text-white"
                        }`}
                      >
                        {nombre(partido.jugadorAId)}
                      </span>
                      <span className="shrink-0 text-[10px] uppercase tracking-widest text-text-secondary">
                        {resuelto ? `${partido.scoreA} - ${partido.scoreB}` : "vs"}
                      </span>
                      <span
                        className={`min-w-0 flex-1 truncate text-right ${
                          resuelto && partido.winnerId === partido.jugadorBId
                            ? "text-emerald-300 font-semibold"
                            : "text-white"
                        }`}
                      >
                        {nombre(partido.jugadorBId)}
                      </span>
                      <span className={`h-5 w-5 shrink-0 rounded border-2 ${escudoClass(jugadorIndex(partido.jugadorBId))}`} />
                      {clickable && (
                        <span className="ml-1 flex h-8 w-10 shrink-0 items-center justify-center rounded bg-white/10 text-[10px] font-bold uppercase text-white">
                          Edit
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {puedeEditarResultado && partidoActivo !== null && (
            <div className="relative mt-7 rounded-md border border-primary bg-black/30 px-5 py-5 shadow-[0_0_30px_rgba(0,255,135,0.08)] sm:px-7">
              <div className="absolute -top-4 left-1/4 h-7 w-7 rotate-45 border-l border-t border-primary bg-bg-card" />
              <div className="relative flex items-center justify-between gap-4 border-b border-edge pb-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="rounded border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                    Ronda {partidoActivo.ronda ?? 0}
                  </span>
                  <h4 className="truncate text-sm font-bold text-white sm:text-base">
                    {nombre(partidoActivo.jugadorAId)} vs {nombre(partidoActivo.jugadorBId)}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={onCancelarResultado}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white/10 text-xl text-white transition-colors duration-200 hover:bg-white/15"
                >
                  x
                </button>
              </div>

              <div className="grid items-center gap-5 py-8 md:grid-cols-[1fr_auto_1fr]">
                <div className="flex items-center justify-center gap-3 md:justify-start">
                  <span className={`h-9 w-9 rounded border-4 ${escudoClass(jugadorIndex(partidoActivo.jugadorAId))}`} />
                  <span className="min-w-0 truncate text-lg font-bold text-white">
                    {nombre(partidoActivo.jugadorAId)}
                  </span>
                </div>

                <div className="grid grid-cols-[minmax(88px,128px)_auto_minmax(88px,128px)] items-center gap-5">
                  <input
                    type="number"
                    min={0}
                    value={scoreA}
                    onChange={(e): void => onScoreAChange?.(e.target.value)}
                    className="h-20 rounded-md border border-edge bg-black/30 text-center text-5xl font-black text-white outline-none transition-colors duration-200 focus:border-primary"
                    placeholder="0"
                  />
                  <span className="text-3xl font-black uppercase text-text-secondary">vs</span>
                  <input
                    type="number"
                    min={0}
                    value={scoreB}
                    onChange={(e): void => onScoreBChange?.(e.target.value)}
                    className="h-20 rounded-md border border-edge bg-black/30 text-center text-5xl font-black text-white outline-none transition-colors duration-200 focus:border-primary"
                    placeholder="0"
                  />
                </div>

                <div className="flex items-center justify-center gap-3 md:justify-end">
                  <span className="min-w-0 truncate text-lg font-bold text-white">
                    {nombre(partidoActivo.jugadorBId)}
                  </span>
                  <span className={`h-9 w-9 rounded border-4 ${escudoClass(jugadorIndex(partidoActivo.jugadorBId))}`} />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={onMarcarWalkover}
                  className="rounded-md border border-edge bg-white/5 px-5 py-2 text-sm font-bold text-white transition-colors duration-200 hover:border-primary/50 hover:bg-white/10"
                >
                  Marcar como WO
                </button>
              </div>

              {errorResultado !== null && (
                <p className="mt-5 rounded border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-400">
                  {errorResultado}
                </p>
              )}

              <div className="mt-8 flex flex-col gap-3 border-t border-edge pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onCancelarResultado}
                  className="rounded-md border border-edge bg-white/5 px-8 py-3 text-sm font-bold text-white transition-colors duration-200 hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={onGuardarResultado}
                  disabled={guardandoResultado}
                  className="rounded-md bg-primary px-8 py-3 text-sm font-bold text-black transition-colors duration-200 hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Guardar resultado
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GrupoCard;
