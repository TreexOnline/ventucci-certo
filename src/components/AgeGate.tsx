import { useEffect, useState } from "react";
import { Wine, ShieldCheck } from "lucide-react";
import logo from "@/assets/logo-ventucci.webp";

const STORAGE_KEY = "ventucci_age_confirmed";

const AgeGate = () => {
  const [open, setOpen] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    const confirmed = localStorage.getItem(STORAGE_KEY);
    if (!confirmed) setOpen(true);
  }, []);

  const confirm = () => {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-foreground/70 backdrop-blur-md" />

      {/* Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-card shadow-card-hover animate-scale-in">
        {/* Top brand band */}
        <div className="relative flex h-32 items-center justify-center gradient-hero">
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 40%, white 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <img
            src={logo}
            alt="Ventucci Distribuidora"
            className="relative z-10 h-20 w-auto drop-shadow-2xl"
          />
        </div>

        <div className="px-6 py-7 text-center md:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
            Verificação de idade
          </div>

          <h2
            id="age-gate-title"
            className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl"
          >
            Você tem mais de 18 anos?
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            A venda e o consumo de bebidas alcoólicas são proibidos para menores
            de 18 anos. Confirme sua idade para acessar o catálogo.
          </p>

          {denied ? (
            <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
              <Wine className="mx-auto mb-2 h-7 w-7 text-destructive" strokeWidth={2.5} />
              <p className="text-sm font-semibold text-foreground">
                Acesso restrito
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Este site é exclusivo para maiores de 18 anos.
              </p>
            </div>
          ) : (
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={confirm}
                className="flex-1 rounded-full gradient-red px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-red transition-smooth hover:shadow-red-strong hover:-translate-y-0.5"
              >
                Sim, sou maior de 18
              </button>
              <button
                onClick={() => setDenied(true)}
                className="flex-1 rounded-full border-2 border-border bg-card px-5 py-3.5 text-sm font-bold text-foreground transition-smooth hover:border-foreground/30"
              >
                Não sou
              </button>
            </div>
          )}

          <p className="mt-5 text-[11px] uppercase tracking-wider text-muted-foreground">
            Beba com moderação
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgeGate;
