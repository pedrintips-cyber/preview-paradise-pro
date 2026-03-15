import { Link } from "react-router-dom";
import { Crown, Eye, Play, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCheckout } from "@/contexts/CheckoutContext";
import type { DBVideo } from "@/types/database";

interface VideoCardProps {
  video: DBVideo;
  index?: number;
}

const VideoCard = ({ video, index = 0 }: VideoCardProps) => {
  const { openCheckout } = useCheckout();

  const formatViews = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
  };

  return (
    <div className="group block">
      <div className="relative rounded-2xl overflow-hidden bg-card shadow-card border-2 border-border group-hover:border-primary/40 transition-all group-hover:-translate-y-1 group-hover:shadow-glow">
        {/* Thumbnail */}
        <Link to={`/video/${video.id}`}>
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
        </Link>

        {/* Action buttons */}
        <div className="flex gap-1 p-1.5">
          <Link to={`/video/${video.id}`} className="flex-1 min-w-0">
            <Button
              size="sm"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-[9px] font-bold h-7 rounded-lg shadow-[0_2px_0px_hsl(25_80%_40%)] active:shadow-none active:translate-y-[2px] transition-all px-1"
            >
              <Play className="w-3 h-3 mr-0.5 flex-shrink-0" />
              Ver mais
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openCheckout();
            }}
            className="flex-1 min-w-0 bg-success hover:bg-success/90 text-success-foreground text-[9px] font-bold h-7 rounded-lg shadow-[0_2px_0px_hsl(145_50%_30%)] active:shadow-none active:translate-y-[2px] transition-all px-1"
          >
            <ShoppingCart className="w-3 h-3 mr-0.5 flex-shrink-0" />
            Assinar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
