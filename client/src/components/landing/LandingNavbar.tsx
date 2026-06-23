import { useState, JSX } from "react";
import { Link } from "react-router-dom";

function LandingNavbar(): JSX.Element {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  const scrollTo = (id: string): void => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  const NAV_LINKS: { label: string; targetId: string }[] = [
    { label: "Inicio", targetId: "inicio" },
    { label: "Modalidades", targetId: "info" },
    { label: "Inscribirse", targetId: "inscripcion" },
  ];

  const BRACKET_LINKS: { label: string; to: string; emoji: string }[] = [
    { label: "Bracket FC 25", to: "/bracket/fc25", emoji: "⚽" },
    { label: "Bracket COD BO2", to: "/bracket/cod-bo2", emoji: "🔫" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        background: "rgba(10,10,10,0.85)",
        backdropFilter: "blur(16px)",
        borderColor: "rgba(0,200,83,0.15)",
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 wide:px-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
            style={{ background: "linear-gradient(135deg, #00c853, #00e676)", color: "#000" }}
          >
            S
          </div>
          <span className="font-black tracking-wider text-white text-sm">
            SENA <span style={{ color: "#00c853" }}>GAMER</span>
          </span>
        </div>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                id={`nav-${item.targetId}`}
                onClick={(): void => scrollTo(item.targetId)}
                className="text-sm text-gray-400 hover:text-white transition-colors duration-200 font-medium"
              >
                {item.label}
              </button>
            </li>
          ))}
          {/* Separador */}
          <li className="w-px h-4 bg-white/10" />
          {BRACKET_LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className="text-sm text-gray-400 hover:text-white transition-colors duration-200 font-medium flex items-center gap-1"
              >
                {link.emoji} {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="nav-inscripcion-cta"
            onClick={(): void => scrollTo("inscripcion")}
            className="hidden md:inline-flex items-center gap-2 text-sm font-bold px-5 py-2 rounded-lg transition-all duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #00c853, #00e676)",
              color: "#000",
            }}
          >
            🎮 Inscribirme
          </button>

          <Link
            to="/admin/login"
            aria-label="Admin"
            id="nav-admin-link"
            className="w-8 h-8 rounded-full border flex items-center justify-center text-xs text-gray-400 hover:text-white transition-colors duration-200"
            style={{ borderColor: "rgba(255,255,255,0.15)" }}
          >
            ⚙
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            id="nav-mobile-toggle"
            aria-label="Abrir menú"
            className="md:hidden w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors duration-200"
            onClick={(): void => setMobileOpen((current): boolean => !current)}
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t px-4 py-4 flex flex-col gap-1"
          style={{ borderColor: "rgba(0,200,83,0.15)" }}
        >
          {NAV_LINKS.map((item) => (
            <button
              key={item.label}
              type="button"
              className="text-sm text-gray-300 hover:text-white py-3 px-2 text-left font-medium transition-colors duration-200 rounded-lg hover:bg-white/5"
              onClick={(): void => scrollTo(item.targetId)}
            >
              {item.label}
            </button>
          ))}

          {/* Divider */}
          <div className="border-t my-2" style={{ borderColor: "rgba(0,200,83,0.15)" }} />

          {/* Links a brackets */}
          {BRACKET_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={(): void => setMobileOpen(false)}
              className="flex items-center gap-3 py-3 px-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-200 font-medium"
            >
              <span className="text-lg">{link.emoji}</span>
              {link.label}
            </Link>
          ))}

          <button
            type="button"
            onClick={(): void => scrollTo("inscripcion")}
            className="mt-3 py-3 rounded-xl font-bold text-sm"
            style={{ background: "#00c853", color: "#000" }}
          >
            🎮 Inscribirme ahora
          </button>
        </div>
      )}
    </nav>
  );
}

export default LandingNavbar;
