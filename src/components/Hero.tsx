import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { buildWhatsAppLink } from "@/lib/site";

const heroBackground = "/hero-background.webp";

const whatsappLink = buildWhatsAppLink(
  "Olá! Vim pelo site da Ventucci e quero fazer um pedido com preço de atacado. Pode me atender agora?",
);

const Hero = () => {
  return (
    <>
      {/* HERO: apenas a imagem, completa e limpa */}
      <section id="inicio" className="relative w-full overflow-hidden bg-background">
        <img
          src={heroBackground}
          alt="Distribuidora Ventucci"
          className="block h-auto w-full will-change-transform animate-ken-burns motion-reduce:animate-none"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        {/* Escurecimento sutil de 8% sobre a imagem */}
        <div
          className="pointer-events-none absolute inset-0 bg-black/[0.08]"
          aria-hidden="true"
        />
        {/* Degrade preto profundo saindo da parte de baixo da imagem */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-ink via-ink/60 to-transparent sm:h-24 md:h-44"
          aria-hidden="true"
        />
      </section>

      {/* Bloco de chamada abaixo do hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-ink via-ink-soft to-ink pt-10 pb-14 sm:pt-12 sm:pb-20 md:pt-16 md:pb-24">
        {/* Vinheta sutil para reforçar contraste */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,hsl(var(--ink))_100%)]"
        />
        <div className="container relative">
          <div className="mx-auto max-w-4xl text-center">
            {/* Bloco de impacto: força + qualidade + preço */}
            <div>
              {/* Linhas decorativas */}
              <div className="mx-auto flex items-center justify-center gap-3 text-primary">
                <span className="h-px w-10 bg-primary/70 sm:w-16" />
                <span className="font-display text-xs uppercase tracking-[0.4em] text-primary sm:text-sm">
                  Ventucci
                </span>
                <span className="h-px w-10 bg-primary/70 sm:w-16" />
              </div>

              <h2 className="text-grunge mt-5 font-display uppercase leading-[0.92] tracking-[0.01em] text-white text-[44px] sm:mt-7 sm:text-6xl md:text-7xl lg:text-8xl">
                Força, Qualidade e
                <br />
                <span className="text-primary [text-shadow:0_2px_24px_hsl(var(--primary)/0.55)]">
                  Preço Baixo de Verdade
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-2xl font-display uppercase tracking-[0.18em] text-white/85 text-sm sm:mt-7 sm:text-lg md:text-xl">
                Bebidas direto do atacado,
                <br className="sm:hidden" />
                <span className="sm:before:content-['_']" /> com entrega rápida e confiável
              </p>
            </div>

            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:mt-12 sm:flex-row sm:items-center sm:gap-4 md:mt-14">
              <Link
                to="/catalogo"
                className="btn-snake group inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold shadow-card-hover transition-smooth hover:-translate-y-1 hover:shadow-2xl sm:w-auto sm:px-7 sm:py-4 sm:text-base"
              >
                <span className="inline-flex items-center gap-2">
                  Ver Catálogo
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
                </span>
              </Link>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-snake btn-snake-light btn-snake-hlines group inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold transition-smooth hover:-translate-y-1 sm:w-auto sm:px-7 sm:py-4 sm:text-base"
              >
                <span className="inline-flex items-center gap-2">
                  <svg viewBox="0 0 32 32" className="h-5 w-5 text-whatsapp" fill="currentColor" aria-hidden="true">
                    <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.738 3.41 4.673 4.443.616.33 2.794 1.118 3.482 1.118.817 0 2.336-.516 2.68-1.318.144-.33.187-.704.187-1.06 0-.5-1.46-1.247-1.74-1.247m-2.522 5.96h-.006a8.305 8.305 0 0 1-4.225-1.158l-.302-.18-3.135.821.838-3.06-.196-.31a8.255 8.255 0 0 1-1.27-4.402c.003-4.566 3.72-8.282 8.305-8.282a8.245 8.245 0 0 1 5.873 2.435 8.196 8.196 0 0 1 2.43 5.853c-.005 4.567-3.722 8.283-8.312 8.283m7.067-15.331A11.764 11.764 0 0 0 16.583 4.4C10.05 4.4 4.733 9.715 4.73 16.247c0 2.087.546 4.124 1.583 5.92L4.63 28.16l6.13-1.608a11.86 11.86 0 0 0 5.668 1.443h.005c6.532 0 11.85-5.317 11.852-11.85a11.785 11.785 0 0 0-3.472-8.382" />
                  </svg>
                  Falar no WhatsApp
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
