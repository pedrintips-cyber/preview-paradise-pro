import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, TrendingUp, MousePointerClick, Zap } from "lucide-react";
import type { Affiliate } from "./AffiliateLayout";

const AffiliateDashboard = () => {
  const { affiliate } = useOutletContext<{ affiliate: Affiliate }>();
  const [stats, setStats] = useState({
    totalClicks: 0,
    totalSales: 0,
    totalEarned: 0,
    todayClicks: 0,
    todaySales: 0,
  });
  const [recentSales, setRecentSales] = useState<any[]>([]);

  useEffect(() => {
    if (!affiliate) return;
    const load = async () => {
      const today = new Date().toISOString().split("T")[0];

      const [clicksRes, todayClicksRes, salesRes, todaySalesRes, recentRes] = await Promise.all([
        supabase.from("affiliate_clicks").select("id", { count: "exact", head: true }).eq("affiliate_id", affiliate.id),
        supabase.from("affiliate_clicks").select("id", { count: "exact", head: true }).eq("affiliate_id", affiliate.id).gte("created_at", today),
        supabase.from("affiliate_sales").select("commission_amount").eq("affiliate_id", affiliate.id).eq("status", "approved"),
        supabase.from("affiliate_sales").select("id", { count: "exact", head: true }).eq("affiliate_id", affiliate.id).gte("created_at", today),
        supabase.from("affiliate_sales").select("*, vip_plans(name)").eq("affiliate_id", affiliate.id).order("created_at", { ascending: false }).limit(5),
      ]);

      const totalEarned = salesRes.data?.reduce((s, r) => s + Number(r.commission_amount), 0) || 0;

      setStats({
        totalClicks: clicksRes.count || 0,
        totalSales: salesRes.data?.length || 0,
        totalEarned,
        todayClicks: todayClicksRes.count || 0,
        todaySales: todaySalesRes.count || 0,
      });
      setRecentSales(recentRes.data || []);
    };
    load();
  }, [affiliate]);

  const hasGateway = !!affiliate.gateway_token;

  const cards = [
    { label: "Cliques Totais", value: stats.totalClicks, icon: MousePointerClick, sub: `Hoje: ${stats.todayClicks}` },
    { label: "Vendas", value: stats.totalSales, icon: ShoppingCart, sub: `Hoje: ${stats.todaySales}` },
    { label: "Total Recebido", value: `R$${stats.totalEarned.toFixed(2).replace(".", ",")}`, icon: TrendingUp, sub: hasGateway ? "Direto no gateway" : `Comissão: ${affiliate.commission_rate}%` },
    { label: "Gateway", value: hasGateway ? "Ativo" : "Inativo", icon: Zap, sub: hasGateway ? "80% direto p/ você" : "Conecte seu gateway" },
  ];

  return (
    <div>
      <h1 className="text-xl font-display text-foreground mb-4">DASHBOARD</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {cards.map((c, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <c.icon className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-lg md:text-xl font-bold text-foreground">{c.value}</p>
            <p className="text-[10px] text-muted-foreground">{c.label}</p>
            <p className="text-[9px] text-primary mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-display text-foreground mb-3">VENDAS RECENTES</h3>
        {recentSales.length > 0 ? (
          <div className="space-y-2">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-xs text-foreground">{sale.vip_plans?.name || "Plano"}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(sale.created_at).toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-primary">+R${Number(sale.commission_amount).toFixed(2).replace(".", ",")}</p>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                    sale.status === "approved" ? "bg-green-500/10 text-green-400" :
                    sale.status === "pending" ? "bg-yellow-500/10 text-yellow-400" :
                    "bg-red-500/10 text-red-400"
                  }`}>{sale.status === "approved" ? "Aprovada" : sale.status === "pending" ? "Pendente" : "Cancelada"}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">Nenhuma venda ainda</p>
        )}
      </div>
    </div>
  );
};

export default AffiliateDashboard;
