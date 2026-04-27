import { memo } from "react";
import { ShoppingBag, Handshake, User } from "lucide-react";
import { buildWhatsAppLink, formatBRL } from "@/lib/site";
import { recordProductClick } from "@/lib/analytics";
import { resolveProductImage, optimizeProductImage } from "@/lib/productImage";

interface ProductCardProps {
  id: string;
  name: string;
  details: string;
  price: number;
  priceRetail?: number | null;
  image: string | null;
  category: string;
  showPrices?: boolean;
  /**
   * When true, this card is above-the-fold (first row). The image will be
   * preloaded eagerly with high fetch priority. Subsequent cards lazy-load.
   */
  priority?: boolean;
}

const ProductCard = ({ id, name, details, price, priceRetail, image, category, showPrices = true, priority = false }: ProductCardProps) => {
  const formattedPrice = formatBRL(price);
  const priceText = showPrices ? ` - ${formattedPrice}` : "";
  const whatsappLink = buildWhatsAppLink(
    `Olá! Tenho interesse neste produto do site da Ventucci: ${name} (${details})${priceText}. Consegue confirmar disponibilidade e fechar meu pedido?`,
  );
  const resolved = resolveProductImage(image);
  const isRemote = resolved.startsWith("http");
  // Use the image-transform CDN to ship thumbnail-sized WebP images.
  const imageSrc = isRemote ? optimizeProductImage(resolved, 320, 84) : resolved;
  const imageSrcSet = isRemote
    ? `${optimizeProductImage(resolved, 200, 82)} 200w, ${optimizeProductImage(resolved, 320, 84)} 320w, ${optimizeProductImage(resolved, 480, 86)} 480w`
    : undefined;
  const hasRetail = typeof priceRetail === "number" && priceRetail > 0;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card transition-smooth hover:-translate-y-1.5 hover:shadow-card-hover hover:border-primary/20">
      <span className="absolute left-2 top-2 z-10 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[10px]">
        {category}
      </span>

      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-secondary/40 to-white p-3 sm:p-6">
        <img
          src={imageSrc}
          srcSet={imageSrcSet}
          sizes="(min-width: 1024px) 240px, (min-width: 768px) 30vw, 45vw"
          alt={name}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          referrerPolicy="no-referrer"
          width={512}
          height={512}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:gap-3 sm:p-5">
        <div className="flex-1">
          <h3 className="line-clamp-2 text-sm font-bold leading-tight text-foreground sm:text-base">{name}</h3>
          <p className="mt-1 line-clamp-1 text-xs font-medium text-muted-foreground sm:text-sm">{details}</p>
        </div>

        {showPrices && hasRetail ? (
          <div className="space-y-1.5 rounded-xl bg-secondary/40 p-2 sm:p-2.5">
            {/* Preço Revendedor (principal) */}
            <div className="flex items-center justify-between gap-1.5 rounded-lg bg-foreground px-2 py-1.5 shadow-sm sm:px-2.5 sm:py-2">
              <div className="flex items-center gap-1 text-background">
                <Handshake className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" strokeWidth={2.5} />
                <span className="text-[8px] font-bold uppercase tracking-wider sm:text-[10px]">Revendedor</span>
              </div>
              <div className="flex shrink-0 items-center gap-1 whitespace-nowrap text-background">
                <span className="text-[8px] font-semibold leading-none opacity-90 sm:text-[10px]">R$</span>
                <span className="text-xs font-extrabold leading-tight tabular-nums sm:text-lg">
                  {price.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
            {/* Preço Avulso (secundário) */}
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <User className="h-2.5 w-2.5 sm:h-3 sm:w-3" strokeWidth={2.5} />
                <span className="text-[8px] font-bold uppercase tracking-wider sm:text-[10px]">Avulso</span>
              </div>
              <div className="flex shrink-0 items-center gap-1 whitespace-nowrap text-muted-foreground">
                <span className="text-[8px] font-semibold leading-none sm:text-[10px]">R$</span>
                <span className="text-xs font-bold leading-tight line-through decoration-muted-foreground/60 tabular-nums sm:text-base">
                  {priceRetail.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
          </div>
        ) : showPrices ? (
          <div className="flex items-center gap-1 whitespace-nowrap">
            <span className="text-[10px] font-semibold leading-none text-muted-foreground sm:text-xs">R$</span>
            <span className="text-lg font-extrabold leading-tight tabular-nums text-primary sm:text-2xl">
              {price.toFixed(2).replace(".", ",")}
            </span>
          </div>
        ) : null}

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            void recordProductClick(id, name);
          }}
          className="btn-snake group/btn mt-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold transition-smooth hover:-translate-y-0.5 sm:gap-2 sm:px-4 sm:py-3 sm:text-sm"
        >
          <span className="inline-flex items-center gap-1.5 sm:gap-2">
            <ShoppingBag className="h-3.5 w-3.5 transition-transform group-hover/btn:scale-110 sm:h-4 sm:w-4" strokeWidth={2.5} />
            Pedir agora
          </span>
        </a>
      </div>
    </article>
  );
};

export default memo(ProductCard);
