import { JSX } from "react";

const STATS = [
  { 
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, 
    value: "24", 
    label: "JUGADORES\nFIFA 25" 
  },
  { 
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, 
    value: "8 - 9", 
    label: "EQUIPOS\nBO2 (DÚOS)" 
  },
  { 
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/></svg>, 
    value: "2", 
    label: "JUEGOS" 
  },
  { 
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>, 
    value: "2 DÍAS", 
    label: "4 HORAS\nTOTALES" 
  },
  { 
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7c0 3.31 2.69 6 6 6s6-2.69 6-6V2Z"/></svg>, 
    value: "PREMIOS", 
    label: "PARA LOS 3\nPRIMEROS LUGARES" 
  },
];

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

const GamepadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/></svg>
);

function TournamentInfo(): JSX.Element {
  const handleInscribirme = (gameId: string) => {
    const gameSelect = document.getElementById(`game-select-${gameId}`);
    if (gameSelect) {
      gameSelect.click();
    }
    const formSection = document.getElementById("inscripcion");
    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="info" className="pb-20 bg-[#0a0a0a]">
      {/* Stats row - Overlapping the hero slightly */}
      <div className="flex flex-wrap justify-center gap-4 -mt-8 relative z-20 px-4 max-w-6xl mx-auto">
        {STATS.map((stat, i) => (
          <div
            key={i}
            className="flex items-center gap-4 bg-[#0d1216] border border-gray-700/50 rounded-xl px-5 py-4 transition-all duration-300 hover:border-yellow-400 group"
          >
            <div className="text-[#facc15] transition-transform duration-300 group-hover:scale-110">
              {stat.icon}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl md:text-2xl font-semibold text-white leading-none mb-1">
                {stat.value}
              </span>
              <span className="text-[9px] md:text-[10px] text-gray-300 whitespace-pre-line leading-tight font-medium tracking-wide uppercase">
                {stat.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Game Cards */}
      <div className="flex flex-col lg:flex-row gap-8 justify-center items-stretch mt-12 max-w-7xl mx-auto px-4">
        
        {/* Card FC25 */}
        <div className="relative rounded-3xl overflow-hidden border border-[#39B54A]/50 flex-1 min-h-[320px] md:min-h-[360px] flex flex-col justify-end p-6 bg-black group">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: "url('/assets/landing/Balon_ejemplo.png')" }}
          />
          {/* Subtle gradient at bottom for readability of pills/button */}
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/80 to-transparent opacity-90" />
          
          <div className="relative z-10 w-full mt-auto">
            {/* Pills */}
            <div className="grid grid-cols-3 gap-3 mb-5 w-full max-w-xl mx-auto">
              <div className="flex items-center gap-3 border border-[#39B54A]/40 bg-black/70 px-3 py-2.5 rounded-xl justify-center sm:justify-start backdrop-blur-sm">
                <div className="text-[#39B54A] w-6 h-6 sm:w-7 sm:h-7"><ClockIcon /></div>
                <div className="text-left leading-tight hidden sm:block">
                  <div className="text-white font-bold text-sm sm:text-base">1 vs 1</div>
                  <div className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wider">INDIVIDUAL</div>
                </div>
              </div>
              <div className="flex items-center gap-3 border border-[#39B54A]/40 bg-black/70 px-3 py-2.5 rounded-xl justify-center sm:justify-start backdrop-blur-sm">
                <div className="text-[#39B54A] w-6 h-6 sm:w-7 sm:h-7"><UsersIcon /></div>
                <div className="text-left leading-tight hidden sm:block">
                  <div className="text-white font-bold text-sm sm:text-base">24</div>
                  <div className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wider">PARTICIPANTES</div>
                </div>
              </div>
              <div className="flex items-center gap-3 border border-[#39B54A]/40 bg-black/70 px-3 py-2.5 rounded-xl justify-center sm:justify-start backdrop-blur-sm">
                <div className="text-[#39B54A] w-6 h-6 sm:w-7 sm:h-7"><ClockIcon /></div>
                <div className="text-left leading-tight hidden sm:block">
                  <div className="text-white font-bold text-sm sm:text-base">5 MIN</div>
                  <div className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wider">POR TIEMPO</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleInscribirme("FC25")}
              className="w-full max-w-xl mx-auto block py-3.5 rounded-xl font-bold text-white text-[15px] uppercase tracking-widest transition-all hover:brightness-110"
              style={{ background: "#4caf50" }}
            >
              INSCRIBIRME AHORA →
            </button>
          </div>
        </div>

        {/* Card BO2 */}
        <div className="relative rounded-3xl overflow-hidden border border-[#ff6d00]/50 flex-1 min-h-[320px] md:min-h-[360px] flex flex-col justify-end p-6 bg-black group">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: "url('/assets/landing/cod_cover.png')" }}
          />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/80 to-transparent opacity-90" />
          
          <div className="relative z-10 w-full mt-auto">
            {/* Pills */}
            <div className="grid grid-cols-3 gap-3 mb-5 w-full max-w-xl mx-auto">
              <div className="flex items-center gap-3 border border-[#ff6d00]/40 bg-black/70 px-3 py-2.5 rounded-xl justify-center sm:justify-start backdrop-blur-sm">
                <div className="text-[#ff6d00] w-6 h-6 sm:w-7 sm:h-7"><GamepadIcon /></div>
                <div className="text-left leading-tight hidden sm:block">
                  <div className="text-white font-bold text-sm sm:text-base">2 vs 2</div>
                  <div className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wider">DÚOS</div>
                </div>
              </div>
              <div className="flex items-center gap-3 border border-[#ff6d00]/40 bg-black/70 px-3 py-2.5 rounded-xl justify-center sm:justify-start backdrop-blur-sm">
                <div className="text-[#ff6d00] w-6 h-6 sm:w-7 sm:h-7"><UsersIcon /></div>
                <div className="text-left leading-tight hidden sm:block">
                  <div className="text-white font-bold text-sm sm:text-base">8 - 9</div>
                  <div className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wider">EQUIPOS</div>
                </div>
              </div>
              <div className="flex items-center gap-3 border border-[#ff6d00]/40 bg-black/70 px-3 py-2.5 rounded-xl justify-center sm:justify-start backdrop-blur-sm">
                <div className="text-[#ff6d00] w-6 h-6 sm:w-7 sm:h-7"><ClockIcon /></div>
                <div className="text-left leading-tight hidden sm:block">
                  <div className="text-white font-bold text-sm sm:text-base">4 MIN</div>
                  <div className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wider">POR PARTIDA</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleInscribirme("COD_BO2")}
              className="w-full max-w-xl mx-auto block py-3.5 rounded-xl font-bold text-white text-[15px] uppercase tracking-widest transition-all hover:brightness-110"
              style={{ background: "#ff6d00" }}
            >
              INSCRIBIRME AHORA →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TournamentInfo;
