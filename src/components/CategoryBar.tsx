import { Link } from "react-router-dom";
import { categories } from "@/data/mockData";

const CategoryBar = () => {
  return (
    <section className="py-2 md:py-5 px-2.5 md:px-8">
      <h2 className="text-sm md:text-xl font-display text-foreground mb-1.5">
        Categorias
      </h2>
      <div className="flex gap-1.5 md:gap-3 overflow-x-auto scrollbar-hide pb-1">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/categoria/${cat.slug}`}
            className="flex-shrink-0 group"
          >
            <div className="relative w-16 h-22 md:w-32 md:h-44 rounded-md overflow-hidden border border-border group-hover:border-primary/40 transition-all duration-300">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
              <span className="absolute bottom-1 left-0 right-0 text-center font-display text-[9px] md:text-sm text-foreground">
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
