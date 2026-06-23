import { JSX } from "react";
import type { FaseGruposConGrupos } from "@shared/types/grupos";

interface GruposPublicoViewProps {
  fase: FaseGruposConGrupos;
  nombrePorId: Record<string, string>;
}

function GruposPublicoView({ fase, nombrePorId }: GruposPublicoViewProps): JSX.Element {
  function nombre(id: string): string {
    return nombrePorId[id] ?? id.slice(0, 8) + "…";
  }

  const estadoBadge =
    fase.estado === "PENDIENTE"
      ? { text: "Pendiente", cls: "text-amber-400 border-amber-400/40 bg-amber-400/10" }
      : fase.estado === "EN_CURSO"
        ? { text: "En curso", cls: "text-blue-400 border-blue-400/40 bg-blue-400/10" }
        : { text: "Finalizada ✓", cls: "text-emerald-400 border-emerald-400/40 bg-emerald-400/10" };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-bold uppercase tracking-wide text-white">
          Fase de Grupos
        </h2>
        <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${estadoBadge.cls}`}>
          {estadoBadge.text}
        </span>
      </div>

      {/* Grid de grupos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fase.grupos.map((grupo) => (
          <div key={grupo.id} className="bg-bg-card border border-edge rounded-xl overflow-hidden">
            {/* Nombre del grupo */}
            <div className="px-4 py-2.5 border-b border-edge bg-white/5">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                {grupo.nombre}
              </h3>
            </div>

            {/* Equipos (solo para COD_BO2) */}
            {fase.juego === "COD_BO2" && (
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
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-edge text-text-secondary">
                    <th className="text-left px-3 py-2 font-medium">#</th>
                    <th className="text-left px-2 py-2 font-medium">{fase.juego === "FC25" ? "Jugador" : "Equipo"}</th>
                    <th className="px-2 py-2 font-medium">PJ</th>
                    <th className="px-2 py-2 font-medium">PG</th>
                    <th className="px-2 py-2 font-medium">PE</th>
                    <th className="px-2 py-2 font-medium">PP</th>
                    <th className="px-2 py-2 font-medium">DG</th>
                    <th className="px-2 py-2 font-medium text-primary font-bold">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {grupo.participantes.map((p, idx) => {
                    const clasificadosCount = fase.juego === "FC25" ? 2 : 1;
                    const clasifica = idx < clasificadosCount && fase.estado !== "PENDIENTE";
                    return (
                      <tr
                        key={p.id}
                        className={`border-b border-edge/40 ${clasifica ? "bg-emerald-900/10" : ""}`}
                      >
                        <td className="px-3 py-2 text-text-secondary">
                          {clasifica ? (
                            <span className="text-emerald-400 font-bold">{idx + 1}</span>
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-white font-medium">
                          <span className="truncate block max-w-[100px] sm:max-w-none">
                            {p.nombreCompleto ?? nombre(p.inscripcionId)}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-center text-text-secondary">{p.pj}</td>
                        <td className="px-2 py-2 text-center text-emerald-400">{p.pg}</td>
                        <td className="px-2 py-2 text-center text-text-secondary">{p.pe}</td>
                        <td className="px-2 py-2 text-center text-red-400">{p.pp}</td>
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

            {/* Partidos */}
            <div className="px-3 py-3 border-t border-edge">
              <p className="text-[9px] uppercase tracking-widest text-text-secondary mb-2">
                Resultados
              </p>
              <div className="flex flex-col gap-1">
                {grupo.partidos.map((partido) => {
                  const resuelto = partido.resolvedAt !== null;
                  const nombreA = nombre(partido.jugadorAId);
                  const nombreB = nombre(partido.jugadorBId);
                  return (
                    <div
                      key={partido.id}
                      className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded text-[11px] border ${
                        resuelto ? "border-edge bg-white/3" : "border-edge/30 text-text-secondary"
                      }`}
                    >
                      <span
                        className={`truncate flex-1 ${
                          resuelto && partido.winnerId === partido.jugadorAId
                            ? "text-emerald-300 font-semibold"
                            : "text-white"
                        }`}
                      >
                        {nombreA}
                      </span>
                      <span className="font-mono font-bold text-white shrink-0">
                        {resuelto ? `${partido.scoreA} - ${partido.scoreB}` : "vs"}
                      </span>
                      <span
                        className={`truncate flex-1 text-right ${
                          resuelto && partido.winnerId === partido.jugadorBId
                            ? "text-emerald-300 font-semibold"
                            : "text-white"
                        }`}
                      >
                        {nombreB}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Nota de clasificación */}
      {fase.estado !== "PENDIENTE" && (
        <p className="text-[10px] text-text-secondary flex items-center gap-1">
          <span className="text-emerald-400">✓</span>
          {fase.juego === "FC25"
            ? "Los 2 mejores de cada grupo clasifican al bracket"
            : "El mejor de cada grupo clasifica al bracket"}
        </p>
      )}
    </div>
  );
}

export default GruposPublicoView;
