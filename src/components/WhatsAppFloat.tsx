import { buildWhatsAppLink } from "@/lib/site";

const whatsappLink = buildWhatsAppLink(
  "Olá! Estou no site da Ventucci e gostaria de tirar uma dúvida rápida antes de fechar meu pedido. Pode me ajudar?",
);

const WhatsAppFloat = () => {
  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp Ventucci"
      className="group fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-foreground ring-2 ring-white/10 shadow-card-hover transition-smooth hover:-translate-y-0.5 hover:bg-foreground/90 sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
      style={{
        bottom: "max(1rem, env(safe-area-inset-bottom))",
        right: "max(1rem, env(safe-area-inset-right))",
      }}
    >
      <svg
        viewBox="0 0 32 32"
        className="h-7 w-7 text-whatsapp transition-transform group-hover:scale-110 sm:h-8 sm:w-8"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.738 3.41 4.673 4.443.616.33 2.794 1.118 3.482 1.118.817 0 2.336-.516 2.68-1.318.144-.33.187-.704.187-1.06 0-.5-1.46-1.247-1.74-1.247m-2.522 5.96h-.006a8.305 8.305 0 0 1-4.225-1.158l-.302-.18-3.135.821.838-3.06-.196-.31a8.255 8.255 0 0 1-1.27-4.402c.003-4.566 3.72-8.282 8.305-8.282a8.245 8.245 0 0 1 5.873 2.435 8.196 8.196 0 0 1 2.43 5.853c-.005 4.567-3.722 8.283-8.312 8.283m7.067-15.331A11.764 11.764 0 0 0 16.583 4.4C10.05 4.4 4.733 9.715 4.73 16.247c0 2.087.546 4.124 1.583 5.92L4.63 28.16l6.13-1.608a11.86 11.86 0 0 0 5.668 1.443h.005c6.532 0 11.85-5.317 11.852-11.85a11.785 11.785 0 0 0-3.472-8.382" />
      </svg>
    </a>
  );
};

export default WhatsAppFloat;
