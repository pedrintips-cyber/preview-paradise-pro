import { Link } from "react-router-dom";
import { Crown, Eye, Play, Flame } from "lucide-react";
import { motion } from "framer-motion";
import type { DBVideo } from "@/types/database";

interface VideoCardProps {
  video: DBVideo;
  index?: number;
}

const VideoCard = ({ video, index = 0 }: VideoCardProps) => {
  const formatViews = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
  };

  const isHot = (video.views || 0) >= 5000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link to={`/video/${video.id}`} className="group block">
        <div className="relative rounded-xl overflow-hidden bg-card border border-border/30 hover:border-primary/60 transition-all duration-500 hover:shadow-red hover:scale-[1.03] transform-gpu">
          {/* Video Preview */}
          <div className="relative aspect-[9/14] overflow-hidden bg-black">
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

            {/* Gradient overlay - stronger for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

            {/* Play overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-300 shadow-glow backdrop-blur-sm">
                <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
              </div>
            </div>

            {/* Top badges */}
            <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
              {video.is_vip ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-vip text-gold-foreground text-[10px] font-bold shadow-gold tracking-wide">
                  <Crown className="w-3 h-3" />
                  VIP
                </span>
              ) : (
                <span />
              )}
              {isHot && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/90 text-primary-foreground text-[9px] font-bold">
                  <Flame className="w-2.5 h-2.5" />
                  HOT
                </span>
              )}
            </div>

            {/* Bottom info overlay */}
            <div className="absolute bottom-0 inset-x-0 p-2.5">
              <h3 className="font-body font-semibold text-[11px] md:text-xs text-primary-foreground line-clamp-2 leading-tight mb-1.5 drop-shadow-lg">
                {video.title}
              </h3>
              <div className="flex items-center gap-1.5 text-primary-foreground/70 text-[10px]">
                <Eye className="w-3 h-3" />
                <span>{formatViews(video.views || 0)} views</span>
                {video.duration && (
                  <>
                    <span className="mx-0.5">•</span>
                    <span>{video.duration}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default VideoCard;
