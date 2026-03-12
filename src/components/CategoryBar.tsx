import { Link } from "react-router-dom";
import { categories } from "@/data/mockData";

const CategoryBar = () => {
  return (
    <section className="py-8 px-4 md:px-8">
      <h2 className="text-3xl md:text-4xl font-display text-foreground mb-6">
        Categorias
      </h2>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/categoria/${cat.slug}`}
            className="flex-shrink-0 group"
          >
            <div className="relative w-36 h-52 md:w-44 md:h-64 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-primary transition-all duration-300">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 right-3 text-center font-display text-xl text-foreground">
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
