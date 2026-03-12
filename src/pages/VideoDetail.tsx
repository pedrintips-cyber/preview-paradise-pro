import { useParams, Link } from "react-router-dom";
import { Crown, Eye, Clock, ArrowLeft, Lock, Star, Zap, Shield, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import VideoGrid from "@/components/VideoGrid";
import { videos } from "@/data/mockData";

const VideoDetail = () => {
  const { id } = useParams();
  const video = videos.find((v) => v.id === id);

  if (!video) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-xs">Vídeo não encontrado</p>
      </div>
    );
  }

  const related = videos.filter((v) => v.id !== video.id).slice(0, 6);
  const formatViews = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14">
        {/* Video Player */}
        <div className="relative w-full aspect-video max-h-[40vh] md:max-h-[60vh] bg-secondary overflow-hidden">
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
            {video.isVip ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center px-4">
                <div className="w-12 h-12 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center mx-auto mb-2 shadow-glow">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-0.5">Conteúdo VIP</h3>
                <p className="text-[10px] text-muted-foreground mb-2">Assine para assistir completo</p>
                <Link to="/vip">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow text-[10px] h-7 px-4">
                    <Crown className="w-3 h-3 mr-1" />
                    Desbloquear — R$29,90/ano
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center mx-auto mb-2 cursor-pointer hover:bg-primary/25 transition-colors">
                  <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[13px] border-l-primary ml-0.5" />
                </div>
                <p className="text-[10px] text-muted-foreground">Assistir prévia</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="px-3 md:px-8 py-3 md:py-5">
          <Link to="/" className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground mb-2 transition-colors">
            <ArrowLeft className="w-3 h-3" />
            Voltar
          </Link>

          <div className="flex items-start gap-1.5 mb-0.5">
            <h1 className="text-lg md:text-3xl font-display text-foreground leading-tight">{video.title}</h1>
            {video.isVip && (
              <span className="flex-shrink-0 flex items-center gap-0.5 px-1.5 py-[1px] rounded-full bg-primary/15 text-primary text-[8px] font-semibold mt-0.5">
                <Crown className="w-2 h-2" />
                VIP
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground mb-3">
            <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{formatViews(video.views)}</span>
            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{video.duration}</span>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">{video.description}</p>
        </div>

        {/* VIP Funnel CTA */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mx-2.5 md:mx-8 mb-4">
          <div className="relative rounded-lg overflow-hidden border border-primary/15 bg-gradient-to-r from-primary/8 via-card to-primary/5 p-3 md:p-6">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 mb-1">
                <Crown className="w-3.5 h-3.5 text-primary" />
                <span className="text-[9px] font-semibold text-primary tracking-wide uppercase">Oferta Especial</span>
              </div>
              <h3 className="text-sm md:text-lg font-display text-foreground mb-0.5">DESBLOQUEIE TUDO POR R$29,90/ANO</h3>
              <div className="flex flex-wrap gap-2 text-[8px] md:text-[10px] text-muted-foreground mb-3">
                <span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5 text-primary" />+500 vídeos</span>
                <span className="flex items-center gap-0.5"><Zap className="w-2.5 h-2.5 text-primary" />Sem anúncios</span>
                <span className="flex items-center gap-0.5"><Shield className="w-2.5 h-2.5 text-primary" />Cancele quando quiser</span>
              </div>
              <Link to="/vip">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow text-[10px] h-7 px-4">
                  Ver Plano VIP <ChevronRight className="w-3 h-3 ml-0.5" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        <VideoGrid videos={related} title="Vídeos Relacionados" />

        {/* Bottom CTA */}
        <div className="text-center py-5 px-3 border-t border-border">
          <p className="text-[10px] text-muted-foreground mb-2">Acesso completo a todos os vídeos</p>
          <Link to="/vip">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow text-[10px] h-7 px-5">
              <Crown className="w-3 h-3 mr-1" />
              Seja VIP — R$29,90/ano
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default VideoDetail;
