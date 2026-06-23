import { useState, useCallback, JSX } from "react";
import { Navigate } from "react-router-dom";
import GruposAdminPanel from "../components/brackets/GruposAdminPanel";
import BracketJuegoPanel from "../components/brackets/BracketJuegoPanel";
import { getToken } from "../services/authStore";

function AdminBracketFc25Page(): JSX.Element {
  const token: string | null = getToken();
  // Cuando la fase de grupos se cierra, forzamos al BracketJuegoPanel a recargar
  const [bracketKey, setBracketKey] = useState<number>(0);

  if (token === null) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleFaseCerrada = useCallback((): void => {
    setBracketKey((k) => k + 1);
  }, []);

  return (
    <section className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold uppercase tracking-wide text-white">
        FC 25 — Administración
      </h1>

      {/* Fase de grupos */}
      <div className="bg-bg-card border border-edge rounded-xl p-4 md:p-6">
        <GruposAdminPanel juego="FC25" token={token} onFaseCerrada={handleFaseCerrada} />
      </div>

      {/* Divisor */}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-edge" />
        <span className="text-[10px] uppercase tracking-widest text-text-secondary">Bracket eliminatorio</span>
        <div className="flex-1 border-t border-edge" />
      </div>

      {/* Bracket */}
      <BracketJuegoPanel key={bracketKey} juego="FC25" token={token} />
    </section>
  );
}

export default AdminBracketFc25Page;
