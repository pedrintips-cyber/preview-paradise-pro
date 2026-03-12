import { useParams, Link } from "react-router-dom";
import { Crown, Eye, Clock, ArrowLeft, Lock } from "lucide-react";
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

  const related = videos.filter((v) => v.id !== video.id).slice(0, 4);
  const formatViews = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Video Player Area */}
        <div className="relative w-full aspect-video max-h-[70vh] bg-secondary overflow-hidden">
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
                className="text-center"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-vip flex items-center justify-center mx-auto mb-4 shadow-gold">
                  <Lock className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Conteúdo Exclusivo VIP
                </h3>
                <p className="text-muted-foreground mb-4">
                  Assine o VIP para assistir este vídeo completo
                </p>
                <Button className="bg-gradient-vip text-accent-foreground hover:opacity-90 shadow-gold px-8">
                  <Crown className="w-4 h-4 mr-2" />
                  Assinar VIP — R$29,90/mês
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-primary/30 transition-colors">
                  <div className="w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[20px] border-l-primary ml-1" />
                </div>
                <p className="text-muted-foreground">Clique para assistir a prévia</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Video Info */}
        <div className="px-4 md:px-8 py-6 max-w-4xl">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-5xl font-display text-foreground">
                  {video.title}
                </h1>
                {video.isVip && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-vip text-accent-foreground text-xs font-semibold">
                    <Crown className="w-3.5 h-3.5" />
                    VIP
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {formatViews(video.views)} views
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {video.duration}
                </span>
              </div>
            </div>
          </div>

          <p className="mt-6 text-muted-foreground leading-relaxed">
            {video.description}
          </p>
        </div>

        {/* Related */}
        <VideoGrid videos={related} title="Vídeos Relacionados" />
      </main>
    </div>
  );
};

export default VideoDetail;
