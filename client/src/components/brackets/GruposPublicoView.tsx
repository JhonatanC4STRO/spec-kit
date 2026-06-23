import { JSX } from "react";
import type { FaseGruposConGrupos } from "@shared/types/grupos";
import GrupoCard from "./GrupoCard";

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
          <GrupoCard
            key={grupo.id}
            grupo={grupo}
            juego={fase.juego}
            estadoFase={fase.estado}
            nombre={nombre}
          />
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
