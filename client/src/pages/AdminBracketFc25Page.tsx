import { JSX } from "react";
import { Navigate } from "react-router-dom";
import BracketJuegoPanel from "../components/brackets/BracketJuegoPanel";
import { getToken } from "../services/authStore";

function AdminBracketFc25Page(): JSX.Element {
  const token: string | null = getToken();

  if (token === null) {
    return <Navigate to="/admin/login" replace />;
  }

  return <BracketJuegoPanel juego="FC25" token={token} />;
}

export default AdminBracketFc25Page;
