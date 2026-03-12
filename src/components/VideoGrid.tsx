import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import VideoCard from "@/components/VideoCard";
import type { Video } from "@/data/mockData";

interface VideoGridProps {
  videos: Video[];
  title: string;
}

const VideoGrid = ({ videos, title }: VideoGridProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.7;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-3 md:py-6 px-3 md:px-8">
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <h2 className="text-lg md:text-2xl font-display text-foreground">
          {title}
        </h2>
        <div className="hidden md:flex gap-1">
          <button
            onClick={() => scroll("left")}
            className="p-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide pb-2"
      >
        {videos.map((video, i) => (
          <div key={video.id} className="flex-shrink-0 w-[45%] sm:w-[32%] md:w-[23%] lg:w-[19%]">
            <VideoCard video={video} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default VideoGrid;
