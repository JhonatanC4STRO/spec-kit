import { useState, JSX } from "react";
import type { EstadoFaseGrupos, Grupo, PartidoGrupo } from "@shared/types/grupos";

interface GrupoCardProps {
  grupo: Grupo;
  juego: string;
  estadoFase: EstadoFaseGrupos;
  nombre: (id: string) => string;
  onPartidoClick?: (partido: PartidoGrupo) => void;
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

function GrupoCard({ grupo, juego, estadoFase, nombre, onPartidoClick }: GrupoCardProps): JSX.Element {
  const [tab, setTab] = useState<Tab>("posiciones");
  const clasificadosCount = juego === "FC25" ? 2 : 1;
  const clickable = onPartidoClick !== undefined && estadoFase !== "FINALIZADA";
  const rondas = agruparPorRonda(grupo.partidos);

  return (
    <div className="bg-bg-card border border-edge rounded-xl overflow-hidden">
      {/* Header con tabs */}
      <div className="flex items-center justify-between border-b border-edge bg-white/5 px-4">
        <h3 className="font-bold text-white text-sm uppercase tracking-wider py-3">
          {grupo.nombre}
        </h3>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setTab("posiciones")}
            className={`text-xs font-semibold py-3 border-b-2 transition-colors duration-200 ${
              tab === "posiciones"
                ? "text-primary border-primary"
                : "text-text-secondary border-transparent hover:text-white"
            }`}
          >
            Posiciones
          </button>
          <button
            type="button"
            onClick={() => setTab("partidos")}
            className={`text-xs font-semibold py-3 border-b-2 transition-colors duration-200 ${
              tab === "partidos"
                ? "text-primary border-primary"
                : "text-text-secondary border-transparent hover:text-white"
            }`}
          >
            Partidos
          </button>
        </div>
      </div>

      {tab === "posiciones" && (
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

      {tab === "partidos" && (
        <div className="p-4 overflow-x-auto">
          <div className="flex gap-4 min-w-max">
            {rondas.map(({ ronda, partidos }) => (
              <div key={ronda} className="flex flex-col gap-2 w-48">
                <p className="text-[10px] uppercase tracking-widest text-text-secondary font-bold text-center">
                  Ronda {ronda}
                </p>
                {partidos.map((partido) => {
                  const resuelto = partido.resolvedAt !== null;
                  return (
                    <button
                      key={partido.id}
                      type="button"
                      disabled={!clickable}
                      onClick={() => clickable && onPartidoClick?.(partido)}
                      className={`flex flex-col rounded-lg border text-xs overflow-hidden text-left ${
                        resuelto ? "border-edge bg-white/5" : "border-primary/30 bg-primary/5"
                      } ${clickable ? "cursor-pointer hover:bg-white/10" : "cursor-default"}`}
                    >
                      <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 border-b border-edge/40">
                        <span
                          className={`truncate ${
                            resuelto && partido.winnerId === partido.jugadorAId
                              ? "text-emerald-300 font-semibold"
                              : "text-white"
                          }`}
                        >
                          {nombre(partido.jugadorAId)}
                        </span>
                        <span className="font-mono font-bold text-white shrink-0">
                          {resuelto ? partido.scoreA : "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 px-2.5 py-1.5">
                        <span
                          className={`truncate ${
                            resuelto && partido.winnerId === partido.jugadorBId
                              ? "text-emerald-300 font-semibold"
                              : "text-white"
                          }`}
                        >
                          {nombre(partido.jugadorBId)}
                        </span>
                        <span className="font-mono font-bold text-white shrink-0">
                          {resuelto ? partido.scoreB : "-"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default GrupoCard;
