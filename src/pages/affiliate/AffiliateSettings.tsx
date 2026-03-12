import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Affiliate } from "./AffiliateLayout";

const AffiliateSettings = () => {
  const { affiliate, setAffiliate } = useOutletContext<{ affiliate: Affiliate; setAffiliate: (a: Affiliate) => void }>();
  const [form, setForm] = useState({
    name: affiliate.name,
    phone: affiliate.email || "",
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("affiliates")
      .update({ name: form.name })
      .eq("id", affiliate.id);

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      setAffiliate({ ...affiliate, name: form.name });
      toast({ title: "Configurações salvas!" });
    }
    setSaving(false);
  };

  return (
    <div>
      <h1 className="text-xl font-display text-foreground mb-4">CONFIGURAÇÕES</h1>

      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Perfil</p>
            <p className="text-[10px] text-muted-foreground">{affiliate.email}</p>
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Nome</label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-secondary border-border text-sm h-10"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Slug (seu identificador no link)</label>
          <Input
            value={affiliate.slug}
            disabled
            className="bg-secondary border-border text-sm h-10 opacity-60"
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full bg-primary text-primary-foreground text-xs h-10">
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
};

export default AffiliateSettings;
