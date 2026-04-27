import { useMemo, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import Fuse from "fuse.js";
import ProductCard from "./ProductCard";
import { useProducts, type PublicProduct } from "@/hooks/useProducts";
import { useCatalogPricesVisible } from "@/hooks/useSiteSettings";

type Product = PublicProduct;

const MAIN_GROUPS = ["Bebidas", "Mercearia", "Limpeza"] as const;

const Catalog = () => {
  const { data: products = [], isLoading: loading } = useProducts();
  const { data: pricesVisible = true } = useCatalogPricesVisible();
  const [activeGroup, setActiveGroup] = useState<string>("Bebidas");
  const [search, setSearch] = useState<string>("");

  const byGroup = useMemo(
    () => products.filter((p) => p.product_group === activeGroup),
    [products, activeGroup],
  );

  const fuse = useMemo(
    () =>
      new Fuse(byGroup, {
        keys: [
          { name: "name", weight: 0.7 },
          { name: "category", weight: 0.2 },
          { name: "details", weight: 0.1 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
        includeScore: true,
        minMatchCharLength: 2,
      }),
    [byGroup],
  );

  const visible = useMemo(() => {
    const q = search.trim();
    if (!q) return byGroup;
    return fuse.search(q).map((r) => r.item);
  }, [search, byGroup, fuse]);

  const visibleIndex = useMemo(() => new Map(visible.map((p, index) => [p.id, index])), [visible]);

  // Agrupa produtos visíveis por subcategoria preservando a ordem
  const grouped = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of visible) {
      const list = map.get(p.category) ?? [];
      list.push(p);
      map.set(p.category, list);
    }
    return Array.from(map.entries()); // [ [category, products[]], ... ]
  }, [visible]);

  return (
    <section id="catalogo" className="relative py-12 sm:py-20 md:py-28">
      <div className="container">
        <div className="mb-8 text-center sm:mb-12 md:mb-16">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            Nosso Catálogo
          </span>
          <h2 className="mx-auto max-w-2xl text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl md:text-5xl">
            Os melhores produtos com{" "}
            <span className="text-gradient-red">preço de atacado</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:mt-4 sm:text-base md:text-lg">
            Cervejas, destilados, refrigerantes e muito mais. Selecione e peça direto pelo WhatsApp.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap justify-center gap-2 sm:mb-10 sm:gap-3">
          {MAIN_GROUPS.map((group) => (
            <button
              key={group}
              onClick={() => {
                setActiveGroup(group);
                setSearch("");
              }}
              className={`rounded-md px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider transition-smooth sm:px-6 sm:py-3 sm:text-sm ${
                activeGroup === group
                  ? "bg-foreground text-background shadow-card"
                  : "border-2 border-border bg-card text-foreground/70 hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {group}
            </button>
          ))}
        </div>

        <div className="mx-auto mb-8 max-w-xl sm:mb-10">
          <div className="group relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary sm:left-4 sm:h-5 sm:w-5"
              strokeWidth={2.5}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produto..."
              aria-label="Buscar produto"
              className="h-12 w-full rounded-full border-2 border-border bg-card pl-10 pr-10 text-base font-medium text-foreground shadow-sm outline-none transition-smooth placeholder:text-muted-foreground/70 focus:border-primary focus:shadow-red sm:h-14 sm:pl-12 sm:pr-12"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Limpar busca"
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" strokeWidth={2.5} />
              </button>
            )}
          </div>
          {search && (
            <p className="mt-3 text-center text-sm text-muted-foreground">
              {visible.length === 0
                ? "Nenhum produto encontrado"
                : `${visible.length} ${visible.length === 1 ? "produto encontrado" : "produtos encontrados"}`}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : visible.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">
            Nenhum produto disponível no momento.
          </p>
        ) : (
          <div className="space-y-10 sm:space-y-14">
            {grouped.map(([category, items]) => (
              <div key={category}>
                <div className="mb-4 flex items-center gap-2 sm:mb-6 sm:gap-4">
                  <h3 className="text-lg font-extrabold tracking-tight text-foreground sm:text-2xl md:text-3xl">
                    {category}
                  </h3>
                  <div className="h-1 flex-1 rounded-full gradient-red opacity-80" />
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:text-xs">
                    {items.length} {items.length === 1 ? "item" : "itens"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
                  {items.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      details={product.details}
                      price={product.price}
                      priceRetail={product.price_retail}
                      image={product.image_url}
                      category={product.category}
                      showPrices={pricesVisible}
                      priority={(visibleIndex.get(product.id) ?? i) < 4}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Catalog;
