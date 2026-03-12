import { Link } from "react-router-dom";
import { categories } from "@/data/mockData";

const CategoryBar = () => {
  return (
    <section className="py-3 md:py-6 px-3 md:px-8">
      <h2 className="text-base md:text-xl font-display text-foreground mb-2">
        Categorias
      </h2>
      <div className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide pb-1">
        {categories.map((cat) => (
          <Link key={cat.id} to={`/categoria/${cat.slug}`} className="flex-shrink-0 group">
            <div className="relative w-20 h-28 md:w-36 md:h-48 rounded-md overflow-hidden border border-border group-hover:border-primary/40 transition-all duration-300">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
              <span className="absolute bottom-1.5 left-0 right-0 text-center font-display text-[10px] md:text-sm text-foreground">
                {cat.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryBar;
