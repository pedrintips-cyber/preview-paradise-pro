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
        <p className="text-muted-foreground">Vídeo não encontrado</p>
      </div>
    );
  }

  const related = videos.filter((v) => v.id !== video.id).slice(0, 6);
  const formatViews = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Video Player Area */}
        <div className="relative w-full aspect-video max-h-[50vh] md:max-h-[65vh] bg-secondary overflow-hidden">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
            {video.isVip ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center px-4"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-3 shadow-glow">
                  <Lock className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">
                  Conteúdo Exclusivo VIP
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-3">
                  Assine o VIP para assistir completo
                </p>
                <Link to="/vip">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow px-6 text-sm">
                    <Crown className="w-4 h-4 mr-1.5" />
                    Desbloquear Agora
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-3 cursor-pointer hover:bg-primary/30 transition-colors">
                  <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[16px] border-l-primary ml-1" />
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Clique para assistir a prévia
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Video Info */}
        <div className="px-4 md:px-8 py-4 md:py-6 max-w-4xl">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </Link>

          <div className="flex items-start gap-2 mb-1">
            <h1 className="text-2xl md:text-4xl font-display text-foreground leading-tight">
              {video.title}
            </h1>
            {video.isVip && (
              <span className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-semibold mt-1">
                <Crown className="w-3 h-3" />
                VIP
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {formatViews(video.views)} views
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {video.duration}
            </span>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {video.description}
          </p>
        </div>

        {/* VIP Funnel CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mx-3 md:mx-8 mb-6"
        >
          <div className="relative rounded-xl overflow-hidden border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-primary/5 p-5 md:p-8">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-primary" />
                  <span className="text-xs font-semibold text-primary tracking-wide uppercase">
                    Oferta Especial
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-display text-foreground mb-1">
                  DESBLOQUEIE TODOS OS VÍDEOS
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-3">
                  Acesso ilimitado a todo conteúdo VIP. Sem anúncios. Qualidade máxima.
                </p>
                <div className="flex flex-wrap gap-3 text-[10px] md:text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-primary" />
                    +500 vídeos
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-primary" />
                    Sem anúncios
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-primary" />
                    Cancele quando quiser
                  </span>
                </div>
              </div>
              <Link to="/vip" className="flex-shrink-0 w-full md:w-auto">
                <Button className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow px-6 py-3 text-sm font-semibold">
                  Ver Planos VIP
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Related */}
        <VideoGrid videos={related} title="Vídeos Relacionados" />

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center py-8 px-4 border-t border-border"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Quer acesso completo a todos os vídeos da plataforma?
          </p>
          <Link to="/vip">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow px-8">
              <Crown className="w-4 h-4 mr-1.5" />
              Seja VIP Agora
            </Button>
          </Link>
        </motion.div>
      </main>
    </div>
  );
};

export default VideoDetail;
