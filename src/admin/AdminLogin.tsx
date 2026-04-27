import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-ventucci.webp";

const schema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(6, "Senha muito curta").max(200),
});

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) navigate("/admin", { replace: true });
    })();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setSubmitting(false);
    if (authError) {
      setError("Credenciais inválidas. Verifique e tente novamente.");
      return;
    }
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
    navigate(from && from.startsWith("/admin") ? from : "/admin", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-card-hover">
        <div className="relative flex h-28 items-center justify-center gradient-hero">
          <img src={logo} alt="Ventucci" className="relative z-10 h-16 w-auto drop-shadow-2xl" />
        </div>
        <div className="px-8 py-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Painel administrativo
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Acessar painel
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Entre com suas credenciais para gerenciar o catálogo.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground/70">
                E-mail
              </label>
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium outline-none transition-smooth focus:border-primary"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground/70">
                Senha
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium outline-none transition-smooth focus:border-primary"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full gradient-red px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-red transition-smooth hover:shadow-red-strong disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
