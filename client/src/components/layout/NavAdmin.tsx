import { JSX } from "react";
import { Link, useNavigate } from "react-router-dom";
import { limpiarToken } from "../../services/authStore";

function NavAdmin(): JSX.Element {
  const navigate = useNavigate();

  function handleCerrarSesion(): void {
    limpiarToken();
    navigate("/admin/login");
  }

  return (
    <div className="flex gap-4">
      <Link to="/admin/jugadores" className="text-primary underline">
        Inscritos
      </Link>
      <Link to="/admin/bracket/fc25" className="text-primary underline">
        Bracket FC25
      </Link>
      <Link to="/admin/bracket/cod-bo2" className="text-primary underline">
        Bracket Call of Duty
      </Link>
      <button onClick={handleCerrarSesion} className="text-red-400 underline">
        Cerrar sesión
      </button>
    </div>
  );
}

export default NavAdmin;
