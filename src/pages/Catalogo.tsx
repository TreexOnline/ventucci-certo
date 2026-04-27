import { useEffect } from "react";
import Header from "@/components/Header";
import Catalog from "@/components/Catalog";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import AgeGate from "@/components/AgeGate";
import { recordPageView } from "@/lib/analytics";

const Catalogo = () => {
  useEffect(() => {
    void recordPageView();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AgeGate />
      <Header />
      <main>
        <Catalog />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default Catalogo;
