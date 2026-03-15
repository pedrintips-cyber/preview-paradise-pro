import { Link } from "react-router-dom";
import { Crown, Eye } from "lucide-react";
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

  return (
    <Link to={`/video/${video.id}`} className="group block">
      <div className="relative rounded-lg overflow-hidden bg-card">
        {/* Thumbnail */}
        <div className="relative aspect-[9/13] overflow-hidden">
          {video.thumbnail_url ? (
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : video.video_url ? (
            <video
              src={video.video_url}
              muted
              preload="metadata"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}

          {/* Simple dark gradient at bottom for text */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />

          {/* VIP badge */}
          {video.is_vip && (
            <div className="absolute top-1.5 left-1.5">
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gradient-vip text-gold-foreground text-[9px] font-bold">
                <Crown className="w-2.5 h-2.5" />
                VIP
              </span>
            </div>
          )}

          {/* Bottom info */}
          <div className="absolute bottom-0 inset-x-0 p-2">
            <h3 className="font-body font-medium text-[11px] text-background line-clamp-2 leading-snug mb-1">
              {video.title}
            </h3>
            <div className="flex items-center gap-1 text-background/60 text-[9px]">
              <Eye className="w-2.5 h-2.5" />
              <span>{formatViews(video.views || 0)}</span>
              {video.duration && (
                <>
                  <span className="mx-0.5">·</span>
                  <span>{video.duration}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
