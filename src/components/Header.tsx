import { Handshake, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo-ventucci.webp";

interface HeaderProps {
  /** When true, header is absolute + transparent (used over the hero image). */
  transparent?: boolean;
}

const Header = ({ transparent = false }: HeaderProps) => {
  // Modo `transparent` aqui significa "estilo escuro" — header sólido preto
  // brilhante, sticky, que rola junto com a página.
  const wrapperClass = transparent
    ? "sticky top-0 z-40 w-full border-b border-white/10 bg-ink shadow-header"
    : "sticky top-0 z-40 w-full border-b border-border/60 bg-white/90 backdrop-blur-md shadow-header";
  const linkClass = transparent
    ? "text-sm font-semibold text-white/85 transition-smooth hover:text-primary-glow"
    : "text-sm font-semibold text-foreground/80 transition-smooth hover:text-primary";
  const tagClass = transparent
    ? "hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70 md:inline"
    : "hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground md:inline";

  return (
    <header className={wrapperClass}>
      <div className="container flex h-16 items-center justify-between gap-2 md:h-20 md:gap-4">
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <img
            src={logo}
            alt="Ventucci Distribuidora"
            className="h-[3.16rem] w-auto drop-shadow-lg md:h-[4.43rem]"
          />
          <span className={tagClass}>
            Distribuidora
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/" className={linkClass}>
            Início
          </Link>
          <Link to="/catalogo" className={linkClass}>
            Catálogo
          </Link>
          <a href="#contato" className={linkClass}>
            Contato
          </a>
        </nav>

        <Link
          to="/catalogo"
          className="btn-snake btn-snake-red group relative inline-flex shrink-0 items-center gap-1.5 px-3.5 py-2.5 text-[11px] font-extrabold uppercase tracking-wide transition-smooth hover:-translate-y-0.5 sm:gap-2 sm:px-6 sm:py-3 sm:text-sm"
        >
          <span className="inline-flex items-center gap-1.5 sm:gap-2">
            <Handshake className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />
            Virar Parceiro
            <Sparkles className="hidden h-3.5 w-3.5 opacity-80 transition-transform group-hover:rotate-12 sm:inline-block" strokeWidth={2.5} />
          </span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
