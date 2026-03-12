import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Affiliate } from "./AffiliateLayout";

const gateways = [
  { id: "paradise", name: "Paradise Pags", description: "Gateway PIX com recebimento direto" },
  { id: "mercadopago", name: "Mercado Pago", description: "Receba via PIX, cartão e boleto" },
];

const AffiliateGateway = () => {
  const { affiliate, setAffiliate } = useOutletContext<{ affiliate: Affiliate; setAffiliate: (a: Affiliate) => void }>();
  const [token, setToken] = useState(affiliate.gateway_token || "");
  const [selectedGateway, setSelectedGateway] = useState(affiliate.gateway_type || "");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!selectedGateway) {
      toast({ title: "Selecione um gateway", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("affiliates")
      .update({ gateway_type: selectedGateway, gateway_token: token || null })
      .eq("id", affiliate.id);

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      setAffiliate({ ...affiliate, gateway_type: selectedGateway, gateway_token: token || null });
      toast({ title: "Gateway salvo com sucesso!" });
    }
    setSaving(false);
  };

  return (
    <div>
      <h1 className="text-xl font-display text-foreground mb-4">GATEWAY</h1>

      <div className="space-y-3 mb-4">
        {gateways.map((gw) => (
          <button
            key={gw.id}
            onClick={() => setSelectedGateway(gw.id)}
            className={`w-full bg-card border rounded-xl p-4 text-left transition-colors ${
              selectedGateway === gw.id ? "border-primary" : "border-border hover:border-muted"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{gw.name}</p>
                  <p className="text-[10px] text-muted-foreground">{gw.description}</p>
                </div>
              </div>
              {selectedGateway === gw.id && <Check className="w-5 h-5 text-primary" />}
            </div>
          </button>
        ))}
      </div>

      {selectedGateway && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-display text-foreground">CONFIGURAÇÃO</h3>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Token / Chave da API</label>
            <Input
              placeholder="sk_..."
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="bg-secondary border-border text-sm h-10"
            />
          </div>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
            <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-yellow-400/80">
              Ao conectar seu gateway, os pagamentos das vendas feitas pelo seu link serão processados diretamente pela sua conta no gateway.
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full bg-primary text-primary-foreground text-xs h-10">
            {saving ? "Salvando..." : "Salvar Gateway"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AffiliateGateway;
