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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link to={`/video/${video.id}`} className="group block">
        <div className="relative rounded-lg overflow-hidden bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow">
          <div className="relative aspect-video overflow-hidden">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-80" />

            {video.isVip && (
              <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded bg-gradient-vip text-accent-foreground text-xs font-semibold">
                <Crown className="w-3 h-3" />
                VIP
              </span>
            )}

            <span className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded bg-secondary/80 text-secondary-foreground text-xs">
              <Clock className="w-3 h-3" />
              {video.duration}
            </span>
          </div>

          <div className="p-3">
            <h3 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {video.title}
            </h3>
            <div className="flex items-center gap-1 mt-1.5 text-muted-foreground text-xs">
              <Eye className="w-3 h-3" />
              {formatViews(video.views)} views
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default VideoCard;
