import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import CategoryBar from "@/components/CategoryBar";
import VideoGrid from "@/components/VideoGrid";
import { videos } from "@/data/mockData";

const Index = () => {
  const freeVideos = videos.filter((v) => !v.isVip);
  const vipVideos = videos.filter((v) => v.isVip);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-11 md:pt-14">
        <HeroBanner />
        <CategoryBar />
        <VideoGrid videos={freeVideos} title="Vídeos Gratuitos" />
        <VideoGrid videos={vipVideos} title="🔥 Conteúdo VIP" />
      </main>
    </div>
  );
};

export default Index;
