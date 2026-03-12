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
    <section className="py-2 md:py-5 px-2.5 md:px-8">
      <div className="flex items-center justify-between mb-1.5 md:mb-2">
        <h2 className="text-sm md:text-xl font-display text-foreground">
          {title}
        </h2>
        <div className="hidden md:flex gap-1">
          <button
            onClick={() => scroll("left")}
            className="p-1 rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1 rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-1.5 md:gap-3 overflow-x-auto scrollbar-hide pb-1"
      >
        {videos.map((video, i) => (
          <div key={video.id} className="flex-shrink-0 w-[38%] sm:w-[30%] md:w-[22%] lg:w-[18%]">
            <VideoCard video={video} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default VideoGrid;
