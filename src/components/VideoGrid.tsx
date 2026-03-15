import VideoCard from "@/components/VideoCard";
import type { DBVideo } from "@/types/database";

interface VideoGridProps {
  videos: DBVideo[];
  title: string;
}

const VideoGrid = ({ videos, title }: VideoGridProps) => {
  if (videos.length === 0) return null;

  return (
    <section className="py-4 md:py-8">
      <div className="flex items-center gap-3 mb-3 md:mb-4 px-4 md:px-10">
        <div className="w-1 h-6 md:h-7 rounded-full bg-primary" />
        <h2 className="text-lg md:text-2xl font-display text-foreground tracking-wide">{title}</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 px-4 md:px-10">
        {videos.map((video, i) => (
          <VideoCard key={video.id} video={video} index={i} />
        ))}
      </div>
    </section>
  );
};

export default VideoGrid;
