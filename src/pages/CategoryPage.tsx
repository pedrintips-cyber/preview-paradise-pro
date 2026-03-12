import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import VideoGrid from "@/components/VideoGrid";
import { supabase } from "@/integrations/supabase/client";
import type { DBVideo, DBCategory } from "@/types/database";

const CategoryPage = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState<DBCategory | null>(null);
  const [videos, setVideos] = useState<DBVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: cat } = await supabase
        .from("categories")
        .select("id, name, slug, image_url")
        .eq("slug", slug)
        .eq("active", true)
        .single();

      if (!cat) { setLoading(false); return; }
      setCategory(cat);

      const { data: vids } = await supabase
        .from("videos")
        .select("*")
        .eq("category_id", cat.id)
        .eq("active", true)
        .order("created_at", { ascending: false });

      setVideos(vids || []);
      setLoading(false);
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
        <div className="relative h-64 overflow-hidden">
          <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
          <div className="absolute inset-0 flex items-center px-4 md:px-8">
            <div>
              <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Link>
              <h1 className="text-5xl md:text-7xl font-display text-foreground">{category.name}</h1>
              <p className="text-muted-foreground mt-2">{videos.length} vídeos encontrados</p>
            </div>
          </div>
        </div>

        {videos.length > 0 ? (
          <VideoGrid videos={videos} title={`Vídeos de ${category.name}`} />
        ) : (
          <div className="py-20 text-center text-muted-foreground">Nenhum vídeo nesta categoria ainda.</div>
        )}
      </main>
    </div>
  );
};

export default CategoryPage;
