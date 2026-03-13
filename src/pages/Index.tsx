import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

import HeroBanner from "@/components/HeroBanner";

import VideoGrid from "@/components/VideoGrid";
import { supabase } from "@/integrations/supabase/client";
import type { DBVideo } from "@/types/database";

const Index = () => {
  const [videos, setVideos] = useState<DBVideo[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("videos")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });
      setVideos(data || []);
    };
    load();
  }, []);

  const freeVideos = videos.filter((v) => !v.is_vip);
  const vipVideos = videos.filter((v) => v.is_vip);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 md:pt-32">
        <HeroBanner />
        <CategoryBar />
        
        {freeVideos.length > 0 && <VideoGrid videos={freeVideos} title="Vídeos Gratuitos" />}
        {vipVideos.length > 0 && <VideoGrid videos={vipVideos} title="🔥 Conteúdo VIP" />}
        {videos.length === 0 && (
          <div className="py-20 text-center text-muted-foreground text-sm">
            Nenhum vídeo cadastrado ainda. Adicione pelo painel admin.
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
