import { Link } from "react-router-dom";
import { Crown, Eye, Clock } from "lucide-react";
import { motion } from "framer-motion";
import type { Video } from "@/data/mockData";

interface VideoCardProps {
  video: Video;
  index?: number;
}

const VideoCard = ({ video, index = 0 }: VideoCardProps) => {
  const formatViews = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link to={`/video/${video.id}`} className="group block">
        <div className="relative rounded-lg overflow-hidden bg-card border border-border hover:border-primary/40 transition-all duration-300">
          <div className="relative aspect-video overflow-hidden">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />

            {video.isVip && (
              <span className="absolute top-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gradient-vip text-accent-foreground text-[10px] font-semibold">
                <Crown className="w-2.5 h-2.5" />
                VIP
              </span>
            )}

            <span className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-secondary/80 text-secondary-foreground text-[10px]">
              <Clock className="w-2.5 h-2.5" />
              {video.duration}
            </span>
          </div>

          <div className="p-2 md:p-3">
            <h3 className="font-medium text-xs md:text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">
              {video.title}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-muted-foreground text-[10px] md:text-xs">
              <Eye className="w-2.5 h-2.5 md:w-3 md:h-3" />
              {formatViews(video.views)} views
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default VideoCard;
