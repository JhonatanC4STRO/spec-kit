import { JSX } from "react";

function Authenticity(): JSX.Element {
  return (
    <section className="bg-bg-base py-16 px-4 wide:px-10">
      <div className="flex flex-col-reverse wide:flex-row items-center gap-10">
        <div className="w-full wide:w-1/2 flex flex-col gap-4">
          <h2 className="text-2xl font-bold tracking-wide">Autenticidad</h2>
          <p className="text-text-secondary leading-relaxed max-w-prose">
            Más de 20.000+ futbolistas, 750+ clubes, 120+ estadios y 35+
            ligas oficiales recreados con el máximo nivel de detalle.
          </p>
          <div>
            <button
              type="button"
              className="border border-white text-white rounded px-5 py-2 hover:border-primary hover:text-primary transition-colors duration-200"
            >
              Más información
            </button>
          </div>
        </div>

        <div className="w-full wide:w-1/2 aspect-[4/5] bg-bg-card flex items-center justify-center">
          <span className="text-text-secondary text-sm">Foto de jugador</span>
        </div>
      </div>
    </section>
  );
}

export default Authenticity;
