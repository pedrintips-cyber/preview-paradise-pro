import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Check, AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Affiliate } from "./AffiliateLayout";

const AffiliateGateway = () => {
  const { affiliate, setAffiliate } = useOutletContext<{ affiliate: Affiliate; setAffiliate: (a: Affiliate) => void }>();
  const [token, setToken] = useState(affiliate.gateway_token || "");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const isConnected = !!affiliate.gateway_token;

  const handleSave = async () => {
    if (!token.trim()) {
      toast({ title: "Insira o token da API", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("affiliates")
      .update({ gateway_type: "paradise", gateway_token: token.trim() })
      .eq("id", affiliate.id);

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      setAffiliate({ ...affiliate, gateway_type: "paradise", gateway_token: token.trim() });
      toast({ title: "Gateway conectado com sucesso!" });
    }
    setSaving(false);
  };

  const handleDisconnect = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("affiliates")
      .update({ gateway_type: null, gateway_token: null })
      .eq("id", affiliate.id);

    if (error) {
      toast({ title: "Erro ao desconectar", description: error.message, variant: "destructive" });
    } else {
      setAffiliate({ ...affiliate, gateway_type: null, gateway_token: null });
      setToken("");
      toast({ title: "Gateway desconectado" });
    }
    setSaving(false);
  };

  return (
    <div>
      <h1 className="text-xl font-display text-foreground mb-4">GATEWAY</h1>

      {/* Status card */}
      <div className={`rounded-xl border p-4 mb-4 ${isConnected ? "border-green-500/30 bg-green-500/5" : "border-border bg-card"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isConnected ? "bg-green-500/10" : "bg-primary/10"}`}>
            {isConnected ? <Check className="w-5 h-5 text-green-400" /> : <CreditCard className="w-5 h-5 text-primary" />}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {isConnected ? "Gateway Conectado" : "Gateway Desconectado"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {isConnected ? "Paradise Pags • Recebimento direto ativo" : "Conecte seu gateway para receber vendas diretamente"}
            </p>
          </div>
        </div>
      </div>

      {/* Paradise Pags card */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Paradise Pags</p>
            <p className="text-[10px] text-muted-foreground">Gateway PIX com recebimento direto</p>
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Token da API (X-API-Key)</label>
          <Input
            placeholder="Seu token da Paradise Pags"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="bg-secondary border-border text-sm h-10"
          />
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-[10px] text-muted-foreground space-y-1">
            <p><strong className="text-foreground">Como funciona:</strong></p>
            <p>• Quando alguém comprar pelo seu link, <span className="text-primary font-medium">100% do valor</span> vai direto pro seu gateway</p>
            <p>• Sem necessidade de saque — o dinheiro cai automático!</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving} className="flex-1 bg-primary text-primary-foreground text-xs h-10">
            {saving ? "Salvando..." : isConnected ? "Atualizar Token" : "Conectar Gateway"}
          </Button>
          {isConnected && (
            <Button onClick={handleDisconnect} disabled={saving} variant="outline" className="text-xs h-10 border-destructive/30 text-destructive hover:bg-destructive/10">
              Desconectar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AffiliateGateway;
