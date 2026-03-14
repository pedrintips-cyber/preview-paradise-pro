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
    return <div className="w-full h-[35vh] md:h-[65vh] min-h-[200px] bg-secondary animate-pulse" />;
  }

  const prev = () => setCurrent((c) => (c - 1 + banners.length) % banners.length);
  const next = () => setCurrent((c) => (c + 1) % banners.length);
  const banner = banners[current];

  return (
    <div className="relative w-full h-[35vh] md:h-[65vh] min-h-[200px] md:min-h-[420px] overflow-hidden">
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
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/30 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="absolute bottom-6 left-4 right-14 md:bottom-16 md:left-10 z-10 max-w-[75%] md:max-w-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {banner.is_vip && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-vip text-gold-foreground text-[10px] md:text-xs font-bold mb-2 md:mb-3 shadow-gold tracking-wider">
                <Crown className="w-3 h-3 md:w-3.5 md:h-3.5" />
                CONTEÚDO VIP
              </span>
            )}
            <h1 className="text-xl md:text-5xl lg:text-6xl font-display leading-tight mb-1.5 md:mb-3 text-foreground line-clamp-2 tracking-wide">
              {banner.title}
            </h1>
            <p className="text-xs md:text-base text-muted-foreground mb-3 md:mb-5 line-clamp-2 leading-relaxed">
              {banner.subtitle}
            </p>
            <div className="flex gap-2.5">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow text-xs md:text-sm h-9 md:h-11 px-4 md:px-6 rounded-lg font-semibold">
                <Play className="w-4 h-4 mr-1.5" fill="currentColor" />
                Assistir
              </Button>
              {banner.is_vip && (
                <Button onClick={openCheckout} variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 text-xs md:text-sm h-9 md:h-11 px-4 md:px-6 rounded-lg font-semibold">
                  <Crown className="w-4 h-4 mr-1.5" />
                  Seja VIP
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 rounded-full bg-background/40 hover:bg-background/70 backdrop-blur-sm text-foreground transition-all border border-border/30">
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 rounded-full bg-background/40 hover:bg-background/70 backdrop-blur-sm text-foreground transition-all border border-border/30">
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          {/* Dots */}
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
  );
};

export default HeroBanner;
