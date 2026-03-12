import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowDownToLine, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Affiliate } from "./AffiliateLayout";

const AffiliateWithdrawals = () => {
  const { affiliate, setAffiliate } = useOutletContext<{ affiliate: Affiliate; setAffiliate: (a: Affiliate) => void }>();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [requesting, setRequesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!affiliate) return;
    const load = async () => {
      const { data } = await supabase
        .from("affiliate_withdrawals")
        .select("*")
        .eq("affiliate_id", affiliate.id)
        .order("created_at", { ascending: false });
      setWithdrawals(data || []);
      setLoading(false);
    };
    load();
  }, [affiliate]);

  const handleWithdraw = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      toast({ title: "Valor inválido", variant: "destructive" });
      return;
    }
    if (val > Number(affiliate.balance)) {
      toast({ title: "Saldo insuficiente", variant: "destructive" });
      return;
    }
    if (!affiliate.pix_key) {
      toast({ title: "Configure sua chave PIX nas configurações", variant: "destructive" });
      return;
    }

    setRequesting(true);
    const { data, error } = await supabase.from("affiliate_withdrawals").insert({
      affiliate_id: affiliate.id,
      amount: val,
      pix_key: affiliate.pix_key,
      pix_key_type: affiliate.pix_key_type || "cpf",
    }).select().single();

    if (error) {
      toast({ title: "Erro ao solicitar saque", description: error.message, variant: "destructive" });
      setRequesting(false);
      return;
    }

    // Deduct balance
    const newBalance = Number(affiliate.balance) - val;
    await supabase.from("affiliates").update({ balance: newBalance }).eq("id", affiliate.id);
    setAffiliate({ ...affiliate, balance: newBalance });

    setWithdrawals((prev) => [data, ...prev]);
    setAmount("");
    toast({ title: "Saque solicitado com sucesso!" });
    setRequesting(false);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-xl font-display text-foreground mb-4">SAQUES</h1>

      <div className="bg-card border border-border rounded-xl p-5 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Saldo disponível</p>
            <p className="text-xl font-bold text-foreground">R${Number(affiliate.balance).toFixed(2).replace(".", ",")}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Valor do saque"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-secondary border-border text-sm h-10"
          />
          <Button onClick={handleWithdraw} disabled={requesting} className="bg-primary text-primary-foreground text-xs h-10 whitespace-nowrap">
            {requesting ? "..." : "Solicitar Saque"}
          </Button>
        </div>
        {!affiliate.pix_key && (
          <p className="text-[10px] text-destructive mt-2">⚠️ Configure sua chave PIX nas Configurações</p>
        )}
      </div>

      <h3 className="text-sm font-display text-foreground mb-3">HISTÓRICO DE SAQUES</h3>
      {withdrawals.length > 0 ? (
        <div className="space-y-2">
          {withdrawals.map((w) => (
            <div key={w.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <ArrowDownToLine className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-foreground">PIX: {w.pix_key}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(w.created_at).toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">R${Number(w.amount).toFixed(2).replace(".", ",")}</p>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                  w.status === "completed" ? "bg-green-500/10 text-green-400" :
                  w.status === "pending" ? "bg-yellow-500/10 text-yellow-400" :
                  "bg-red-500/10 text-red-400"
                }`}>{w.status === "completed" ? "Pago" : w.status === "pending" ? "Pendente" : "Rejeitado"}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-8">Nenhum saque realizado</p>
      )}
    </div>
  );
};

export default AffiliateWithdrawals;
