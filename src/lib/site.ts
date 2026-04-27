// Centralized helpers shared across the site.
import FingerprintJS from "@fingerprintjs/fingerprintjs";

export const WHATSAPP_NUMBER = "5518991913165";

export const buildWhatsAppLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const VISITOR_KEY = "ventucci_visitor_id";
const VISITOR_FP_KEY = "ventucci_visitor_fp";

let fpPromise: Promise<string> | null = null;

/**
 * Returns a stable visitor identifier derived from a browser fingerprint.
 * Falls back to a random UUID if fingerprinting fails.
 * The result is cached in localStorage so subsequent calls are instant
 * AND identical across browser sessions on the same device.
 */
export const getVisitorId = async (): Promise<string> => {
  if (typeof window === "undefined") return "ssr";

  // Fast path — cached fingerprint.
  const cached = localStorage.getItem(VISITOR_FP_KEY);
  if (cached) return cached;

  if (!fpPromise) {
    fpPromise = (async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const id = `fp_${result.visitorId}`;
        localStorage.setItem(VISITOR_FP_KEY, id);
        return id;
      } catch {
        // Fallback: legacy random ID (preserves any existing one).
        let id = localStorage.getItem(VISITOR_KEY);
        if (!id) {
          id = crypto.randomUUID?.() ?? `v_${Date.now()}_${Math.random().toString(36).slice(2)}`;
          localStorage.setItem(VISITOR_KEY, id);
        }
        localStorage.setItem(VISITOR_FP_KEY, id);
        return id;
      }
    })();
  }
  return fpPromise;
};
