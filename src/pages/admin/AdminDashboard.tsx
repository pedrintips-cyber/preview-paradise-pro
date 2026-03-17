import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Eye, Crown, Video, TrendingUp, DollarSign, Clock, CheckCircle2, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Area, AreaChart } from "recharts";

interface Purchase {
  id: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  status: string;
  created_at: string | null;
  plan_id: string | null;
}

type SalesPeriod = "1d" | "7d" | "30d" | "all";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalViews: 0, vipClicks: 0, purchases: 0, totalVideos: 0 });
  const [periodRevenue, setPeriodRevenue] = useState(0);
  const [periodSalesCount, setPeriodSalesCount] = useState(0);
  const [viewsChart, setViewsChart] = useState<{ date: string; views: number }[]>([]);
  const [salesChart, setSalesChart] = useState<{ date: string; revenue: number; count: number }[]>([]);
  const [recentSales, setRecentSales] = useState<Purchase[]>([]);
  const [salesPeriod, setSalesPeriod] = useState<SalesPeriod>("7d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadSalesChart();
  }, [salesPeriod]);

  const loadData = async () => {
    const [viewsRes, clicksRes, purchasesRes, videosRes, recentRes] = await Promise.all([
      supabase.from("analytics").select("id", { count: "exact" }).eq("event_type", "view"),
      supabase.from("analytics").select("id", { count: "exact" }).eq("event_type", "vip_click"),
      supabase.from("purchases").select("id", { count: "exact" }),
      supabase.from("videos").select("id", { count: "exact" }),
      supabase.from("purchases").select("*").order("created_at", { ascending: false }).limit(20),
    ]);

    setStats({
      totalViews: viewsRes.count || 0,
      vipClicks: clicksRes.count || 0,
      purchases: purchasesRes.count || 0,
      totalVideos: videosRes.count || 0,
    });

    setRecentSales((recentRes.data as Purchase[]) || []);

    // Views chart (7 days)
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

  const loadSalesChart = async () => {
    let daysBack = 1;
    if (salesPeriod === "7d") daysBack = 7;
    if (salesPeriod === "30d") daysBack = 30;
    if (salesPeriod === "all") daysBack = 365;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const { data: purchasesData } = await supabase
      .from("purchases")
      .select("amount, status, created_at")
      .eq("status", "approved")
      .gte("created_at", startDate.toISOString())
      .order("created_at");

    const chartMap: Record<string, { revenue: number; count: number }> = {};
    
    if (salesPeriod === "1d") {
      // Hourly breakdown for today
      for (let h = 0; h < 24; h++) {
        const key = `${h.toString().padStart(2, "0")}h`;
        chartMap[key] = { revenue: 0, count: 0 };
      }
      purchasesData?.forEach((row) => {
        const d = new Date(row.created_at!);
        const key = `${d.getHours().toString().padStart(2, "0")}h`;
        if (chartMap[key] !== undefined) {
          chartMap[key].revenue += row.amount / 100;
          chartMap[key].count += 1;
        }
      });
    } else {
      const displayDays = salesPeriod === "all" ? 30 : daysBack;
      for (let i = displayDays - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
        chartMap[key] = { revenue: 0, count: 0 };
      }
      purchasesData?.forEach((row) => {
        const d = new Date(row.created_at!);
        const key = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
        if (chartMap[key] !== undefined) {
          chartMap[key].revenue += row.amount / 100;
          chartMap[key].count += 1;
        }
      });
    }

    setSalesChart(Object.entries(chartMap).map(([date, data]) => ({ date, ...data })));
  };

  const formatCurrency = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  const statusBadge = (status: string) => {
    if (status === "approved") return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3" /> Aprovado
      </span>
    );
    if (status === "pending") return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">
        <Clock className="w-3 h-3" /> Pendente
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
        <XCircle className="w-3 h-3" /> {status}
      </span>
    );
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const statCards = [
    { label: "Receita Total", value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: "text-green-400" },
    { label: "Vendas Aprovadas", value: stats.approvedSales, icon: TrendingUp, color: "text-green-400" },
    { label: "Visualizações", value: stats.totalViews, icon: Eye, color: "text-blue-400" },
    { label: "Cliques VIP", value: stats.vipClicks, icon: Crown, color: "text-primary" },
    { label: "Total Compras", value: stats.purchases, icon: TrendingUp, color: "text-yellow-400" },
    { label: "Vídeos", value: stats.totalVideos, icon: Video, color: "text-accent" },
  ];

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-display text-foreground mb-4">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {statCards.map((s) => (
          <div key={s.label} className="bg-card rounded-lg border border-border p-3">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-[10px] text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Sales Chart */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-display text-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              Vendas
            </h3>
            <div className="flex gap-1">
              {(["1d", "7d", "30d", "all"] as SalesPeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setSalesPeriod(p)}
                  className={`text-[9px] px-2 py-1 rounded-md transition-colors ${
                    salesPeriod === p
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p === "1d" ? "Diário" : p === "7d" ? "Semanal" : p === "30d" ? "Mensal" : "Tudo"}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={salesChart}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142 72% 51%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142 72% 51%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14%)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(0 0% 55%)" }} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(0 0% 55%)" }} tickFormatter={(v) => `R$${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 14%)", borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: "hsl(0 0% 95%)" }}
                formatter={(value: number) => [formatCurrency(value), "Receita"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(142 72% 51%)" strokeWidth={2} fill="url(#salesGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Views Chart */}
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
      </div>

      {/* Sales History */}
      <div className="bg-card rounded-lg border border-border p-4">
        <h3 className="text-sm font-display text-foreground mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Histórico de Vendas
        </h3>

        {recentSales.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">Nenhuma venda registrada ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-[10px] text-muted-foreground font-medium py-2 pr-3">Data</th>
                  <th className="text-[10px] text-muted-foreground font-medium py-2 pr-3">Cliente</th>
                  <th className="text-[10px] text-muted-foreground font-medium py-2 pr-3">Valor</th>
                  <th className="text-[10px] text-muted-foreground font-medium py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="border-b border-border/50 last:border-0">
                    <td className="text-[11px] text-muted-foreground py-2.5 pr-3 whitespace-nowrap">
                      {sale.created_at ? new Date(sale.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td className="text-[11px] text-foreground py-2.5 pr-3 max-w-[120px] truncate">
                      {sale.customer_name || sale.customer_email}
                    </td>
                    <td className="text-[11px] text-foreground font-medium py-2.5 pr-3 whitespace-nowrap">
                      {formatCurrency(sale.amount / 100)}
                    </td>
                    <td className="py-2.5">
                      {statusBadge(sale.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
