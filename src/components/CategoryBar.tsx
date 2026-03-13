import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  image_url: string;
}

const CategoryBar = () => {
  const [categories, setCategories] = useState<CategoryRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug, image_url")
        .eq("active", true)
        .order("sort_order");
      setCategories(data || []);
    };
    load();
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="py-4 md:py-8">
      <div className="flex items-center gap-3 mb-3 md:mb-4 px-4 md:px-10">
        <div className="w-1 h-6 md:h-7 rounded-full bg-primary" />
        <h2 className="text-lg md:text-2xl font-display text-foreground tracking-wide">Categorias</h2>
      </div>
      <div className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-2 px-4 md:px-10">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <Link to={`/categoria/${cat.slug}`} className="flex-shrink-0 group block">
              <div className="relative w-24 h-32 md:w-40 md:h-52 rounded-xl overflow-hidden border-2 border-border/50 group-hover:border-primary/60 transition-all duration-300 group-hover:shadow-red">
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent group-hover:from-primary/30 transition-all duration-300" />
                {/* Category name */}
                <div className="absolute inset-x-0 bottom-0 p-2 md:p-3">
                  <span className="font-display text-xs md:text-base text-foreground tracking-wider group-hover:text-primary transition-colors block text-center">
                    {cat.name}
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CategoryBar;
