import { Link } from "react-router-dom";
import { Crown, Eye, Clock } from "lucide-react";
import { motion } from "framer-motion";
import type { Video } from "@/data/mockData";

interface VideoCardProps {
  video: Video;
  index?: number;
}

interface VideoCardDBProps {
  video: {
    id: string;
    title: string;
    thumbnail_url?: string | null;
    duration?: string | null;
    views?: number | null;
    is_vip?: boolean | null;
  };
  index?: number;
}

export const VideoCardDB = ({ video, index = 0 }: VideoCardDBProps) => {
  const formatViews = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
    >
      <Link to={`/video/${video.id}`} className="group block">
        <div className="relative rounded-md overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-300">
          <div className="relative aspect-video overflow-hidden">
            <img
              src={video.thumbnail_url || "/placeholder.svg"}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card/70 via-transparent to-transparent" />
            {video.is_vip && (
              <span className="absolute top-1 right-1 flex items-center gap-0.5 px-1.5 py-[2px] rounded bg-primary/90 text-primary-foreground text-[9px] font-semibold">
                <Crown className="w-2.5 h-2.5" />
                VIP
              </span>
            )}
            {video.duration && (
              <span className="absolute bottom-1 right-1 flex items-center gap-0.5 px-1.5 py-[2px] rounded bg-secondary/80 text-secondary-foreground text-[9px]">
                <Clock className="w-2.5 h-2.5" />
                {video.duration}
              </span>
            )}
          </div>
          <div className="p-2">
            <h3 className="font-medium text-xs text-foreground line-clamp-1 group-hover:text-primary transition-colors leading-tight">
              {video.title}
            </h3>
            <div className="flex items-center gap-1 mt-0.5 text-muted-foreground text-[9px]">
              <Eye className="w-2.5 h-2.5" />
              {formatViews(video.views || 0)}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const VideoCard = ({ video, index = 0 }: VideoCardProps) => {
  const formatViews = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
    >
      <Link to={`/video/${video.id}`} className="group block">
        <div className="relative rounded-md overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-300">
          <div className="relative aspect-video overflow-hidden">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card/70 via-transparent to-transparent" />
            {video.isVip && (
              <span className="absolute top-1 right-1 flex items-center gap-0.5 px-1.5 py-[2px] rounded bg-primary/90 text-primary-foreground text-[9px] font-semibold">
                <Crown className="w-2.5 h-2.5" />
                VIP
              </span>
            )}
            <span className="absolute bottom-1 right-1 flex items-center gap-0.5 px-1.5 py-[2px] rounded bg-secondary/80 text-secondary-foreground text-[9px]">
              <Clock className="w-2.5 h-2.5" />
              {video.duration}
            </span>
          </div>
          <div className="p-2">
            <h3 className="font-medium text-xs text-foreground line-clamp-1 group-hover:text-primary transition-colors leading-tight">
              {video.title}
            </h3>
            <div className="flex items-center gap-1 mt-0.5 text-muted-foreground text-[9px]">
              <Eye className="w-2.5 h-2.5" />
              {formatViews(video.views)}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default VideoCard;
