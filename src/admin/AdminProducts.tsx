import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Trash2, X, Search, Eye, EyeOff } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { optimizeProductImage, resolveProductImage } from "@/lib/productImage";
import { formatBRL } from "@/lib/site";
import { logAdminAction } from "@/lib/audit";
import { ProductForm, PRODUCT_GROUPS, type ProductGroup } from "./products/ProductForm";
import { PRODUCTS_QUERY_KEY } from "@/hooks/useProducts";
import { SITE_SETTINGS_QUERY_KEY, updateCatalogPricesVisible, useCatalogPricesVisible } from "@/hooks/useSiteSettings";

interface Product {
  id: string;
  name: string;
  category: string;
  details: string;
  price: number;
  price_retail: number | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  is_featured: boolean;
  product_group: ProductGroup;
}

const empty = {
  name: "",
  category: "",
  details: "",
  price: 0,
  price_retail: null as number | null,
  sort_order: 0,
  is_active: true,
  is_featured: false,
  image_url: null as string | null,
  product_group: "Bebidas" as ProductGroup,
};

const toAdminImageSrc = (url: string | null): string => {
  const resolved = resolveProductImage(url);
  return resolved.startsWith("http") ? optimizeProductImage(resolved, 400, 86) : resolved;
};

const AdminProducts = () => {
  const qc = useQueryClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState<ProductGroup | "Todos">("Todos");
  const [categoryFilter, setCategoryFilter] = useState<string>("Todas");
  const { data: pricesVisible = true, isLoading: loadingPrices } = useCatalogPricesVisible();

  useEffect(() => {
    void load();
    // Realtime: any change in products (from this admin OR another tab) refreshes both
    // the admin list and the public site cache.
    const channel = supabase
      .channel("admin-products-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          void load();
          qc.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true });
    if (!error && data) {
      setProducts(
        data.map((p) => ({
          ...p,
          price: Number(p.price),
          price_retail:
            (p as { price_retail?: number | string | null }).price_retail != null
              ? Number((p as { price_retail: number | string }).price_retail)
              : null,
        })) as Product[],
      );
    }
    setLoading(false);
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(`Remover "${p.name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) {
      alert("Erro ao remover: " + error.message);
      return;
    }
    void logAdminAction({
      action: "delete",
      entityType: "product",
      entityId: p.id,
      metadata: { name: p.name, category: p.category },
    });
    void load();
    qc.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
  };

  const handleTogglePrices = async () => {
    try {
      await updateCatalogPricesVisible(!pricesVisible);
      qc.invalidateQueries({ queryKey: SITE_SETTINGS_QUERY_KEY });
    } catch (err) {
      alert("Erro ao alterar preços: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Derive filter options + filtered/grouped data.
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (groupFilter === "Todos" || p.product_group === groupFilter) {
        if (p.category) set.add(p.category);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [products, groupFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (groupFilter !== "Todos" && p.product_group !== groupFilter) return false;
      if (categoryFilter !== "Todas" && p.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.details.toLowerCase().includes(q)
      );
    });
  }, [products, search, groupFilter, categoryFilter]);

  // Group filtered products by category for display.
  const grouped = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of filtered) {
      const arr = map.get(p.category) ?? [];
      arr.push(p);
      map.set(p.category, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, "pt-BR"));
  }, [filtered]);

  // Reset category if it disappears after switching group.
  useEffect(() => {
    if (categoryFilter !== "Todas" && !allCategories.includes(categoryFilter)) {
      setCategoryFilter("Todas");
    }
  }, [allCategories, categoryFilter]);

  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = { Todos: products.length };
    for (const g of PRODUCT_GROUPS) counts[g] = 0;
    for (const p of products) counts[p.product_group] = (counts[p.product_group] ?? 0) + 1;
    return counts;
  }, [products]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
            Produtos
          </h1>
          <p className="text-sm text-muted-foreground">
            {products.length} no total · {filtered.length} exibidos
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleTogglePrices}
            disabled={loadingPrices}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-extrabold uppercase tracking-wider text-primary-foreground shadow-red transition-smooth hover:bg-primary-dark hover:shadow-red-strong disabled:opacity-60"
          >
            {pricesVisible ? <Eye className="h-4 w-4" strokeWidth={2.5} /> : <EyeOff className="h-4 w-4" strokeWidth={2.5} />}
            Produtos têm preço
          </button>
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 rounded-full gradient-red px-5 py-3 text-sm font-bold text-primary-foreground shadow-red transition-smooth hover:shadow-red-strong"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Novo produto
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-card">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, categoria ou descrição..."
            className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-10 text-sm font-medium outline-none transition-colors focus:border-primary"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-secondary"
              aria-label="Limpar busca"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {(["Todos", ...PRODUCT_GROUPS] as const).map((g) => {
            const active = groupFilter === g;
            return (
              <button
                key={g}
                onClick={() => setGroupFilter(g)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-smooth ${
                  active
                    ? "border-transparent gradient-red text-primary-foreground shadow-red"
                    : "border-border bg-background text-foreground/70 hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {g}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                    active ? "bg-white/20" : "bg-secondary"
                  }`}
                >
                  {groupCounts[g] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        {allCategories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 border-t border-border pt-3">
            <button
              onClick={() => setCategoryFilter("Todas")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-smooth ${
                categoryFilter === "Todas"
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/60 hover:bg-secondary"
              }`}
            >
              Todas as categorias
            </button>
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-smooth ${
                  categoryFilter === cat
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/60 hover:bg-secondary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : grouped.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
          <p className="text-sm font-semibold text-foreground">Nenhum produto encontrado</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ajuste os filtros ou tente outra busca.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([category, items]) => (
            <section key={category}>
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
                  {category}
                </h2>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  {items.length}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                  <article
                    key={p.id}
                    className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
                  >
                    <div className="relative flex aspect-video items-center justify-center bg-secondary p-4">
                <img
                  src={toAdminImageSrc(p.image_url)}
                  alt={p.name}
                  className="h-full w-auto object-contain"
                />
                {!p.is_active && (
                  <span className="absolute top-2 left-2 rounded-full bg-foreground/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-background">
                    Inativo
                  </span>
                )}
                {p.is_featured && (
                  <span className="absolute top-2 right-2 rounded-full gradient-red px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-red">
                    Destaque
                  </span>
                )}
                    </div>
                    <div className="space-y-3 p-4">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-foreground/60">
                      {p.product_group}
                    </span>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      {p.category}
                    </p>
                  </div>
                  <h3 className="text-base font-bold text-foreground line-clamp-1">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">{p.details}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-lg font-extrabold text-primary">
                    {formatBRL(p.price)}
                    <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Revendedor
                    </span>
                  </p>
                  {p.price_retail != null && p.price_retail > 0 && (
                    <p className="text-xs font-semibold text-muted-foreground">
                      {formatBRL(p.price_retail)}
                      <span className="ml-1 text-[10px] font-bold uppercase tracking-wider">
                        Avulso
                      </span>
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(p)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold transition-smooth hover:border-primary/40"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </button>
                  <button
                    onClick={() => void handleDelete(p)}
                    className="inline-flex items-center justify-center rounded-lg border border-destructive/30 px-3 py-2 text-xs font-bold text-destructive transition-smooth hover:bg-destructive/5"
                    aria-label="Remover"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {(editing || creating) && (
        <ProductForm
          initial={editing ?? { ...empty, id: "" }}
          isNew={creating}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={() => {
            setEditing(null);
            setCreating(false);
            void load();
            qc.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
          }}
        />
      )}
    </div>
  );
};

export default AdminProducts;

