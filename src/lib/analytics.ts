import { supabase } from "@/integrations/supabase/client";
import { getVisitorId } from "./site";

// Local guard so we don't hit the function repeatedly within the same tab.
// Real per-day uniqueness is enforced server-side via a unique index.
const DAY_KEY = "ventucci_view_day";

const today = () => new Date().toISOString().slice(0, 10);

export const recordPageView = async () => {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(DAY_KEY) === today()) return;

  try {
    const visitorId = await getVisitorId();
    await supabase.functions.invoke("track-event", {
      body: {
        type: "view",
        visitorId,
        path: window.location.pathname,
        referrer: document.referrer || null,
      },
    });
    localStorage.setItem(DAY_KEY, today());
  } catch (err) {
    console.warn("Failed to record page view", err);
  }
};

export const recordProductClick = async (productId: string | null, productName: string) => {
  try {
    const visitorId = await getVisitorId();
    await supabase.functions.invoke("track-event", {
      body: {
        type: "click",
        visitorId,
        productId,
        productName,
      },
    });
  } catch (err) {
    console.warn("Failed to record product click", err);
  }
};
