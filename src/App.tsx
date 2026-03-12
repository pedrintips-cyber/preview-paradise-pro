import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import VideoDetail from "./pages/VideoDetail.tsx";
import CategoryPage from "./pages/CategoryPage.tsx";
import VipPage from "./pages/VipPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLogin from "./pages/admin/AdminLogin.tsx";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminBanners from "./pages/admin/AdminBanners.tsx";
import AdminCategories from "./pages/admin/AdminCategories.tsx";
import AdminVideos from "./pages/admin/AdminVideos.tsx";
import AdminVipPlans from "./pages/admin/AdminVipPlans.tsx";
import AdminSettings from "./pages/admin/AdminSettings.tsx";
import CheckoutPage from "./pages/CheckoutPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/video/:id" element={<VideoDetail />} />
          <Route path="/categoria/:slug" element={<CategoryPage />} />
          <Route path="/vip" element={<VipPage />} />
          <Route path="/checkout/:planId" element={<CheckoutPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="categorias" element={<AdminCategories />} />
            <Route path="videos" element={<AdminVideos />} />
            <Route path="vip" element={<AdminVipPlans />} />
            <Route path="config" element={<AdminSettings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
