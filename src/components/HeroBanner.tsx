import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Crown } from "lucide-react";
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
    <div className="relative w-full h-[35vh] md:h-[65vh] min-h-[200px] md:min-h-[400px] overflow-hidden">
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
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-6 left-3 right-12 md:bottom-16 md:left-12 z-10 max-w-[70%] md:max-w-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {banner.isVip && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-vip text-accent-foreground text-xs font-semibold mb-2">
                <Crown className="w-3 h-3" />
                VIP
              </span>
            )}
            <h1 className="text-lg md:text-4xl lg:text-6xl font-display leading-tight mb-1 md:mb-2 text-foreground line-clamp-2">
              {banner.title}
            </h1>
            <p className="text-xs md:text-base text-muted-foreground mb-3 md:mb-5 line-clamp-2">
              {banner.subtitle}
            </p>
            <div className="flex gap-2">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow text-xs md:text-sm px-3 md:px-5">
                Assistir
              </Button>
              {banner.isVip && (
                <Button size="sm" variant="outline" className="border-accent text-accent hover:bg-accent/10 text-xs md:text-sm px-3 md:px-5">
                  <Crown className="w-3 h-3 mr-1" />
                  VIP
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows - smaller on mobile */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 md:p-2 rounded-full bg-secondary/60 hover:bg-secondary text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 md:p-2 rounded-full bg-secondary/60 hover:bg-secondary text-foreground transition-colors"
      >
        <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current ? "bg-primary w-6" : "bg-muted-foreground/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;
