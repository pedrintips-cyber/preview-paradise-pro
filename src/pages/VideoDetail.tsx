import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Crown, Eye, Clock, ArrowLeft, Lock, Check } from "lucide-react";
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
  const [vipLabel, setVipLabel] = useState("R$29,90/ano");
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
        <div className="relative w-full aspect-video bg-foreground overflow-hidden">
          {video.video_url && !video.is_vip ? (
            <video src={video.video_url} controls className="w-full h-full object-contain bg-foreground" />
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
                    <Button onClick={openCheckout} size="sm" className="bg-primary text-primary-foreground text-xs h-9 px-5">
                      <Crown className="w-3.5 h-3.5 mr-1.5" />
                      Desbloquear — {vipLabel}
                    </Button>
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
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Crown className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">Acesso VIP</p>
                <p className="text-[9px] text-muted-foreground">Todos os vídeos por {vipLabel}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3 pl-0.5">
              {["Vídeos exclusivos", "Sem anúncios", "Novos toda semana"].map((item, i) => (
                <span key={i} className="text-[9px] text-muted-foreground flex items-center gap-1">
                  <Check className="w-2.5 h-2.5 text-primary" />
                  {item}
                </span>
              ))}
            </div>

            <Button onClick={openCheckout} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-9 font-bold rounded-md">
              QUERO SER VIP — {vipLabel}
            </Button>
          </div>
        </div>

        {related.length > 0 && <VideoGrid videos={related} title="Mais Vídeos" />}
      </main>
    </div>
  );
};

export default VideoDetail;
