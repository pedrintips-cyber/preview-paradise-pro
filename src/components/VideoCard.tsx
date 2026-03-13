import { Link } from "react-router-dom";
import { Crown, Eye, Clock, Play } from "lucide-react";
import { motion } from "framer-motion";
import type { DBVideo } from "@/types/database";

interface VideoCardProps {
  video: DBVideo;
  index?: number;
}

const VideoCard = ({ video, index = 0 }: VideoCardProps) => {
  const formatViews = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString());

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <Link to={`/video/${video.id}`} className="group block">
        <div className="relative rounded-lg overflow-hidden bg-card border border-border/50 hover:border-primary/40 transition-all duration-300 hover:shadow-red">
          {/* Video Preview */}
          <div className="relative aspect-video overflow-hidden bg-black">
            {video.video_url ? (
              <video
                src={video.video_url}
                muted
                preload="metadata"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Play className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            {/* Play overlay */}
            <div className="absolute inset-0 bg-background/0 group-hover:bg-background/30 transition-all duration-300 flex items-center justify-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 shadow-glow">
                <Play className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground ml-0.5" fill="currentColor" />
              </div>
            </div>
            {/* Gradient bottom */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-card via-card/50 to-transparent" />
            {/* VIP badge */}
            {video.is_vip && (
              <span className="absolute top-1.5 left-1.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-vip text-gold-foreground text-[10px] font-bold shadow-gold tracking-wide">
                <Crown className="w-3 h-3" />
                VIP
              </span>
            )}
            {/* Duration */}
            {video.duration && (
              <span className="absolute bottom-1.5 right-1.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-medium">
                <Clock className="w-3 h-3" />
                {video.duration}
              </span>
            )}
          </div>
          {/* Info */}
          <div className="p-2.5 md:p-3">
            <h3 className="font-body font-semibold text-[11px] md:text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
              {video.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5 text-muted-foreground text-[10px] md:text-xs">
              <Eye className="w-3 h-3" />
              <span>{formatViews(video.views || 0)} views</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default VideoCard;
