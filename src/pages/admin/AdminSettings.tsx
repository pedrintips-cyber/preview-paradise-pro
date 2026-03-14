import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("settings").select("key, value");
      const map: Record<string, string> = {};
      data?.forEach((s) => { map[s.key] = s.value; });
      setSettings(map);
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from("settings").update({ value }).eq("key", key);
    }
    toast({ title: "Configurações salvas!" });
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-xl font-display text-foreground mb-4">Configurações</h1>

      <div className="max-w-md space-y-4">
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-medium text-foreground">Geral</h3>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Nome do site</label>
            <Input
              value={settings.site_name || ""}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
              className="bg-secondary border-border text-sm h-9"
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-medium text-foreground">Plano VIP</h3>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Preço (R$)</label>
            <Input
              type="number"
              step="0.01"
              value={settings.vip_price || ""}
              onChange={(e) => setSettings({ ...settings, vip_price: e.target.value })}
              className="bg-secondary border-border text-sm h-9"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Período</label>
            <select
              value={settings.vip_period || "ano"}
              onChange={(e) => setSettings({ ...settings, vip_period: e.target.value })}
              className="w-full bg-secondary border border-border rounded-md text-sm h-9 px-2 text-foreground"
            >
              <option value="mes">Mês</option>
              <option value="trimestre">Trimestre</option>
              <option value="ano">Ano</option>
            </select>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-medium text-foreground">Entregável (Pós-Pagamento)</h3>
          <p className="text-[10px] text-muted-foreground">Link que será exibido ao cliente após a confirmação do pagamento (ex: grupo do WhatsApp/Telegram).</p>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Link do grupo</label>
            <Input
              value={settings.group_link || ""}
              onChange={(e) => setSettings({ ...settings, group_link: e.target.value })}
              placeholder="https://chat.whatsapp.com/..."
              className="bg-secondary border-border text-sm h-9"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Texto do botão</label>
            <Input
              value={settings.group_link_label || ""}
              onChange={(e) => setSettings({ ...settings, group_link_label: e.target.value })}
              placeholder="Entrar no Grupo VIP"
              className="bg-secondary border-border text-sm h-9"
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-9">
          <Save className="w-3.5 h-3.5 mr-1.5" />
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
