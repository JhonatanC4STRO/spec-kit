import { JSX } from "react";

function Footer(): JSX.Element {
  const scrollTo = (id: string): void => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer
      className="py-12 px-4 wide:px-10 border-t"
      style={{
        background: "#080808",
        borderColor: "rgba(0,200,83,0.1)",
      }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black"
              style={{ background: "linear-gradient(135deg, #00c853, #00e676)", color: "#000" }}
            >
              S
            </div>
            <div>
              <div className="font-black text-white tracking-wider">
                SENA <span style={{ color: "#00c853" }}>GAMER</span>
              </div>
              <div className="text-xs text-gray-600">Campeonato Interno 2026</div>
            </div>
          </div>

          {/* Nav links */}
          <ul className="flex flex-wrap gap-6">
            {[
              { label: "Inicio", id: "inicio" },
              { label: "Modalidades", id: "info" },
              { label: "Inscripciones", id: "inscripcion" },
            ].map((link) => (
              <li key={link.label}>
                <button
                  type="button"
                  onClick={(): void => scrollTo(link.id)}
                  className="text-sm text-gray-500 hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            type="button"
            id="footer-inscripcion-btn"
            onClick={(): void => scrollTo("inscripcion")}
            className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-105"
            style={{ background: "#00c853", color: "#000" }}
          >
            Inscribirme ↑
          </button>
        </div>

        {/* Divider */}
        <div
          className="border-t mb-8"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        />

        {/* Game badges */}
        <div className="flex flex-wrap gap-3 mb-8">
          <span
            className="text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"
            style={{
              background: "rgba(0,200,83,0.1)",
              color: "#00c853",
              border: "1px solid rgba(0,200,83,0.2)",
            }}
          >
            ⚽ EA Sports FC 25
          </span>
          <span
            className="text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"
            style={{
              background: "rgba(255,109,0,0.1)",
              color: "#ff6d00",
              border: "1px solid rgba(255,109,0,0.2)",
            }}
          >
            🔫 Call of Duty: Black Ops 2
          </span>
          <span
            className="text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"
            style={{
              background: "rgba(255,255,255,0.04)",
              color: "#888",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            🏆 Campeonato 2026
          </span>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <p className="text-xs text-gray-600">
            © 2026 SENA — Centro de Gestión de Mercados, Logística y TI.
            Todos los derechos reservados.
          </p>
          <p className="text-xs text-gray-700">
            Evento interno · Solo aprendices activos
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
