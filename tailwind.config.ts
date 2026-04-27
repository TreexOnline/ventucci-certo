import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ['"Bebas Neue"', "Impact", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          dark: "hsl(var(--primary-dark))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        whatsapp: {
          DEFAULT: "hsl(var(--whatsapp))",
          foreground: "hsl(var(--whatsapp-foreground))",
        },
        ink: {
          DEFAULT: "hsl(var(--ink))",
          soft: "hsl(var(--ink-soft))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pulse-soft": {
          "0%, 100%": { transform: "scale(1)", boxShadow: "0 8px 24px -4px hsl(142 70% 49% / 0.55)" },
          "50%": { transform: "scale(1.06)", boxShadow: "0 12px 32px -4px hsl(142 70% 49% / 0.7)" },
        },
        "ken-burns": {
          "0%":   { transform: "scale(1) translate(0, 0)" },
          "50%":  { transform: "scale(1.06) translate(-0.5%, -0.5%)" },
          "100%": { transform: "scale(1) translate(0, 0)" },
        },
        "shine-sweep": {
          "0%": { transform: "translateX(-150%) skewX(-20deg)", opacity: "0" },
          "10%": { opacity: "1" },
          "40%": { transform: "translateX(250%) skewX(-20deg)", opacity: "1" },
          "40.01%, 100%": { transform: "translateX(250%) skewX(-20deg)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "pulse-soft": "pulse-soft 2.5s ease-in-out infinite",
        "ken-burns": "ken-burns 22s ease-in-out infinite",
        "shine-sweep": "shine-sweep 6s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
