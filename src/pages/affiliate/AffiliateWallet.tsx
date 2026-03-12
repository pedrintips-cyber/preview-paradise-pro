import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, TrendingUp, DollarSign, Zap } from "lucide-react";
import type { Affiliate } from "./AffiliateLayout";

const AffiliateWallet = () => {
  const { affiliate } = useOutletContext<{ affiliate: Affiliate }>();
  const [totalSales, setTotalSales] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [salesCount, setSalesCount] = useState(0);

  useEffect(() => {
    if (!affiliate) return;
    const load = async () => {
      const { data } = await supabase
        .from("affiliate_sales")
        .select("sale_amount, commission_amount")
        .eq("affiliate_id", affiliate.id)
        .eq("status", "approved");

      if (data) {
        setTotalSales(data.reduce((s, r) => s + Number(r.sale_amount), 0));
        setTotalEarned(data.reduce((s, r) => s + Number(r.commission_amount), 0));
        setSalesCount(data.length);
      }
    };
    load();
  }, [affiliate]);

  const hasGateway = !!affiliate.gateway_token;

  return (
    <div>
      <h1 className="text-xl font-display text-foreground mb-4">CARTEIRA</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-xs text-muted-foreground">Total Recebido</p>
          </div>
          <p className="text-2xl font-bold text-foreground">R${totalEarned.toFixed(2).replace(".", ",")}</p>
          <p className="text-[10px] text-muted-foreground mt-1">100% direto no seu gateway</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Total em Vendas</p>
          </div>
          <p className="text-2xl font-bold text-foreground">R${totalSales.toFixed(2).replace(".", ",")}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{salesCount} vendas realizadas</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-xs text-muted-foreground">Sua Comissão</p>
          </div>
          <p className="text-2xl font-bold text-primary">100%</p>
          <p className="text-[10px] text-muted-foreground mt-1">Tudo vai pra você</p>
        </div>
      </div>

      {/* Gateway status */}
      <div className="mt-4 bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-display text-foreground mb-3">FORMA DE RECEBIMENTO</h3>
        {hasGateway ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
            <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">Paradise Pags Conectado</p>
              <p className="text-[10px] text-muted-foreground">100% das vendas caem direto no seu gateway automaticamente</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
            <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">Gateway não conectado</p>
              <p className="text-[10px] text-muted-foreground">Conecte seu gateway na aba "Gateway" para receber automaticamente</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AffiliateWallet;
