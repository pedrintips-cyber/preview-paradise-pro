import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { banners } from "@/data/mockData";

const HeroBanner = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + banners.length) % banners.length);
  const next = () => setCurrent((c) => (c + 1) % banners.length);

  const banner = banners[current];

  return (
    <div className="relative w-full h-[28vh] md:h-[55vh] min-h-[160px] md:min-h-[350px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={banner.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img
            src={banner.image}
            alt={banner.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/30 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-4 left-3 right-10 md:bottom-12 md:left-10 z-10 max-w-[65%] md:max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            {banner.isVip && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-[2px] rounded-full bg-primary/20 border border-primary/40 text-primary text-[8px] font-semibold mb-1">
                <Crown className="w-2 h-2" />
                VIP
              </span>
            )}
            <h1 className="text-base md:text-3xl lg:text-5xl font-display leading-tight mb-0.5 md:mb-1.5 text-foreground line-clamp-2">
              {banner.title}
            </h1>
            <p className="text-[9px] md:text-sm text-muted-foreground mb-2 md:mb-4 line-clamp-2">
              {banner.subtitle}
            </p>
            <div className="flex gap-1.5">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow text-[9px] md:text-xs h-7 md:h-8 px-2.5 md:px-4">
                Assistir
              </Button>
              {banner.isVip && (
                <Link to="/vip">
                  <Button size="sm" variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 text-[9px] md:text-xs h-7 md:h-8 px-2.5 md:px-4">
                    <Crown className="w-2.5 h-2.5 mr-0.5" />
                    VIP
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        onClick={prev}
        className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 p-1 md:p-1.5 rounded-full bg-secondary/50 hover:bg-secondary text-foreground transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5 md:w-5 md:h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 p-1 md:p-1.5 rounded-full bg-secondary/50 hover:bg-secondary text-foreground transition-colors"
      >
        <ChevronRight className="w-3.5 h-3.5 md:w-5 md:h-5" />
      </button>

      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 z-10">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              i === current ? "bg-primary w-4" : "bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;
