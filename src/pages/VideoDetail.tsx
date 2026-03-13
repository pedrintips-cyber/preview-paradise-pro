import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Crown, Eye, Clock, ArrowLeft, Lock, Star, Zap, Shield, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
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

      // Track view
      await supabase.from("analytics").insert({ event_type: "view", video_id: v.id });
      await supabase.from("videos").update({ views: (v.views || 0) + 1 }).eq("id", v.id);

      const { data: rel } = await supabase
        .from("videos")
        .select("*")
        .eq("active", true)
        .neq("id", v.id)
        .order("created_at", { ascending: false });
      setRelated(rel || []);

      // Load cheapest VIP plan for CTA
      const { data: plans } = await supabase
        .from("vip_plans")
        .select("price, period")
        .eq("active", true)
        .order("price")
        .limit(1);
      if (plans && plans.length > 0) {
        const p = plans[0];
        setVipLabel(`R$${Number(p.price).toFixed(2).replace(".", ",")}/${p.period === "mensal" ? "mês" : p.period === "trimestral" ? "tri" : "ano"}`);
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

  const formatViews = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString());

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-12 md:pt-14">
        {/* Video Player */}
        <div className="relative w-full aspect-video max-h-[45vh] md:max-h-[60vh] bg-secondary overflow-hidden">
          {video.video_url && !video.is_vip ? (
            <video src={video.video_url} controls className="w-full h-full object-contain bg-black" poster={video.thumbnail_url || undefined} />
          ) : (
            <>
              <img src={video.thumbnail_url || "/placeholder.svg"} alt={video.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                {video.is_vip ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center px-4">
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-primary/15 border-2 border-primary/40 flex items-center justify-center mx-auto mb-2 shadow-glow">
                      <Lock className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                    </div>
                    <h3 className="text-sm md:text-lg font-semibold text-foreground mb-1">Conteúdo VIP</h3>
                    <p className="text-[10px] md:text-sm text-muted-foreground mb-2">Assine para assistir completo</p>
                    <Link to="/vip">
                      <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow text-xs h-8 px-5">
                        <Crown className="w-3.5 h-3.5 mr-1.5" />
                        Desbloquear — {vipLabel}
                      </Button>
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-primary/15 border-2 border-primary/40 flex items-center justify-center mx-auto mb-2 cursor-pointer hover:bg-primary/25 transition-colors">
                      <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[16px] border-l-primary ml-1" />
                    </div>
                    <p className="text-xs text-muted-foreground">Assistir prévia</p>
                  </motion.div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Info */}
        <div className="px-3 md:px-8 py-4 md:py-6 max-w-4xl">
          <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </Link>
          <div className="flex items-start gap-2 mb-1">
            <h1 className="text-xl md:text-4xl font-display text-foreground leading-tight">{video.title}</h1>
            {video.is_vip && (
              <span className="flex-shrink-0 flex items-center gap-0.5 px-1.5 py-[2px] rounded-full bg-primary/15 text-primary text-[9px] font-semibold mt-1">
                <Crown className="w-2.5 h-2.5" />
                VIP
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{formatViews(video.views || 0)}</span>
            {video.duration && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{video.duration}</span>}
          </div>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{video.description}</p>
        </div>

        {/* VIP CTA */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mx-3 md:mx-8 mb-5">
          <div className="relative rounded-lg overflow-hidden border border-primary/15 bg-gradient-to-r from-primary/8 via-card to-primary/5 p-4 md:p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <Crown className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-semibold text-primary tracking-wide uppercase">Oferta Especial</span>
                </div>
                <h3 className="text-base md:text-xl font-display text-foreground mb-1">DESBLOQUEIE TUDO POR {vipLabel.toUpperCase()}</h3>
                <div className="flex flex-wrap gap-3 text-[9px] md:text-xs text-muted-foreground">
                  <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-primary" />+500 vídeos</span>
                  <span className="flex items-center gap-0.5"><Zap className="w-3 h-3 text-primary" />Sem anúncios</span>
                  <span className="flex items-center gap-0.5"><Shield className="w-3 h-3 text-primary" />Cancele quando quiser</span>
                </div>
              </div>
              <Link to="/vip" className="flex-shrink-0 w-full md:w-auto">
                <Button size="sm" className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow text-xs h-8 px-5">
                  Ver Planos VIP <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {related.length > 0 && <VideoGrid videos={related} title="Mais Vídeos" />}

        <div className="text-center py-6 px-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Acesso completo a todos os vídeos</p>
          <Link to="/vip">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow text-xs h-8 px-6">
              <Crown className="w-3.5 h-3.5 mr-1.5" />
              Seja VIP — {vipLabel}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default VideoDetail;
