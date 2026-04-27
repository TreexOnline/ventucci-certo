import { useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import AgeGate from "@/components/AgeGate";
import { recordPageView } from "@/lib/analytics";

const Index = () => {
  useEffect(() => {
    void recordPageView();
  }, []);

  return (
    <div className="min-h-screen">
      <AgeGate />
      <Header transparent />
      <main>
        <Hero />
        <FeaturedProducts />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default Index;
