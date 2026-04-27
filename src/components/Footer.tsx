import { MapPin, Phone, Clock } from "lucide-react";
import logo from "@/assets/logo-ventucci.webp";
import { buildWhatsAppLink } from "@/lib/site";

const whatsappLink = buildWhatsAppLink(
  "Olá! Quero falar com um vendedor da Ventucci para montar meu pedido e receber o melhor preço de atacado.",
);

const Footer = () => {
  return (
    <footer id="contato" className="relative mt-16 border-t border-border/60 bg-foreground text-background sm:mt-20">
      <div className="container py-10 sm:py-14">
        <div className="grid gap-8 sm:gap-10 md:grid-cols-3">
          <div>
            <div className="inline-flex items-center justify-center rounded-2xl bg-white p-3 shadow-card">
              <img src={logo} alt="Ventucci Distribuidora" className="h-12 w-auto" />
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-background/70">
              Mais de 38 anos distribuindo bebidas com qualidade e o melhor preço para bares,
              restaurantes e comércios da região.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider">Contato</h3>
            <ul className="space-y-3 text-sm text-background/80">
              <li className="flex items-start gap-3 break-words">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary-glow" strokeWidth={2.5} />
                <span>(18) 99191-3165</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-glow" strokeWidth={2.5} />
                <span>Atendimento em toda a região</span>
              </li>
              <li className="flex items-start gap-3 break-words">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary-glow" strokeWidth={2.5} />
                <span>Seg a Sex — 07:30 às 17:00 | Sáb — 07:30 às 11:00</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider">Atendimento Rápido</h3>
            <p className="mb-4 text-sm text-background/70">
              Faça seu pedido agora mesmo direto pelo WhatsApp e receba com agilidade.
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-snake btn-snake-red inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-bold transition-smooth hover:-translate-y-0.5 sm:w-auto"
            >
              <span>Falar com Vendedor</span>
            </a>
          </div>
        </div>

        <div className="mt-10 border-t border-background/10 pt-6 text-center text-[11px] leading-relaxed text-background/50 sm:mt-12 sm:text-xs">
          © {new Date().getFullYear()} Ventucci Distribuidora. Todos os direitos reservados. Beba com moderação. Proibida a venda para menores de 18 anos.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
