import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Crown, Eye, Clock, ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import VideoGrid from "@/components/VideoGrid";
import { supabase } from "@/integrations/supabase/client";
import type { DBVideo } from "@/types/database";

const VideoDetail = () => {
  const { id } = useParams();
  const [video, setVideo] = useState<DBVideo | null>(null);
  const [related, setRelated] = useState<DBVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [vipLabel, setVipLabel] = useState("R$29,90/ano");

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

      const { data: plans } = await supabase
        .from("vip_plans")
        .select("price, period")
        .eq("active", true)
        .order("price")
        .limit(1);
      if (plans && plans.length > 0) {
        const p = plans[0];
        const priceFormatted = `R$${Number(p.price).toFixed(2).replace(".", ",")}`;
        const periodText = p.period === "mensal" ? "/mês" : p.period === "trimestral" ? "/tri" : "/ano";
        setVipLabel(`${priceFormatted}${periodText}`);
      }

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-12 md:pt-14">
        {/* Video Player */}
        <div className="relative w-full aspect-video max-h-[40vh] md:max-h-[60vh] bg-black overflow-hidden">
          {video.video_url && !video.is_vip ? (
            <video src={video.video_url} controls className="w-full h-full object-contain bg-black" />
          ) : (
            <div className="relative w-full h-full">
              {video.video_url ? (
                <video src={video.video_url} muted preload="metadata" className="w-full h-full object-cover opacity-40 blur-sm" />
              ) : (
                <div className="w-full h-full bg-secondary" />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                {video.is_vip ? (
                  <div className="text-center px-6">
                    <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-foreground font-body font-medium mb-1">Conteúdo VIP</p>
                    <p className="text-[11px] text-muted-foreground mb-3">Assine para desbloquear</p>
                    <Link to="/vip">
                      <Button size="sm" className="bg-primary text-primary-foreground text-xs h-9 px-5">
                        <Crown className="w-3.5 h-3.5 mr-1.5" />
                        Desbloquear — {vipLabel}
                      </Button>
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Video info */}
        <div className="px-3 md:px-8 py-3 md:py-5">
          <Link to="/" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground mb-2 transition-colors">
            <ArrowLeft className="w-3 h-3" />
            Voltar
          </Link>

          <h1 className="text-lg md:text-3xl font-display text-foreground leading-tight mb-1">{video.title}</h1>

          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatViews(video.views || 0)}</span>
            {video.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{video.duration}</span>}
            {video.is_vip && (
              <span className="flex items-center gap-0.5 text-primary text-[10px] font-medium">
                <Crown className="w-2.5 h-2.5" />
                VIP
              </span>
            )}
          </div>

          {video.description && (
            <p className="text-[11px] md:text-sm text-muted-foreground leading-relaxed mb-4">{video.description}</p>
          )}
        </div>

        {/* VIP CTA */}
        <div className="mx-3 md:mx-8 mb-5">
          <div className="relative rounded-xl overflow-hidden border border-primary/25 bg-gradient-to-br from-card via-card to-primary/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/8 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
            <div className="relative p-4 md:p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <Crown className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-display text-foreground tracking-wide">ACESSO VIP</p>
                  <p className="text-[10px] text-muted-foreground">Todos os vídeos por apenas {vipLabel}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5 mb-4">
                {[
                  "Vídeos exclusivos",
                  "Novos toda semana", 
                  "Sem anúncios",
                  "Cancele quando quiser",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-2 h-2 text-primary" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>

              <Link to="/vip" className="block">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm h-10 font-bold rounded-lg shadow-glow">
                  <Crown className="w-3.5 h-3.5 mr-1.5" />
                  QUERO SER VIP — {vipLabel}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {related.length > 0 && <VideoGrid videos={related} title="Mais Vídeos" />}
      </main>
    </div>
  );
};

export default VideoDetail;
