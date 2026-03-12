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
    <div className="relative w-full h-[45vh] md:h-[70vh] min-h-[250px] md:min-h-[400px] overflow-hidden">
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
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-10 left-4 md:bottom-16 md:left-16 z-10 max-w-xs md:max-w-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {banner.isVip && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-vip text-accent-foreground text-sm font-semibold mb-4">
                <Crown className="w-4 h-4" />
                VIP
              </span>
            )}
            <h1 className="text-2xl md:text-5xl lg:text-7xl font-display leading-none mb-2 text-foreground">
              {banner.title}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-6">
              {banner.subtitle}
            </p>
            <div className="flex gap-3">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow px-6">
                Assistir Agora
              </Button>
              {banner.isVip && (
                <Button variant="outline" className="border-accent text-accent hover:bg-accent/10">
                  <Crown className="w-4 h-4 mr-2" />
                  Seja VIP
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-secondary/60 hover:bg-secondary text-foreground transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-secondary/60 hover:bg-secondary text-foreground transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === current ? "bg-primary w-8" : "bg-muted-foreground/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;
