// Records page views and product clicks with basic per-IP rate limiting and IP geolocation.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Naive in-memory rate limiter (per cold-start instance). Good enough as anti-spam.
const hits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;

function rateLimit(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_PER_WINDOW) return false;
  entry.count += 1;
  return true;
}

function clip(s: unknown, max: number): string | null {
  if (typeof s !== "string") return null;
  return Array.from(s)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code > 31 && code !== 127;
    })
    .join("")
    .trim()
    .slice(0, max);
}

function isVisitorId(value: string | null): value is string {
  return !!value && /^[a-zA-Z0-9._:-]{8,100}$/.test(value);
}

function isUuid(value: string | null): value is string {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

// In-memory geo cache to avoid hammering ipapi.co (1k/day free tier).
type Geo = {
  city: string | null;
  region: string | null;
  country: string | null;
  country_code: string | null;
};
const geoCache = new Map<string, { value: Geo; expiresAt: number }>();
const GEO_TTL_MS = 24 * 60 * 60 * 1000; // 24h

async function lookupGeo(ip: string): Promise<Geo> {
  const empty: Geo = { city: null, region: null, country: null, country_code: null };
  if (!ip || ip === "unknown" || ip.startsWith("127.") || ip.startsWith("::1")) return empty;

  const cached = geoCache.get(ip);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { "User-Agent": "ventucci-analytics/1.0" },
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return empty;
    const j = await res.json();
    if (j?.error) return empty;
    const value: Geo = {
      city: typeof j.city === "string" ? j.city.slice(0, 100) : null,
      region: typeof j.region === "string" ? j.region.slice(0, 100) : null,
      country: typeof j.country_name === "string" ? j.country_name.slice(0, 100) : null,
      country_code: typeof j.country_code === "string" ? j.country_code.slice(0, 3) : null,
    };
    geoCache.set(ip, { value, expiresAt: Date.now() + GEO_TTL_MS });
    return value;
  } catch (err) {
    console.warn("geo lookup failed", err);
    return empty;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return new Response(JSON.stringify({ ok: false, error: "invalid_content_type" }), {
      status: 415,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("cf-connecting-ip") ??
      "unknown";
    if (!rateLimit(ip)) {
      return new Response(JSON.stringify({ ok: false, error: "rate_limited" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const type = body?.type;
    const visitorId = clip(body?.visitorId, 100);
    if (!isVisitorId(visitorId)) {
      return new Response(JSON.stringify({ ok: false, error: "invalid_visitor" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const geo = await lookupGeo(ip);

    if (type === "view") {
      const path = clip(body?.path, 200) ?? "/";
      if (!path.startsWith("/")) {
        return new Response(JSON.stringify({ ok: false, error: "invalid_path" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const userAgent = clip(req.headers.get("user-agent"), 500);
      const referrer = clip(body?.referrer, 500);
      // Idempotent per (visitor_id, view_date) thanks to the unique index.
      const { error } = await sb
        .from("page_views")
        .insert({
          visitor_id: visitorId,
          path,
          user_agent: userAgent,
          referrer,
          city: geo.city,
          region: geo.region,
          country: geo.country,
          country_code: geo.country_code,
        });
      // Code 23505 = unique_violation = visitor already counted today. Treat as success.
      if (error && (error as { code?: string }).code !== "23505") throw error;
    } else if (type === "click") {
      const productId = clip(body?.productId, 50);
      const productName = clip(body?.productName, 200);
      if (!productName) {
        return new Response(JSON.stringify({ ok: false, error: "invalid_product" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { error } = await sb.from("product_clicks").insert({
        product_id: isUuid(productId) ? productId : null,
        product_name: productName,
        visitor_id: visitorId,
        city: geo.city,
        region: geo.region,
        country: geo.country,
        country_code: geo.country_code,
      });
      if (error) throw error;
    } else {
      return new Response(JSON.stringify({ ok: false, error: "invalid_type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("track-event error:", msg);
    return new Response(JSON.stringify({ ok: false, error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
