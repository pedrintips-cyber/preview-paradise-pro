import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import VideoGrid from "@/components/VideoGrid";
import { videos, categories } from "@/data/mockData";

const CategoryPage = () => {
  const { slug } = useParams();
  const category = categories.find((c) => c.slug === slug);
  const categoryVideos = videos.filter((v) => v.category === slug);

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Categoria não encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Category Hero */}
        <div className="relative h-64 overflow-hidden">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
          <div className="absolute inset-0 flex items-center px-4 md:px-8">
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Link>
              <h1 className="text-5xl md:text-7xl font-display text-foreground">
                {category.name}
              </h1>
              <p className="text-muted-foreground mt-2">
                {categoryVideos.length} vídeos encontrados
              </p>
            </div>
          </div>
        </div>

        {categoryVideos.length > 0 ? (
          <VideoGrid videos={categoryVideos} title={`Vídeos de ${category.name}`} />
        ) : (
          <div className="py-20 text-center text-muted-foreground">
            Nenhum vídeo nesta categoria ainda.
          </div>
        )}
      </main>
    </div>
  );
};

export default CategoryPage;
