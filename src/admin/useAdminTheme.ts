import { useEffect, useRef, useState } from "react";

const KEY = "ventucci_admin_theme";
type Theme = "light" | "dark";

/**
 * Persistent dark/light theme toggle scoped to the admin panel.
 * Toggles the `dark` class on <html> so Tailwind's `dark:` variants and
 * the .dark CSS tokens in index.css apply globally.
 * Restores the public site's previous theme when the admin unmounts.
 */
export function useAdminTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem(KEY) as Theme) ?? "dark";
  });

  // Capture the original <html> dark state ONCE on mount so the cleanup
  // doesn't get tricked by intermediate updates.
  const originalHadDark = useRef<boolean | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (originalHadDark.current === null) {
      originalHadDark.current = root.classList.contains("dark");
    }
    return () => {
      if (originalHadDark.current) root.classList.add("dark");
      else root.classList.remove("dark");
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem(KEY, theme);
  }, [theme]);

  return {
    theme,
    toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
  };
}