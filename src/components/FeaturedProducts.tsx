import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Loader2 } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useCatalogPricesVisible } from "@/hooks/useSiteSettings";

const FeaturedProducts = () => {
  const { data: all = [], isLoading: loading } = useProducts();
  const { data: pricesVisible = true } = useCatalogPricesVisible();
  const products = useMemo(
    () => all.filter((p) => p.is_featured).slice(0, 8),
    [all],
  );

  if (!loading && products.length === 0) return null;

  return (
    <section className="relative bg-background py-12 sm:py-16 md:py-24">
      <div className="container">
        <div className="mb-8 flex flex-col items-center text-center sm:mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
            <span>Produtos em Destaque</span>
          </div>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Selecionados para você
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Os produtos mais pedidos e com os melhores preços de atacado.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p, i) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  details={p.details}
                  price={p.price}
                  priceRetail={p.price_retail}
                  image={p.image_url}
                  category={p.category}
                  showPrices={pricesVisible}
                  priority={i < 4}
                />
              ))}
            </div>

            <div className="mt-10 flex justify-center sm:mt-12">
              <Link
                to="/catalogo"
                className="btn-snake group inline-flex w-full max-w-xs items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold transition-smooth hover:-translate-y-1 sm:w-auto sm:px-7 sm:py-4 sm:text-base"
              >
                <span className="inline-flex items-center gap-2">
                  Ver catálogo completo
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
                </span>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
