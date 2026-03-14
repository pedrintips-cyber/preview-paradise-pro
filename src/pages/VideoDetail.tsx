import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Crown, Eye, Clock, ArrowLeft, Lock, Star, Zap, Shield, ChevronRight, Flame, Play } from "lucide-react";
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
  const [cheapestPrice, setCheapestPrice] = useState("");

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
        const priceFormatted = `R$${Number(p.price).toFixed(2).replace(".", ",")}`;
        const periodText = p.period === "mensal" ? "mês" : p.period === "trimestral" ? "tri" : "ano";
        setVipLabel(`${priceFormatted}/${periodText}`);
        setCheapestPrice(priceFormatted);
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
        <div className="relative w-full aspect-video max-h-[45vh] md:max-h-[60vh] bg-black overflow-hidden">
          {video.video_url && !video.is_vip ? (
            <video src={video.video_url} controls className="w-full h-full object-contain bg-black" />
          ) : (
            <div className="relative w-full h-full">
              {/* Video as background preview */}
              {video.video_url ? (
                <video src={video.video_url} muted preload="metadata" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-secondary" />
              )}
              <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center">
                {video.is_vip ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center px-6 max-w-sm">
                    {/* Pulsing lock icon */}
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/50 flex items-center justify-center mx-auto mb-3 shadow-glow"
                    >
                      <Lock className="w-7 h-7 md:w-9 md:h-9 text-primary" />
                    </motion.div>
                    <h3 className="text-base md:text-xl font-display text-foreground mb-1 tracking-wider">CONTEÚDO EXCLUSIVO</h3>
                    <p className="text-xs text-muted-foreground mb-3">Desbloqueie agora e assista completo</p>
                    <Link to="/vip">
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow text-sm h-10 px-6 font-semibold">
                        <Crown className="w-4 h-4 mr-2" />
                        DESBLOQUEAR — {vipLabel}
                      </Button>
                    </Link>
                    <p className="text-[9px] text-muted-foreground/60 mt-2">Acesso imediato após pagamento</p>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto cursor-pointer hover:bg-primary/30 transition-colors">
                      <Play className="w-6 h-6 text-primary ml-0.5" fill="currentColor" />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
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

        {/* VIP CTA - Premium design */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mx-3 md:mx-8 mb-5">
          <div className="relative rounded-xl overflow-hidden border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card">
            {/* Decorative glow */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
            
            <div className="relative z-10 p-4 md:p-6">
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-primary tracking-widest uppercase block">Oferta Limitada</span>
                  <span className="text-[9px] text-muted-foreground">Milhares já assinaram</span>
                </div>
              </div>

              {/* Main pitch */}
              <h3 className="text-lg md:text-2xl font-display text-foreground mb-2 tracking-wide">
                ACESSO TOTAL A TODOS OS VÍDEOS
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Por apenas <span className="text-primary font-semibold">{vipLabel}</span> você desbloqueia todo o conteúdo exclusivo
              </p>

              {/* Benefits */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 rounded-lg bg-background/50">
                  <Star className="w-4 h-4 text-primary mx-auto mb-1" />
                  <span className="text-[9px] text-muted-foreground block">+500 vídeos</span>
                </div>
                <div className="text-center p-2 rounded-lg bg-background/50">
                  <Zap className="w-4 h-4 text-primary mx-auto mb-1" />
                  <span className="text-[9px] text-muted-foreground block">Sem anúncios</span>
                </div>
                <div className="text-center p-2 rounded-lg bg-background/50">
                  <Shield className="w-4 h-4 text-primary mx-auto mb-1" />
                  <span className="text-[9px] text-muted-foreground block">Cancele a hora</span>
                </div>
              </div>

              {/* CTA */}
              <Link to="/vip" className="block">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow text-sm h-11 font-bold tracking-wide">
                  <Crown className="w-4 h-4 mr-2" />
                  QUERO SER VIP AGORA
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {related.length > 0 && <VideoGrid videos={related} title="Mais Vídeos" />}

        {/* Bottom CTA */}
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
