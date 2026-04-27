import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PublicProduct {
  id: string;
  name: string;
  details: string;
  price: number;
  price_retail: number | null;
  image_url: string | null;
  category: string;
  product_group: string;
  is_featured: boolean;
  sort_order: number;
}

const PRODUCTS_KEY = ["products", "public"] as const;

const fetchPublicProducts = async (): Promise<PublicProduct[]> => {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, details, price, price_retail, image_url, category, sort_order, product_group, is_featured",
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    details: p.details,
    price: Number(p.price),
    price_retail:
      (p as { price_retail?: number | string | null }).price_retail != null
        ? Number((p as { price_retail: number | string }).price_retail)
        : null,
    image_url: p.image_url,
    category: p.category,
    product_group: (p as { product_group?: string }).product_group ?? "Bebidas",
    is_featured: !!(p as { is_featured?: boolean }).is_featured,
    sort_order: Number((p as { sort_order?: number }).sort_order ?? 0),
  }));
};

/**
 * Shared products hook.
 * - Caches results across pages (React Query).
 * - Subscribes to Realtime so any admin change reflects immediately.
 */
export const useProducts = () => {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: PRODUCTS_KEY,
    queryFn: fetchPublicProducts,
    staleTime: 60_000,
  });

  useEffect(() => {
    const channel = supabase
      .channel("public-products-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          qc.invalidateQueries({ queryKey: PRODUCTS_KEY });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);

  return query;
};

export const PRODUCTS_QUERY_KEY = PRODUCTS_KEY;