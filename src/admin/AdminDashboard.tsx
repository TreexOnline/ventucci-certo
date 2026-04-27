import { useEffect, useMemo, useState } from "react";
import { Eye, MousePointerClick, Package, RefreshCw, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "./dashboard/StatCard";
import { TrafficChart, type TrafficPoint } from "./dashboard/TrafficChart";
import { CityList, type CityRow } from "./dashboard/CityList";
import { TopProducts, type TopProduct } from "./dashboard/TopProducts";

interface ViewRow {
  visitor_id: string;
  created_at: string;
  city: string | null;
  country_code: string | null;
}
interface ClickRow {
  product_name: string;
  created_at: string;
  city: string | null;
  country_code: string | null;
}

const AdminDashboard = () => {
  const [views, setViews] = useState<ViewRow[]>([]);
  const [clicks, setClicks] = useState<ClickRow[]>([]);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState<string | null>(null);

  useEffect(() => {
    void loadData();
    // Realtime: refresh dashboard when new visits / clicks / products land.
    let timer: number | undefined;
    const debouncedReload = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => void loadData(), 800);
    };
    const channel = supabase
      .channel("admin-dashboard-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "page_views" }, debouncedReload)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "product_clicks" }, debouncedReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, debouncedReload)
      .subscribe();
    return () => {
      if (timer) window.clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const sinceIso = since.toISOString();

    const [viewsRes, productsRes, clicksRes] = await Promise.all([
      supabase
        .from("page_views")
        .select("visitor_id, created_at, city, country_code")
        .gte("created_at", sinceIso)
        .limit(50000),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase
        .from("product_clicks")
        .select("product_name, created_at, city, country_code")
        .gte("created_at", sinceIso)
        .limit(50000),
    ]);

    setViews((viewsRes.data ?? []) as ViewRow[]);
    setClicks((clicksRes.data ?? []) as ClickRow[]);
    setProductCount(productsRes.count ?? 0);
    setLoading(false);
  };

  // Filter by selected city (applies to views & clicks for KPIs and charts).
  const filteredViews = useMemo(
    () => (cityFilter ? views.filter((v) => v.city === cityFilter) : views),
    [views, cityFilter],
  );
  const filteredClicks = useMemo(
    () => (cityFilter ? clicks.filter((c) => c.city === cityFilter) : clicks),
    [clicks, cityFilter],
  );

  const totalVisits = filteredViews.length;
  const uniqueVisitors = useMemo(
    () => new Set(filteredViews.map((v) => v.visitor_id)).size,
    [filteredViews],
  );
  const totalClicks = filteredClicks.length;

  // Daily traffic series (last 30 days, always full range).
  const daily = useMemo<TrafficPoint[]>(() => {
    const buckets = new Map<string, { visits: number; clicks: number }>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      buckets.set(d.toISOString().slice(0, 10), { visits: 0, clicks: 0 });
    }
    for (const v of filteredViews) {
      const k = v.created_at.slice(0, 10);
      const b = buckets.get(k);
      if (b) b.visits += 1;
    }
    for (const c of filteredClicks) {
      const k = c.created_at.slice(0, 10);
      const b = buckets.get(k);
      if (b) b.clicks += 1;
    }
    return Array.from(buckets.entries()).map(([date, v]) => ({
      date: date.slice(5).split("-").reverse().join("/"),
      visits: v.visits,
      clicks: v.clicks,
    }));
  }, [filteredViews, filteredClicks]);

  // City aggregation — never filtered, the list IS the filter UI.
  const cities = useMemo<CityRow[]>(() => {
    const map = new Map<string, CityRow>();
    for (const v of views) {
      if (!v.city) continue;
      const cur = map.get(v.city) ?? {
        city: v.city,
        country_code: v.country_code,
        visits: 0,
        clicks: 0,
      };
      cur.visits += 1;
      map.set(v.city, cur);
    }
    for (const c of clicks) {
      if (!c.city) continue;
      const cur = map.get(c.city) ?? {
        city: c.city,
        country_code: c.country_code,
        visits: 0,
        clicks: 0,
      };
      cur.clicks += 1;
      map.set(c.city, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.visits - a.visits || b.clicks - a.clicks);
  }, [views, clicks]);

  // Top products — respects city filter.
  const top = useMemo<TopProduct[]>(() => {
    const counts = new Map<string, number>();
    for (const c of filteredClicks) {
      counts.set(c.product_name, (counts.get(c.product_name) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, clicks]) => ({ name, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 8);
  }, [filteredClicks]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Últimos 30 dias{cityFilter ? ` · ${cityFilter}` : " · Todas as cidades"}
          </p>
        </div>
        <button
          onClick={() => void loadData()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold text-foreground/80 transition-smooth hover:border-primary/40 hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Visitas (30d)" value={totalVisits} icon={Eye} loading={loading} hint="1 por visitante/dia" />
        <StatCard label="Visitantes únicos" value={uniqueVisitors} icon={Users} loading={loading} hint="Fingerprint do dispositivo" />
        <StatCard label="Cliques 'Pedir agora'" value={totalClicks} icon={MousePointerClick} loading={loading} />
        <StatCard label="Produtos cadastrados" value={productCount} icon={Package} loading={loading} />
      </div>

      <TrafficChart data={daily} />

      <div className="grid gap-4 lg:grid-cols-2">
        <CityList rows={cities} selected={cityFilter} onSelect={setCityFilter} />
        <TopProducts rows={top} cityFilter={cityFilter} />
      </div>
    </div>
  );
};

export default AdminDashboard;
