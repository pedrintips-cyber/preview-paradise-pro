import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart } from "lucide-react";
import type { Affiliate } from "./AffiliateLayout";

const AffiliateSales = () => {
  const { affiliate } = useOutletContext<{ affiliate: Affiliate }>();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!affiliate) return;
    const load = async () => {
      const { data } = await supabase
        .from("affiliate_sales")
        .select("*, vip_plans(name, price)")
        .eq("affiliate_id", affiliate.id)
        .order("created_at", { ascending: false });
      setSales(data || []);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel("affiliate-sales")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "affiliate_sales", filter: `affiliate_id=eq.${affiliate.id}` }, (payload) => {
        setSales((prev) => [payload.new as any, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [affiliate]);

  if (loading) return <div className="flex justify-center py-12"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-xl font-display text-foreground mb-4">VENDAS</h1>

      {sales.length > 0 ? (
        <div className="space-y-2">
          {sales.map((sale) => (
            <div key={sale.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">{sale.vip_plans?.name || "Plano VIP"}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(sale.created_at).toLocaleDateString("pt-BR")} às {new Date(sale.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary">+R${Number(sale.commission_amount).toFixed(2).replace(".", ",")}</p>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                  sale.status === "approved" ? "bg-green-500/10 text-green-400" :
                  sale.status === "pending" ? "bg-yellow-500/10 text-yellow-400" :
                  "bg-red-500/10 text-red-400"
                }`}>
                  {sale.status === "approved" ? "Aprovada" : sale.status === "pending" ? "Pendente" : "Cancelada"}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhuma venda registrada</p>
        </div>
      )}
    </div>
  );
};

export default AffiliateSales;
