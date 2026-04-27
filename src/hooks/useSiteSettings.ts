import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const SITE_SETTINGS_QUERY_KEY = ["site-settings", "catalog-pricing"] as const;

type SiteSettingsRow = {
  value: { prices_visible?: boolean } | null;
};

const siteSettingsClient = supabase as unknown as {
  from: (table: "site_settings") => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => Promise<{ data: SiteSettingsRow | null; error: Error | null }>;
      };
    };
    upsert: (
      values: { key: string; value: { prices_visible: boolean } },
      options: { onConflict: string },
    ) => Promise<{ error: Error | null }>;
  };
};

const fetchCatalogPricesVisible = async (): Promise<boolean> => {
  const { data, error } = await siteSettingsClient
    .from("site_settings")
    .select("value")
    .eq("key", "catalog_pricing")
    .maybeSingle();

  if (error) throw error;
  return data?.value?.prices_visible !== false;
};

export const useCatalogPricesVisible = () => {
  return useQuery({
    queryKey: SITE_SETTINGS_QUERY_KEY,
    queryFn: fetchCatalogPricesVisible,
    staleTime: 15_000,
    refetchInterval: 15_000,
  });
};

export const updateCatalogPricesVisible = async (pricesVisible: boolean) => {
  const { error } = await siteSettingsClient
    .from("site_settings")
    .upsert(
      { key: "catalog_pricing", value: { prices_visible: pricesVisible } },
      { onConflict: "key" },
    );

  if (error) throw error;
};