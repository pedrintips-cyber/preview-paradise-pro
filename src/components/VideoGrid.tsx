import VideoCard from "@/components/VideoCard";
import type { Video } from "@/data/mockData";

interface VideoGridProps {
  videos: Video[];
  title: string;
}

const VideoGrid = ({ videos, title }: VideoGridProps) => {
  return (
    <section className="py-3 md:py-8 px-3 md:px-8">
      <h2 className="text-lg md:text-3xl font-display text-foreground mb-3">
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
        {videos.map((video, i) => (
          <VideoCard key={video.id} video={video} index={i} />
        ))}
      </div>
    </section>
  );
};

export default VideoGrid;
