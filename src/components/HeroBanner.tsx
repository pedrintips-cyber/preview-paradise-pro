import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

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
    return <div className="w-full h-[32vh] md:h-[60vh] min-h-[180px] bg-secondary animate-pulse" />;
  }

  const prev = () => setCurrent((c) => (c - 1 + banners.length) % banners.length);
  const next = () => setCurrent((c) => (c + 1) % banners.length);
  const banner = banners[current];

  return (
    <div className="relative w-full h-[32vh] md:h-[60vh] min-h-[180px] md:min-h-[380px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={banner.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/30 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-5 left-3 right-12 md:bottom-14 md:left-10 z-10 max-w-[70%] md:max-w-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            {banner.is_vip && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-[2px] rounded-full bg-primary/20 border border-primary/40 text-primary text-[9px] font-semibold mb-1.5">
                <Crown className="w-2.5 h-2.5" />
                VIP
              </span>
            )}
            <h1 className="text-lg md:text-4xl lg:text-5xl font-display leading-tight mb-1 md:mb-2 text-foreground line-clamp-2">
              {banner.title}
            </h1>
            <p className="text-[10px] md:text-sm text-muted-foreground mb-2 md:mb-4 line-clamp-2">
              {banner.subtitle}
            </p>
            <div className="flex gap-2">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow text-[10px] md:text-xs h-8 px-3 md:px-5">
                Assistir
              </Button>
              {banner.is_vip && (
                <Link to="/vip">
                  <Button size="sm" variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 text-[10px] md:text-xs h-8 px-3 md:px-5">
                    <Crown className="w-3 h-3 mr-1" />
                    VIP
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {banners.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1 md:p-2 rounded-full bg-secondary/50 hover:bg-secondary text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1 md:p-2 rounded-full bg-secondary/50 hover:bg-secondary text-foreground transition-colors">
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${i === current ? "bg-primary w-5" : "bg-muted-foreground/30 w-1.5"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroBanner;
