import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import VideoGrid from "@/components/VideoGrid";
import { supabase } from "@/integrations/supabase/client";
import type { DBVideo } from "@/types/database";

interface SectionRow {
  id: string;
  name: string;
  sort_order: number | null;
}

const Index = () => {
  const [videos, setVideos] = useState<DBVideo[]>([]);
  const [sections, setSections] = useState<SectionRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const [videosRes, sectionsRes] = await Promise.all([
        supabase
          .from("videos")
          .select("*")
          .eq("active", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("sections")
          .select("id, name, sort_order")
          .eq("active", true)
          .order("sort_order"),
      ]);
      setVideos(videosRes.data || []);
      setSections(sectionsRes.data || []);
    };
    load();
  }, []);

  // Videos grouped by section
  const sectionedVideos = sections.map((section) => ({
    section,
    videos: videos.filter((v) => (v as any).section_id === section.id),
  })).filter((g) => g.videos.length > 0);

  // Videos without a section
  const unsectionedVideos = videos.filter(
    (v) => !(v as any).section_id || !sections.find((s) => s.id === (v as any).section_id)
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 md:pt-32">
        <HeroBanner />

        {sectionedVideos.map(({ section, videos: sectionVids }) => (
          <VideoGrid key={section.id} videos={sectionVids} title={section.name} />
        ))}

        {unsectionedVideos.length > 0 && (
          <VideoGrid videos={unsectionedVideos} title="Vídeos" />
        )}

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
