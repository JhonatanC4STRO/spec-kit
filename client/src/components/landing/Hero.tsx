import { JSX } from "react";

function Hero(): JSX.Element {
  const scrollToInscripcion = (): void => {
    const el = document.getElementById("inscripcion");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0a0a0a 0%, #0d1a0d 40%, #1a0d0a 100%)",
      }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url('/hero_banner.png')" }}
      />

      {/* Animated glow orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #00c853, transparent)" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #ff6d00, transparent)" }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,200,83,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,83,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 text-center px-4 wide:px-10 max-w-5xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/40 bg-green-500/10 mb-6 text-xs tracking-widest uppercase text-green-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
          SENA — Centro de Gestión de Mercados, Logística y TI
        </div>

        {/* Title */}
        <h1
          className="text-5xl md:text-7xl font-black tracking-tight mb-4 leading-none"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #00c853 50%, #ff6d00 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          CAMPEONATO
          <br />
          GAMER SENA
        </h1>

        <p className="text-lg md:text-xl text-gray-300 mb-2 font-medium">
          ⚽ EA Sports FC 25 &nbsp;·&nbsp; 🔫 Call of Duty: Black Ops 2
        </p>
        <p className="text-sm text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
          El torneo interno más épico del SENA. Demuestra tus habilidades, gana
          reconocimiento y representá tu ficha.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            type="button"
            id="hero-inscribirse-btn"
            onClick={scrollToInscripcion}
            className="px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #00c853, #00e676)",
              color: "#000",
              boxShadow: "0 0 30px rgba(0,200,83,0.4)",
            }}
          >
            Inscribirme ahora
          </button>
          <a
            href="#info"
            className="px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest border border-white/20 text-white hover:border-white/60 transition-all duration-300 hover:scale-105"
          >
            Ver información
          </a>
        </div>

        {/* Bracket links */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-4">
          <a
            href="/bracket/fc25"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-xs uppercase tracking-widest border transition-all duration-300 hover:scale-105"
            style={{
              borderColor: "rgba(0,200,83,0.5)",
              color: "#00c853",
              background: "rgba(0,200,83,0.08)",
            }}
          >
            ⚽ Bracket FC 25
          </a>
          <a
            href="/bracket/cod-bo2"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-xs uppercase tracking-widest border transition-all duration-300 hover:scale-105"
            style={{
              borderColor: "rgba(255,109,0,0.5)",
              color: "#ff6d00",
              background: "rgba(255,109,0,0.08)",
            }}
          >
            🔫 Bracket COD BO2
          </a>
        </div>

        {/* Stats bar */}
        <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto">
          {[
            { label: "Juegos", value: "2" },
            { label: "Fichas participantes", value: "10+" },
            { label: "Premiación", value: "🏆" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm py-4 px-2"
            >
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
        <div className="w-5 h-8 rounded-full border border-white/30 flex items-start justify-center p-1">
          <div className="w-1 h-2 rounded-full bg-white animate-bounce" />
        </div>
      </div>
    </section>
  );
}

export default Hero;
