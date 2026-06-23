import { JSX } from "react";

interface NewsItem {
  badge: string;
  date: string;
  title: string;
  description: string;
  featured?: boolean;
}

const NEWS_ITEMS: NewsItem[] = [
  {
    badge: "Artículo de noticias",
    date: "12 jun. 2026",
    title: "Todo sobre la nueva temporada",
    description:
      "Repasamos las novedades de gameplay, modos y contenido que llegan con la nueva temporada de EA SPORTS FC™...",
  },
  {
    badge: "Artículo de noticias",
    date: "08 jun. 2026",
    title: "Guía de Ultimate Team",
    description:
      "Consejos para armar tu plantilla ideal y aprovechar los nuevos objetos especiales de esta entrega...",
  },
  {
    badge: "Artículo de noticias",
    date: "01 jun. 2026",
    title: "Calendario de torneos de la comunidad",
    description:
      "Estas son las fechas confirmadas para los próximos torneos de FC 25 y Call of Duty: Black Ops 2...",
  },
  {
    badge: "Soundtrack",
    date: "25 may. 2026",
    title: "Escucha el soundtrack oficial",
    description:
      "Descubre los artistas y canciones que forman parte de la banda sonora de esta temporada...",
    featured: true,
  },
];

function NewsGrid(): JSX.Element {
  return (
    <section className="bg-bg-base py-16 px-4 wide:px-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-wide">
          Noticias de EA SPORTS FC™
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white">Explorar</span>
          <button
            type="button"
            aria-label="Noticia anterior"
            className="w-8 h-8 rounded-full border border-edge flex items-center justify-center hover:border-primary hover:text-primary transition-colors duration-200"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Siguiente noticia"
            className="w-8 h-8 rounded-full border border-edge flex items-center justify-center hover:border-primary hover:text-primary transition-colors duration-200"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 wide:grid-cols-4 gap-4">
        {NEWS_ITEMS.map((item): JSX.Element => (
          <article
            key={item.title}
            className={`rounded border border-edge p-4 flex flex-col gap-2 hover:border-primary transition-colors duration-200 ${
              item.featured === true ? "bg-bg-alt" : "bg-bg-card"
            }`}
          >
            <div className="h-32 bg-bg-base border border-edge rounded flex items-center justify-center">
              <span className="text-text-secondary text-xs">Imagen</span>
            </div>
            <span className="text-xs uppercase tracking-wide text-primary">
              {item.badge}
            </span>
            <span className="text-xs text-text-secondary">{item.date}</span>
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-sm text-text-secondary line-clamp-2">
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default NewsGrid;
