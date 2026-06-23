import { useState, JSX } from "react";
import { Link, useLocation } from "react-router-dom";

interface NavLink {
  label: string;
  to: string;
  emoji: string;
}

const NAV_LINKS: NavLink[] = [
  { label: "Inscripción", to: "/", emoji: "✍️" },
  { label: "Bracket FC 25", to: "/bracket/fc25", emoji: "⚽" },
  { label: "Bracket COD BO2", to: "/bracket/cod-bo2", emoji: "🔫" },
];

function NavPublica(): JSX.Element {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  function linkClass(to: string): string {
    const active = pathname === to;
    return active
      ? "text-primary font-semibold"
      : "text-text-secondary hover:text-white transition-colors duration-200";
  }

  return (
    <>
      {/* Barra principal */}
      <div className="flex items-center justify-between w-full">
        {/* Logo / marca */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-black"
            style={{ background: "linear-gradient(135deg, #00c853, #00e676)", color: "#000" }}
          >
            S
          </div>
          <span className="font-bold text-white text-sm tracking-wide hidden sm:inline">
            SENA <span style={{ color: "#00c853" }}>GAMER</span>
          </span>
        </div>

        {/* Links desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded text-sm font-medium ${linkClass(link.to)}`}
            >
              {link.emoji} {link.label}
            </Link>
          ))}
        </nav>

        {/* Admin + hamburguesa */}
        <div className="flex items-center gap-2">
          <Link
            to="/admin/login"
            className="text-xs text-text-secondary hover:text-white transition-colors duration-200 hidden md:inline"
          >
            Admin
          </Link>

          {/* Botón hamburguesa (solo móvil) */}
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={(): void => setMobileOpen((v) => !v)}
            className="md:hidden w-8 h-8 flex items-center justify-center text-text-secondary hover:text-white transition-colors duration-200"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {mobileOpen && (
        <div
          className="md:hidden mt-3 border-t border-edge pt-3 flex flex-col gap-1"
          onClick={(): void => setMobileOpen(false)}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                pathname === link.to
                  ? "bg-primary/10 text-primary"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-lg">{link.emoji}</span>
              {link.label}
            </Link>
          ))}
          <Link
            to="/admin/login"
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-text-secondary hover:text-white transition-colors duration-200 mt-1 border-t border-edge pt-3"
          >
            ⚙ Admin
          </Link>
        </div>
      )}
    </>
  );
}

export default NavPublica;
