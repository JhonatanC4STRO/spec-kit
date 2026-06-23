import { JSX } from "react";

interface GameCard {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  color: string;
  glowColor: string;
  rules: string[];
  tag: string;
}

const GAMES: GameCard[] = [
  {
    id: "fc25",
    title: "EA Sports FC 25",
    subtitle: "Fútbol",
    image: "/fc25_cover.png",
    color: "#00c853",
    glowColor: "rgba(0,200,83,0.3)",
    tag: "⚽ FÚTBOL",
    rules: [
      "Formato: 1 vs 1",
      "Plataforma: PS4 / PS5",
      "Modo: Partidos rápidos",
      "2 × 5 minutos por partido",
      "Sistema de eliminación directa",
      "Configuración estándar FIFA",
    ],
  },
  {
    id: "cod",
    title: "Call of Duty: Black Ops 2",
    subtitle: "Shooter",
    image: "/cod_cover.png",
    color: "#ff6d00",
    glowColor: "rgba(255,109,0,0.3)",
    tag: "🔫 SHOOTER",
    rules: [
      "Formato: 4 vs 4",
      "Modo: Team Deathmatch",
      "Plataforma: PC",
      "Score límite: 75 bajas",
      "Mapa: Nuketown / Hijacked",
      "Reglamento estándar de torneo",
    ],
  },
];

function TournamentInfo(): JSX.Element {
  return (
    <section id="info" className="py-20 px-4 wide:px-10" style={{ background: "#0a0a0a" }}>
      {/* Header */}
      <div className="text-center mb-14">
        <span className="text-xs tracking-widest uppercase font-bold text-green-400 mb-3 block">
          🎮 Modalidades del torneo
        </span>
        <h2
          className="text-4xl md:text-5xl font-black mb-4"
          style={{
            background: "linear-gradient(135deg, #ffffff, #00c853)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Dos juegos. Una competencia.
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto text-base">
          Compite en el juego que dominas. Cada modalidad tiene sus propias reglas
          y un sistema de brackets independiente.
        </p>
      </div>

      {/* Game cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {GAMES.map((game) => (
          <article
            key={game.id}
            id={`game-card-${game.id}`}
            className="rounded-2xl overflow-hidden border transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
            style={{
              borderColor: `${game.color}30`,
              background: `linear-gradient(135deg, #111 0%, #0d0d0d 100%)`,
              boxShadow: `0 0 0 1px ${game.color}20`,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 60px ${game.glowColor}, 0 0 0 1px ${game.color}50`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 1px ${game.color}20`;
            }}
          >
            {/* Game image */}
            <div className="relative h-56 overflow-hidden">
              <img
                src={game.image}
                alt={game.title}
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to top, #111 0%, transparent 60%)`,
                }}
              />
              <span
                className="absolute top-4 left-4 text-xs font-bold tracking-widest px-3 py-1 rounded-full"
                style={{
                  background: `${game.color}20`,
                  color: game.color,
                  border: `1px solid ${game.color}40`,
                }}
              >
                {game.tag}
              </span>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-black text-white mb-1">{game.title}</h3>
              <p className="text-sm mb-5" style={{ color: game.color }}>
                {game.subtitle}
              </p>

              <ul className="space-y-2">
                {game.rules.map((rule) => (
                  <li key={rule} className="flex items-center gap-3 text-sm text-gray-400">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: game.color }}
                    />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>

      {/* Timeline */}
      <div className="mt-20 max-w-3xl mx-auto">
        <h3 className="text-center text-2xl font-black text-white mb-10">
          📅 Fechas importantes
        </h3>
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
            style={{ background: "linear-gradient(to bottom, #00c853, #ff6d00)" }}
          />

          {[
            { date: "30 Jun", title: "Cierre de inscripciones", color: "#00c853", side: "left" },
            { date: "05 Jul", title: "Publicación de brackets", color: "#00e676", side: "right" },
            { date: "10 Jul", title: "Fase de grupos", color: "#ff6d00", side: "left" },
            { date: "17 Jul", title: "Semifinales", color: "#ff8f00", side: "right" },
            { date: "24 Jul", title: "🏆 Gran Final", color: "#ffd600", side: "left" },
          ].map((item) => (
            <div
              key={item.title}
              className={`relative flex items-center mb-8 ${
                item.side === "left" ? "flex-row" : "flex-row-reverse"
              }`}
            >
              <div className="w-1/2 px-6">
                <div
                  className={`rounded-xl border p-4 ${
                    item.side === "left" ? "text-right" : "text-left"
                  }`}
                  style={{
                    borderColor: `${item.color}30`,
                    background: `${item.color}08`,
                  }}
                >
                  <div
                    className="text-xs font-bold tracking-widest mb-1"
                    style={{ color: item.color }}
                  >
                    {item.date}
                  </div>
                  <div className="text-sm font-semibold text-white">{item.title}</div>
                </div>
              </div>

              {/* Center dot */}
              <div
                className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-black z-10"
                style={{ background: item.color }}
              />

              <div className="w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TournamentInfo;
