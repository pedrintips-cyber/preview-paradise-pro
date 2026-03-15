import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Crown, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCheckout } from "@/contexts/CheckoutContext";

interface BannerRow {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  is_vip: boolean | null;
}

const HeroBanner = () => {
  const [banners, setBanners] = useState<BannerRow[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const { openCheckout } = useCheckout();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("banners")
        .select("id, title, subtitle, image_url, is_vip")
        .eq("active", true)
        .order("sort_order");
      setBanners(data || []);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (loading || banners.length === 0) {
    return (
      <div className="px-3 md:px-6">
        <div className="mx-auto w-full max-w-[760px] aspect-square rounded-3xl bg-secondary animate-pulse" />
      </div>
    );
  }

  const prev = () => setCurrent((c) => (c - 1 + banners.length) % banners.length);
  const next = () => setCurrent((c) => (c + 1) % banners.length);
  const banner = banners[current];

  return (
    <section className="px-3 md:px-6">
      <div className="relative mx-auto w-full max-w-[760px] aspect-square overflow-hidden rounded-3xl border border-border shadow-card">
        <AnimatePresence mode="wait">
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/30 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-4 left-4 right-14 md:bottom-8 md:left-8 md:right-16 z-10 max-w-[80%]">
          <AnimatePresence mode="wait">
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] md:text-xs font-black tracking-[0.2em] uppercase mb-2 md:mb-3 shadow-glow">
                PROGRAMAÇÃO
              </span>
              {banner.is_vip && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-vip text-gold-foreground text-[10px] md:text-xs font-bold mb-2 md:mb-3 shadow-gold tracking-wider ml-2">
                  <Crown className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  CONTEÚDO VIP
                </span>
              )}
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-display leading-tight mb-1.5 md:mb-3 text-foreground line-clamp-2 tracking-wide">
                {banner.title}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-5 line-clamp-2 leading-relaxed">
                {banner.subtitle}
              </p>
              <div className="flex gap-2.5 flex-wrap">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-cartoon text-xs md:text-sm h-10 md:h-12 px-5 md:px-7 rounded-full font-bold active:translate-y-[1px]">
                  <Play className="w-4 h-4 mr-1.5" fill="currentColor" />
                  Assistir
                </Button>
                {banner.is_vip && (
                  <Button onClick={openCheckout} variant="outline" className="border-2 border-primary/40 text-primary hover:bg-primary/10 text-xs md:text-sm h-10 md:h-12 px-5 md:px-7 rounded-full font-bold shadow-cartoon">
                    <Crown className="w-4 h-4 mr-1.5" />
                    Seja VIP
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {banners.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 rounded-full bg-card/80 hover:bg-card backdrop-blur-sm text-foreground transition-all border-2 border-border shadow-cartoon active:translate-y-[1px] active:shadow-none">
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 rounded-full bg-card/80 hover:bg-card backdrop-blur-sm text-foreground transition-all border-2 border-border shadow-cartoon active:translate-y-[1px] active:shadow-none">
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? "bg-primary w-6 h-2 shadow-glow"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2 h-2"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default HeroBanner;
