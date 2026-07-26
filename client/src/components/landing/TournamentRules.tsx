import { JSX, useState } from "react";

function TournamentRules(): JSX.Element {
  const [activeTab, setActiveTab] = useState<"FC25" | "BO2">("FC25");

  const activeColor = activeTab === "FC25" ? "#39B54A" : "#ff6d00";
  const activeGradient =
    activeTab === "FC25"
      ? "linear-gradient(to bottom, rgba(57,181,74,0.3) 0%, rgba(13,18,22,1) 100%)"
      : "linear-gradient(to bottom, rgba(255,109,0,0.3) 0%, rgba(13,18,22,1) 100%)";

  return (
    <section className="py-12 bg-[#0a0a0a] px-4 max-w-7xl mx-auto flex flex-col items-center">
      <div className="w-full max-w-5xl">
        {/* Tabs Container */}
        <div className="flex items-end pl-2 md:pl-6 relative z-10">
          {/* FC25 Tab */}
          <button
            onClick={() => setActiveTab("FC25")}
            className="relative px-8 py-3 md:px-12 md:py-4 font-bold text-sm tracking-widest transition-all"
            style={{
              border: activeTab === "FC25" ? `1px solid ${activeColor}` : "1px solid transparent",
              borderBottom: activeTab === "FC25" ? "none" : `1px solid ${activeColor}`,
              borderTopLeftRadius: "0.75rem",
              borderTopRightRadius: "1.5rem",
              background: activeTab === "FC25" ? activeGradient : "transparent",
              color: activeTab === "FC25" ? "#fff" : "#6b7280",
              zIndex: activeTab === "FC25" ? 20 : 0,
              marginBottom: activeTab === "FC25" ? "-1px" : "0",
            }}
          >
            FIFA 25
          </button>
          
          {/* BO2 Tab */}
          <button
            onClick={() => setActiveTab("BO2")}
            className="relative px-8 py-3 md:px-12 md:py-4 font-bold text-sm tracking-widest transition-all"
            style={{
              border: activeTab === "BO2" ? `1px solid ${activeColor}` : "1px solid transparent",
              borderBottom: activeTab === "BO2" ? "none" : `1px solid ${activeColor}`,
              borderTopLeftRadius: "0.75rem",
              borderTopRightRadius: "1.5rem",
              background: activeTab === "BO2" ? activeGradient : "transparent",
              color: activeTab === "BO2" ? "#fff" : "#6b7280",
              zIndex: activeTab === "BO2" ? 20 : 0,
              marginBottom: activeTab === "BO2" ? "-1px" : "0",
              marginLeft: activeTab === "FC25" ? "0" : "-10px",
            }}
          >
            BO2
          </button>
          
          {/* Bottom border filler for the remaining width of the tabs row */}
          <div className="flex-grow border-b" style={{ borderColor: activeColor, height: "100%", marginBottom: activeTab ? "0" : "0" }}></div>
        </div>

        {/* Main Content Box */}
        <div
          className="bg-[#0d1216] border rounded-b-2xl rounded-tr-2xl relative z-0 flex flex-col md:flex-row overflow-hidden shadow-2xl"
          style={{
            borderColor: activeColor,
            borderTop: "none" // Top border is handled by tabs and filler
          }}
        >
          {/* Main Top Border manually to avoid double border where tabs are */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: activeColor }}></div>
          
          {activeTab === "FC25" && (
            <>
              {/* FC25 Column 1 */}
              <div
                className="flex-1 p-6 md:p-10 flex flex-col gap-6 relative border-b md:border-b-0 md:border-r"
                style={{ borderColor: activeColor }}
              >
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <span className="text-[#39B54A] text-2xl">🏆</span> 1. ¿DE QUÉ SE TRATA?
                </h3>
                
                <p className="text-gray-300 text-sm leading-relaxed">
                  Torneo individual de FIFA 25 en el que 24 jugadores compiten en una fase de grupos todos contra todos y luego una eliminación directa para definir al campeón.
                </p>

                <ul className="flex flex-col gap-4 mt-2">
                  {[
                    "Fase de grupos (6 grupos de 4 jugadores)",
                    "Avanzan los 2 mejores de cada grupo",
                    "Eliminación directa",
                    "Partidos de 2 tiempos de 5 minutos",
                    "Plataforma: Consola / PC"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#39B54A] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-300 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* FC25 Column 2 */}
              <div className="flex-1 p-6 md:p-10 flex flex-col gap-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <span className="text-[#39B54A] text-2xl">📋</span> 2. REGLAS Y CONDICIONES
                </h3>

                <ul className="flex flex-col gap-4 flex-grow">
                  {[
                    "5 minutos por tiempo (10 minutos en total).",
                    "3 puntos por victoria, 1 por empate, 0 por derrota.",
                    "En caso de empate en grupos, se aplican los criterios de desempate establecidos.",
                    "Fair play y respeto obligatorio.",
                    "No se permite desconectar el control ni salir del juego.",
                    "El organizador tiene la última palabra en cualquier situación."
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#39B54A] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-300 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>

                <button className="w-full sm:w-auto mt-4 px-6 py-3 rounded-lg border border-[#39B54A] text-white font-bold text-sm tracking-widest uppercase transition-all hover:bg-[#39B54A]/10">
                  VER REGLAMENTO COMPLETO
                </button>
              </div>
            </>
          )}

          {activeTab === "BO2" && (
            <>
              {/* BO2 Column 1 */}
              <div
                className="flex-1 p-6 md:p-10 flex flex-col gap-6 relative border-b md:border-b-0 md:border-r"
                style={{ borderColor: activeColor }}
              >
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <span className="text-[#ff6d00] text-2xl">ⓘ</span> 1. ¿DE QUÉ SE TRATA?
                </h3>
                
                <div className="text-gray-300 text-sm leading-relaxed space-y-4">
                  <p>Torneo de Call of Duty: Black Ops 2 en modalidad Dúos (2 vs 2).</p>
                  <p>Competencia de eliminación directa al mejor de 3 (gana el equipo que consiga 2 partidas).</p>
                  <p>El objetivo es demostrar trabajo en equipo, estrategia y habilidad para ser el dúo campeón del torneo.</p>
                </div>

                <ul className="flex flex-col gap-4 mt-2 mb-32 z-10 relative">
                  {[
                    "Modalidad: Dúos (2 vs 2)",
                    "Mejor de 3 (gana el que consiga 2 partidas)",
                    "Duración de cada partida: 4 minutos",
                    "Eliminación directa",
                    "Equipos contemplados: 8 o 9 equipos"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#ff6d00] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-300 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="absolute bottom-0 left-0 right-0 h-64 overflow-hidden pointer-events-none opacity-40 mix-blend-screen" style={{ maskImage: "linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0))" }}>
                   <div className="absolute inset-0 bg-[url('/assets/landing/cod_cover.png')] bg-cover bg-bottom opacity-50 filter grayscale"></div>
                </div>
              </div>

              {/* BO2 Column 2 */}
              <div className="flex-1 p-6 md:p-10 flex flex-col gap-6 relative z-10">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <span className="text-[#ff6d00] text-2xl">⚖️</span> 2. REGLAS Y CONDICIONES
                </h3>

                <div className="flex flex-col gap-8">
                  {/* Section 1 */}
                  <div>
                    <h4 className="text-[#ff6d00] font-bold text-sm tracking-widest mb-4">CONFIGURACIÓN DE LAS PARTIDAS</h4>
                    <ul className="flex flex-col gap-2.5">
                      {[
                        "Modo de juego: Team Deathmatch (Duelo por Equipos)",
                        "Modalidad: Dúos (2 vs 2)",
                        "Duración de cada partida: 4 minutos",
                        "Límite de puntos: Desactivado",
                        "Radar: Activado",
                        "Rachas de puntos: Desactivadas",
                        "Espectadores: Permitidos",
                        "Lanzagranadas: Desactivados",
                        "Escopetas: Permitidas",
                        "Armas permitidas: Únicamente las clases predeterminadas (Default Classes)"
                      ].map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#ff6d00] shrink-0 mt-1.5"></div>
                          <span className="text-gray-300 text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Section 2 */}
                  <div>
                    <h4 className="text-[#ff6d00] font-bold text-sm tracking-widest mb-4">SISTEMA DE PUNTUACIÓN</h4>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                      <div className="border border-gray-700/50 bg-black/40 rounded-xl p-3 flex flex-col items-center justify-center">
                        <span className="text-2xl mb-1">⚔️</span>
                        <span className="text-[10px] text-gray-400 mb-1">Baja normal</span>
                        <span className="text-white font-bold text-xs">1 PUNTO</span>
                      </div>
                      <div className="border border-gray-700/50 bg-black/40 rounded-xl p-3 flex flex-col items-center justify-center">
                        <span className="text-2xl mb-1">💀</span>
                        <span className="text-[10px] text-gray-400 mb-1">Baja con Headshot</span>
                        <span className="text-white font-bold text-xs">2 PUNTOS</span>
                      </div>
                      <div className="border border-gray-700/50 bg-black/40 rounded-xl p-3 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-red-500/5 pointer-events-none"></div>
                        <span className="text-2xl mb-1">🚫</span>
                        <span className="text-[10px] text-gray-400 mb-1">Suicidio</span>
                        <span className="text-white font-bold text-xs">-1 PUNTO</span>
                      </div>
                    </div>
                  </div>

                  {/* Section 3 */}
                  <div>
                    <h4 className="text-[#ff6d00] font-bold text-sm tracking-widest mb-2">SISTEMA DE DESEMPATE</h4>
                    <p className="text-gray-300 text-sm leading-relaxed mb-3">
                      Si al finalizar los 4 minutos ambos equipos obtienen la misma cantidad de puntos:
                    </p>
                    <div className="text-white text-sm font-medium leading-relaxed bg-[#ff6d00]/10 border border-[#ff6d00]/20 p-4 rounded-xl">
                      Se jugará una ronda de <span className="font-bold">MUERTE SÚBITA</span>. El primer equipo que consiga una baja será el ganador de la partida.
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default TournamentRules;
