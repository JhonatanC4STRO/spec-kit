import { JSX } from "react";

function MobileFeature(): JSX.Element {
  return (
    <section className="bg-bg-base py-16 px-4 wide:px-10">
      <div className="flex flex-col wide:flex-row items-center gap-10">
        <div className="w-full wide:w-1/2 aspect-[4/5] bg-bg-card flex items-center justify-center">
          <span className="text-text-secondary text-sm">
            Jugador en el campo
          </span>
        </div>

        <div className="w-full wide:w-1/2 flex flex-col gap-4">
          <span className="inline-block w-fit text-xs uppercase tracking-wide bg-bg-card border border-edge rounded px-3 py-1 text-primary">
            Donde sea por el Club
          </span>
          <h2 className="text-2xl font-bold tracking-wide">
            EA SPORTS FC™ Mobile
          </h2>
          <p className="text-text-secondary leading-relaxed max-w-prose">
            Lleva tu Club a todas partes: gestiona tu plantilla, compite en
            eventos y sigue tus torneos favoritos desde el móvil.
          </p>
          <div>
            <button
              type="button"
              className="bg-primary text-black rounded px-6 py-3 font-semibold hover:brightness-110 transition-all duration-200"
            >
              Jugar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MobileFeature;
