import { useOutletContext } from "react-router-dom";
import { Wallet, TrendingUp, DollarSign, ArrowDownToLine } from "lucide-react";
import type { Affiliate } from "./AffiliateLayout";

const AffiliateWallet = () => {
  const { affiliate } = useOutletContext<{ affiliate: Affiliate }>();

  return (
    <div>
      <h1 className="text-xl font-display text-foreground mb-4">CARTEIRA</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Saldo Disponível</p>
          </div>
          <p className="text-2xl font-bold text-foreground">R${Number(affiliate.balance).toFixed(2).replace(".", ",")}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-xs text-muted-foreground">Total Ganho</p>
          </div>
          <p className="text-2xl font-bold text-foreground">R${Number(affiliate.total_earned).toFixed(2).replace(".", ",")}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-xs text-muted-foreground">Comissão</p>
          </div>
          <p className="text-2xl font-bold text-primary">{affiliate.commission_rate}%</p>
        </div>
      </div>

      <div className="mt-4 bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-display text-foreground mb-2">INFORMAÇÕES</h3>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between py-1.5 border-b border-border">
            <span>Chave PIX</span>
            <span className="text-foreground">{affiliate.pix_key || "Não configurada"}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-border">
            <span>Tipo PIX</span>
            <span className="text-foreground">{affiliate.pix_key_type || "-"}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span>Status</span>
            <span className={affiliate.status === "active" ? "text-green-400" : "text-red-400"}>
              {affiliate.status === "active" ? "Ativo" : "Inativo"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateWallet;
