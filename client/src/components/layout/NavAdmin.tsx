import { JSX } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { limpiarToken } from "../../services/authStore";

function NavAdmin(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();

  function handleCerrarSesion(): void {
    limpiarToken();
    navigate("/home");
  }

  function linkClass(path: string): string {
    const base = "text-sm font-semibold uppercase tracking-wide transition-colors duration-200";
    return location.pathname === path
      ? `${base} text-primary`
      : `${base} text-white hover:text-primary`;
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="text-text-secondary text-xs uppercase tracking-widest">
          Panel Admin
        </span>
        <Link to="/admin/jugadores" className={linkClass("/admin/jugadores")}>
          Inscritos
        </Link>
        <Link to="/admin/bracket/fc25" className={linkClass("/admin/bracket/fc25")}>
          Bracket FC25
        </Link>
        <Link to="/admin/bracket/cod-bo2" className={linkClass("/admin/bracket/cod-bo2")}>
          Bracket Call of Duty
        </Link>
      </div>
      <button
        onClick={handleCerrarSesion}
        className="text-sm border border-red-400 text-red-400 rounded px-3 py-1 hover:bg-red-400/10 transition-colors duration-200"
      >
        Cerrar sesión
      </button>
    </div>
  );
}

export default NavAdmin;
