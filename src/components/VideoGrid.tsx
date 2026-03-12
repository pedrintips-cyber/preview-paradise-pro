import VideoCard from "@/components/VideoCard";
import type { Video } from "@/data/mockData";

interface VideoGridProps {
  videos: Video[];
  title: string;
}

const VideoGrid = ({ videos, title }: VideoGridProps) => {
  return (
    <section className="py-8 px-4 md:px-8">
      <h2 className="text-3xl md:text-4xl font-display text-foreground mb-6">
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {videos.map((video, i) => (
          <VideoCard key={video.id} video={video} index={i} />
        ))}
      </div>
    </section>
  );
};

export default VideoGrid;
