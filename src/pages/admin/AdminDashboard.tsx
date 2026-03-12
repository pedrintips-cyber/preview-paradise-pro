import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Eye, Crown, Video, TrendingUp, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalViews: 0, vipClicks: 0, purchases: 0, totalVideos: 0 });
  const [viewsChart, setViewsChart] = useState<{ date: string; views: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // Get counts
      const [viewsRes, clicksRes, purchasesRes, videosRes] = await Promise.all([
        supabase.from("analytics").select("id", { count: "exact" }).eq("event_type", "view"),
        supabase.from("analytics").select("id", { count: "exact" }).eq("event_type", "vip_click"),
        supabase.from("analytics").select("id", { count: "exact" }).eq("event_type", "purchase"),
        supabase.from("videos").select("id", { count: "exact" }),
      ]);

      setStats({
        totalViews: viewsRes.count || 0,
        vipClicks: clicksRes.count || 0,
        purchases: purchasesRes.count || 0,
        totalVideos: videosRes.count || 0,
      });

      // Get views per day (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: analyticsData } = await supabase
        .from("analytics")
        .select("created_at, event_type")
        .gte("created_at", sevenDaysAgo.toISOString())
        .eq("event_type", "view");

      const dayMap: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
        dayMap[key] = 0;
      }

      analyticsData?.forEach((row) => {
        const d = new Date(row.created_at!);
        const key = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
        if (dayMap[key] !== undefined) dayMap[key]++;
      });

      setViewsChart(Object.entries(dayMap).map(([date, views]) => ({ date, views })));
      setLoading(false);
    };

    loadData();
  }, []);

  const statCards = [
    { label: "Visualizações", value: stats.totalViews, icon: Eye, color: "text-blue-400" },
    { label: "Cliques VIP", value: stats.vipClicks, icon: Crown, color: "text-primary" },
    { label: "Compras", value: stats.purchases, icon: TrendingUp, color: "text-green-400" },
    { label: "Vídeos", value: stats.totalVideos, icon: Video, color: "text-accent" },
  ];

  if (loading) return <div className="flex justify-center py-12"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-display text-foreground mb-4">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {statCards.map((s) => (
          <div key={s.label} className="bg-card rounded-lg border border-border p-3">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-[10px] text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="text-sm font-display text-foreground mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Visualizações (7 dias)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={viewsChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(0 0% 55%)" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(0 0% 55%)" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 14%)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "hsl(0 0% 95%)" }}
              />
              <Bar dataKey="views" fill="hsl(0 72% 51%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="text-sm font-display text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            Tendência de Cliques VIP
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={viewsChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(0 0% 55%)" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(0 0% 55%)" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 14%)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "hsl(0 0% 95%)" }}
              />
              <Line type="monotone" dataKey="views" stroke="hsl(142 72% 51%)" strokeWidth={2} dot={{ fill: "hsl(142 72% 51%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
