import { JSX } from "react";

function RatingsFeature(): JSX.Element {
  return (
    <section className="bg-bg-base py-16 px-4 wide:px-10">
      <div className="flex flex-col wide:flex-row items-center gap-10">
        <div className="w-full wide:w-1/2 flex flex-col gap-4">
          <h2 className="text-2xl font-bold tracking-wide">Valoraciones</h2>
          <p className="text-text-secondary leading-relaxed max-w-prose">
            Consulta las valoraciones completas de jugadores y equipos antes
            de armar tu plantilla ideal para la nueva temporada.
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

        <div className="w-full wide:w-1/2 rounded border border-edge p-6 bg-gradient-to-br from-purple-900/40 via-bg-card to-primary/20 flex flex-col items-center gap-3 text-center">
          <span className="font-extrabold tracking-widest text-primary">
            EA SPORTS FC™ 26
          </span>
          <span className="font-semibold">Full Ratings Database</span>
          <div className="flex gap-2">
            {[1, 2, 3].map((n): JSX.Element => (
              <div
                key={n}
                className="w-16 h-24 rounded bg-bg-base border border-yellow-500/60 flex items-center justify-center"
              >
                <span className="text-yellow-400 text-xs">★</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="bg-primary text-black rounded px-5 py-2 font-semibold hover:brightness-110 transition-all duration-200"
          >
            Live Now
          </button>
        </div>
      </div>
    </section>
  );
}

export default RatingsFeature;
