import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import VideoCard from "@/components/VideoCard";
import type { DBVideo } from "@/types/database";

interface VideoGridProps {
  videos: DBVideo[];
  title: string;
}

const VideoGrid = ({ videos, title }: VideoGridProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener("scroll", checkScroll);
    return () => el?.removeEventListener("scroll", checkScroll);
  }, [videos]);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.75;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (videos.length === 0) return null;

  return (
    <section className="py-4 md:py-8">
      <div className="flex items-center justify-between mb-3 md:mb-4 px-4 md:px-10">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 md:h-7 rounded-full bg-primary" />
          <h2 className="text-lg md:text-2xl font-display text-foreground tracking-wide">{title}</h2>
        </div>
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="p-2 rounded-full bg-secondary/80 hover:bg-secondary text-foreground transition-all disabled:opacity-30 disabled:cursor-default"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="p-2 rounded-full bg-secondary/80 hover:bg-secondary text-foreground transition-all disabled:opacity-30 disabled:cursor-default"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Fade edges */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-2 px-4 md:px-10"
        >
          {videos.map((video, i) => (
            <div key={video.id} className="flex-shrink-0 w-[46%] sm:w-[32%] md:w-[23%] lg:w-[19%]">
              <VideoCard video={video} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoGrid;
