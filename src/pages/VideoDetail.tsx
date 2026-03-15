import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Crown, Eye, Clock, ArrowLeft, Play, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import VideoGrid from "@/components/VideoGrid";
import { supabase } from "@/integrations/supabase/client";
import { useCheckout } from "@/contexts/CheckoutContext";
import type { DBVideo } from "@/types/database";

const VideoDetail = () => {
  const { id } = useParams();
  const [video, setVideo] = useState<DBVideo | null>(null);
  const [related, setRelated] = useState<DBVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const { openCheckout } = useCheckout();

  useEffect(() => {
    const load = async () => {
      const { data: v } = await supabase
        .from("videos")
        .select("*")
        .eq("id", id)
        .single();

      if (!v) { setLoading(false); return; }
      setVideo(v);

      await supabase.from("analytics").insert({ event_type: "view", video_id: v.id });
      await supabase.from("videos").update({ views: (v.views || 0) + 1 }).eq("id", v.id);

      const { data: rel } = await supabase
        .from("videos")
        .select("*")
        .eq("active", true)
        .neq("id", v.id)
        .order("created_at", { ascending: false });
      setRelated(rel || []);

      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Vídeo não encontrado</p>
      </div>
    );
  }

  const formatViews = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
  };

  // Extract hashtags from description
  const extractHashtags = (desc: string | null): string[] => {
    if (!desc) return [];
    const matches = desc.match(/#[\wÀ-ÿ]+/g);
    return matches || [];
  };

  const hashtags = extractHashtags(video.description);
  const descriptionWithoutHashtags = video.description
    ? video.description.replace(/#[\wÀ-ÿ]+/g, "").trim()
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-12 md:pt-14">
        {/* Video Player */}
        <div className="relative w-full aspect-video bg-foreground overflow-hidden rounded-b-3xl">
          {video.video_url && !video.is_vip ? (
            <video src={video.video_url} controls className="w-full h-full object-contain bg-foreground" />
          ) : (
            <div className="relative w-full h-full">
              {video.thumbnail_url ? (
                <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover opacity-50 blur-sm" />
              ) : video.video_url ? (
                <video src={video.video_url} muted preload="metadata" className="w-full h-full object-cover opacity-40 blur-sm" />
              ) : (
                <div className="w-full h-full bg-secondary" />
              )}
              <div className="absolute inset-0 bg-foreground/30" />
            </div>
          )}
        </div>

        {/* Video info */}
        <div className="px-4 md:px-8 py-4 md:py-5">
          <Link to="/" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground mb-3 transition-colors font-body font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </Link>

          <h1 className="text-xl md:text-3xl font-display text-foreground leading-tight mb-2">{video.title}</h1>

          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3 font-body">
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{formatViews(video.views || 0)} views</span>
            {video.duration && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{video.duration}</span>}
            {video.is_vip && (
              <span className="flex items-center gap-0.5 text-primary text-[10px] font-bold">
                <Crown className="w-3 h-3" />
                VIP
              </span>
            )}
          </div>

          {descriptionWithoutHashtags && (
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-4 font-body">{descriptionWithoutHashtags}</p>
          )}

          {/* Big green CTA button */}
          <Button
            onClick={openCheckout}
            className="w-full bg-success hover:bg-success/90 text-success-foreground text-base md:text-lg font-display h-14 md:h-16 rounded-2xl shadow-[0_4px_0px_hsl(145_50%_30%)] active:shadow-none active:translate-y-[3px] transition-all mb-5"
          >
            <Play className="w-5 h-5 mr-2" />
            Ver Filme Completo
          </Button>

          {/* Hashtags */}
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {hashtags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-0.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-[11px] font-body font-semibold border-2 border-border"
                >
                  <Hash className="w-3 h-3 text-primary" />
                  {tag.replace("#", "")}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Related videos */}
        {related.length > 0 && <VideoGrid videos={related} title="Vídeos Relacionados" />}
      </main>
    </div>
  );
};

export default VideoDetail;
