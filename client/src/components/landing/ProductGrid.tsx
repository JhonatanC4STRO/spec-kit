import { JSX } from "react";

interface Product {
  name: string;
  price: string;
  discountBadge?: string;
}

const PRODUCTS: Product[] = [
  { name: "EA SPORTS FC™ 26", price: "$59.99" },
  { name: "EA SPORTS FC™ 25", price: "$13.99", discountBadge: "NEW" },
  { name: "EA SPORTS FC™ Mobile", price: "Gratis" },
];

function ProductGrid(): JSX.Element {
  return (
    <section className="bg-bg-base py-16 px-4 wide:px-10">
      <h2 className="text-2xl font-bold tracking-wide mb-6">
        Más EA SPORTS FC™
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PRODUCTS.map((product): JSX.Element => (
          <article
            key={product.name}
            className="rounded border border-edge bg-bg-card p-4 flex flex-col gap-2 hover:border-primary transition-colors duration-200"
          >
            <div className="h-40 bg-bg-base border border-edge rounded flex items-center justify-center">
              <span className="text-text-secondary text-xs">Cover</span>
            </div>
            <div className="flex gap-2">
              <span className="text-xs uppercase tracking-wide text-text-secondary border border-edge rounded px-2 py-0.5">
                Juego básico
              </span>
              <span className="text-xs uppercase tracking-wide text-text-secondary border border-edge rounded px-2 py-0.5">
                Deportes
              </span>
            </div>
            <h3 className="font-bold">{product.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-white">{product.price}</span>
              {product.discountBadge !== undefined && (
                <span className="text-xs uppercase bg-primary text-black rounded px-2 py-0.5">
                  {product.discountBadge}
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ProductGrid;
