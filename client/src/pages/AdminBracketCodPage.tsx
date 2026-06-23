import { JSX } from "react";
import { Navigate } from "react-router-dom";
import BracketJuegoPanel from "../components/brackets/BracketJuegoPanel";
import { getToken } from "../services/authStore";

function AdminBracketCodPage(): JSX.Element {
  const token: string | null = getToken();

  if (token === null) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <section className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold uppercase tracking-wide text-white">
        Call of Duty: BO2 — Administración
      </h1>

      {/* Bracket */}
      <BracketJuegoPanel juego="COD_BO2" token={token} />
    </section>
  );
}

export default AdminBracketCodPage;
