import heineken from "@/assets/heineken.webp";
import brahma from "@/assets/brahma.webp";
import skol from "@/assets/skol.webp";
import coca from "@/assets/coca.webp";
import smirnoff from "@/assets/smirnoff.webp";
import redbull from "@/assets/redbull.webp";
import jack from "@/assets/jack.webp";
import agua from "@/assets/agua.webp";
import placeholder from "@/assets/heineken.webp";

// Maps old seed paths to bundled WebP assets so existing database URLs keep working.
const SEED_MAP: Record<string, string> = {
  "/src/assets/heineken.jpg": heineken,
  "/src/assets/heineken.webp": heineken,
  "/src/assets/brahma.jpg": brahma,
  "/src/assets/brahma.webp": brahma,
  "/src/assets/skol.jpg": skol,
  "/src/assets/skol.webp": skol,
  "/src/assets/coca.jpg": coca,
  "/src/assets/coca.webp": coca,
  "/src/assets/smirnoff.jpg": smirnoff,
  "/src/assets/smirnoff.webp": smirnoff,
  "/src/assets/redbull.jpg": redbull,
  "/src/assets/redbull.webp": redbull,
  "/src/assets/jack.jpg": jack,
  "/src/assets/jack.webp": jack,
  "/src/assets/agua.jpg": agua,
  "/src/assets/agua.webp": agua,
};

export const resolveProductImage = (url: string | null | undefined): string => {
  if (!url) return placeholder;
  if (SEED_MAP[url]) return SEED_MAP[url];
  return url;
};

/**
 * Rewrites a Supabase Storage URL to use the on-the-fly image transformation
 * endpoint (resize + quality + format). This makes thumbnails dramatically
 * smaller and lets the browser cache the resized variant.
 *
 * Falls back to the original URL when the input is not a Supabase Storage URL
 * (e.g. bundled assets, external URLs).
 */
export const optimizeProductImage = (
  url: string,
  width = 400,
  quality = 86,
): string => {
  if (!url) return url;
  // Only rewrite the canonical "object/public/<bucket>/..." form.
  const marker = "/storage/v1/object/public/";
  const idx = url.indexOf(marker);
  if (idx === -1) return url;
  const base = url.slice(0, idx);
  const rest = url.slice(idx + marker.length); // <bucket>/<path>
  return `${base}/storage/v1/render/image/public/${rest}?width=${width}&quality=${quality}&resize=contain&format=webp`;
};
