import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { Loader2, LogOut, LayoutDashboard, Package, ShieldCheck, Moon, Sun } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-ventucci.webp";
import { useAdminTheme } from "./useAdminTheme";

const AdminLayout = () => {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggle } = useAdminTheme();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setAuthed(false);
        setIsAdmin(false);
      } else {
        setAuthed(true);
        // Defer the role check to avoid deadlocks inside the auth callback.
        setTimeout(() => verifyAdmin(session.user.id), 0);
      }
    });

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setAuthed(true);
        await verifyAdmin(data.session.user.id);
      }
      setChecking(false);
    })();

    return () => sub.subscription.unsubscribe();
  }, []);

  const verifyAdmin = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    setIsAdmin(!!data && !error);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!authed) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="max-w-md text-muted-foreground">
          Sua conta não tem permissão de administrador.
        </p>
        <button
          onClick={handleLogout}
          className="rounded-full gradient-red px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-red"
        >
          Sair
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-secondary/40">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-20 items-center border-b border-border px-5">
          <img src={logo} alt="Ventucci" className="h-9 w-auto" />
        </div>
        <nav className="flex-1 space-y-1 p-3">
          <NavItem to="/admin" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" exact />
          <NavItem to="/admin/products" icon={<Package className="h-4 w-4" />} label="Produtos" />
          <NavItem to="/admin/audit" icon={<ShieldCheck className="h-4 w-4" />} label="Audit Log" />
        </nav>
        <div className="space-y-2 p-3">
          <button
            onClick={toggle}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground/80 transition-smooth hover:border-primary/40 hover:text-foreground"
            aria-label="Alternar tema"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? "Modo claro" : "Modo escuro"}
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground/80 transition-smooth hover:border-primary/40 hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-5 md:hidden">
          <img src={logo} alt="Ventucci" className="h-8 w-auto" />
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              aria-label="Alternar tema"
              className="inline-flex items-center justify-center rounded-lg border border-border p-1.5"
            >
              {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold"
            >
              <LogOut className="h-3.5 w-3.5" /> Sair
            </button>
          </div>
        </header>
        <main className="p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const NavItem = ({
  to,
  icon,
  label,
  exact,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  exact?: boolean;
}) => {
  const location = useLocation();
  const active = exact ? location.pathname === to : location.pathname.startsWith(to);
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-smooth ${
        active
          ? "bg-primary/10 text-primary"
          : "text-foreground/70 hover:bg-secondary hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
};

export default AdminLayout;
