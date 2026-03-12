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
              <span className="absolute top-1 right-1 flex items-center gap-0.5 px-1 py-[1px] rounded bg-primary/90 text-primary-foreground text-[8px] font-semibold">
                <Crown className="w-2 h-2" />
                VIP
              </span>
            )}

            <span className="absolute bottom-1 right-1 flex items-center gap-0.5 px-1 py-[1px] rounded bg-secondary/80 text-secondary-foreground text-[8px]">
              <Clock className="w-2 h-2" />
              {video.duration}
            </span>
          </div>

          <div className="p-1.5">
            <h3 className="font-medium text-[10px] md:text-xs text-foreground line-clamp-1 group-hover:text-primary transition-colors leading-tight">
              {video.title}
            </h3>
            <div className="flex items-center gap-1 mt-0.5 text-muted-foreground text-[8px] md:text-[10px]">
              <Eye className="w-2 h-2 md:w-2.5 md:h-2.5" />
              {formatViews(video.views)}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default VideoCard;
