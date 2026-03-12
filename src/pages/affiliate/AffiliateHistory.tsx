import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { History, ArrowDownToLine, ShoppingCart } from "lucide-react";
import type { Affiliate } from "./AffiliateLayout";

const AffiliateHistory = () => {
  const { affiliate } = useOutletContext<{ affiliate: Affiliate }>();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!affiliate) return;
    const load = async () => {
      const [salesRes, withdrawalsRes] = await Promise.all([
        supabase.from("affiliate_sales").select("id, commission_amount, status, created_at, vip_plans(name)").eq("affiliate_id", affiliate.id),
        supabase.from("affiliate_withdrawals").select("id, amount, status, created_at").eq("affiliate_id", affiliate.id),
      ]);

      const all = [
        ...(salesRes.data || []).map((s: any) => ({ ...s, type: "sale" })),
        ...(withdrawalsRes.data || []).map((w: any) => ({ ...w, type: "withdrawal" })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setEvents(all);
      setLoading(false);
    };
    load();
  }, [affiliate]);

  if (loading) return <div className="flex justify-center py-12"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-xl font-display text-foreground mb-4">HISTÓRICO</h1>

      {events.length > 0 ? (
        <div className="space-y-2">
          {events.map((ev) => (
            <div key={ev.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${ev.type === "sale" ? "bg-green-500/10" : "bg-blue-500/10"}`}>
                  {ev.type === "sale" ? <ShoppingCart className="w-4 h-4 text-green-400" /> : <ArrowDownToLine className="w-4 h-4 text-blue-400" />}
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">
                    {ev.type === "sale" ? `Venda - ${ev.vip_plans?.name || "Plano"}` : "Saque"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(ev.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${ev.type === "sale" ? "text-green-400" : "text-blue-400"}`}>
                  {ev.type === "sale" ? "+" : "-"}R${Number(ev.commission_amount || ev.amount).toFixed(2).replace(".", ",")}
                </p>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                  ev.status === "approved" || ev.status === "completed" ? "bg-green-500/10 text-green-400" :
                  ev.status === "pending" ? "bg-yellow-500/10 text-yellow-400" :
                  "bg-red-500/10 text-red-400"
                }`}>{ev.status === "approved" || ev.status === "completed" ? "Concluído" : ev.status === "pending" ? "Pendente" : "Cancelado"}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhum registro no histórico</p>
        </div>
      )}
    </div>
  );
};

export default AffiliateHistory;
