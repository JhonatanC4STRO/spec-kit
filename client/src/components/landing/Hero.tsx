import { JSX, useState, useEffect } from "react";

function Hero(): JSX.Element {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = ["/assets/landing/torneo_slider.png", "/assets/landing/BO2_slider.png"];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-between overflow-hidden transition-all duration-1000 pt-32 pb-16 bg-black">
      {/* Background image slider */}
      {slides.map((slide, index) => (
        <div
          key={slide}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url('${slide}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
        </div>
      ))}

      {/* Top Title */}
      <div className="relative z-10 text-center px-4 mt-4 md:mt-10">
        <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]">
          TORNEO GAMER
        </h1>
        <h2 className="text-4xl md:text-5xl font-black tracking-widest text-white mt-4 drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]">
          ADSO 2026
        </h2>
      </div>

      {/* Bottom Information */}
      <div className="relative z-10 text-center px-4 flex flex-col items-center mt-auto">
        <p className="text-xl md:text-2xl text-white font-medium mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] max-w-3xl text-center">
          {currentSlide === 0
            ? "El torneo más épico del SENA. ¡Demuestra tus habilidades!"
            : "La victoria pertenece al mejor equipo."}
        </p>

        {/* COMPITE. DIVIÉRTETE. GANA. */}
        <div className="mb-8 px-6 py-2 border border-white/30 rounded-full bg-black/20 backdrop-blur-sm">
          <span className="text-white text-sm md:text-base font-bold tracking-[0.2em] uppercase">
            COMPITE. DIVIÉRTETE. GANA.
          </span>
        </div>

        {/* Single Button: Acceder */}
        <a
          href="#info"
          className="px-12 py-4 rounded-xl font-bold text-base uppercase tracking-widest transition-all duration-300 hover:scale-105 hover:shadow-2xl inline-block"
          style={{
            background: "linear-gradient(135deg, #00c853, #00e676)",
            color: "#000",
            boxShadow: "0 0 30px rgba(0,200,83,0.4)",
          }}
        >
          Acceder
        </a>
      </div>
    </section>
  );
}

export default Hero;
