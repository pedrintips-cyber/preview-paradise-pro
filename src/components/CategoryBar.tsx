import { Link } from "react-router-dom";
import { categories } from "@/data/mockData";

const CategoryBar = () => {
  return (
    <section className="py-3 md:py-8 px-3 md:px-8">
      <h2 className="text-lg md:text-3xl font-display text-foreground mb-3">
        Categorias
      </h2>
      <div className="flex gap-2 md:gap-4 overflow-x-auto scrollbar-hide pb-2">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/categoria/${cat.slug}`}
            className="flex-shrink-0 group"
          >
            <div className="relative w-24 h-32 md:w-40 md:h-56 rounded-lg overflow-hidden border border-border group-hover:border-primary/50 transition-all duration-300">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <span className="absolute bottom-2 left-2 right-2 text-center font-display text-sm md:text-lg text-foreground">
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
