import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Eye, EyeOff, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VipPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  banner_url: string | null;
  description: string | null;
  active: boolean | null;
  sort_order: number | null;
}

const AdminVipPlans = () => {
  const [plans, setPlans] = useState<VipPlan[]>([]);
  const [editing, setEditing] = useState<VipPlan | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", period: "mensal", banner_url: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const loadPlans = async () => {
    const { data } = await supabase.from("vip_plans").select("*").order("sort_order");
    setPlans((data as VipPlan[]) || []);
    setLoading(false);
  };

  useEffect(() => { loadPlans(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `vip-banners/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) {
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
    setForm((f) => ({ ...f, banner_url: publicUrl }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast({ title: "Preencha nome e preço", variant: "destructive" });
      return;
    }

    const payload = {
      name: form.name,
      price: parseFloat(form.price),
      period: form.period,
      banner_url: form.banner_url || null,
      description: form.description || null,
    };

    if (editing) {
      await supabase.from("vip_plans").update(payload).eq("id", editing.id);
      toast({ title: "Plano atualizado!" });
    } else {
      await supabase.from("vip_plans").insert({ ...payload, sort_order: plans.length });
      toast({ title: "Plano criado!" });
    }

    setEditing(null);
    setCreating(false);
    setForm({ name: "", price: "", period: "mensal", banner_url: "", description: "" });
    loadPlans();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("vip_plans").delete().eq("id", id);
    toast({ title: "Plano removido" });
    loadPlans();
  };

  const toggleActive = async (plan: VipPlan) => {
    await supabase.from("vip_plans").update({ active: !plan.active }).eq("id", plan.id);
    loadPlans();
  };

  const openEdit = (plan: VipPlan) => {
    setEditing(plan);
    setCreating(true);
    setForm({
      name: plan.name,
      price: String(plan.price),
      period: plan.period,
      banner_url: plan.banner_url || "",
      description: plan.description || "",
    });
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-display text-foreground">Planos VIP</h1>
        <Button size="sm" onClick={() => { setCreating(true); setEditing(null); setForm({ name: "", price: "", period: "mensal", banner_url: "", description: "" }); }} className="bg-primary text-primary-foreground text-xs h-8">
          <Plus className="w-3.5 h-3.5 mr-1" />
          Novo Plano
        </Button>
      </div>

      {creating && (
        <div className="bg-card border border-border rounded-lg p-4 mb-4 space-y-3">
          <h3 className="text-sm font-medium text-foreground">{editing ? "Editar" : "Novo"} Plano</h3>
          <Input placeholder="Nome (ex: Plano Mensal)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-secondary border-border text-sm h-9" />
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Preço (ex: 19.90)" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="bg-secondary border-border text-sm h-9" />
            <select
              value={form.period}
              onChange={(e) => setForm({ ...form, period: e.target.value })}
              className="bg-secondary border border-border rounded-md text-sm h-9 px-2 text-foreground"
            >
              <option value="mensal">Mensal</option>
              <option value="trimestral">Trimestral</option>
              <option value="anual">Anual</option>
            </select>
          </div>
          <textarea
            placeholder="Descrição (opcional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-secondary border border-border rounded-md text-sm p-2 text-foreground placeholder:text-muted-foreground resize-none h-16"
          />
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Banner do plano</label>
            <input type="file" accept="image/*" onChange={handleUpload} className="text-xs text-muted-foreground" />
            {uploading && <span className="text-xs text-primary ml-2">Enviando...</span>}
            {form.banner_url && <img src={form.banner_url} alt="" className="mt-2 h-24 rounded object-cover" />}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} className="bg-primary text-primary-foreground text-xs h-8">Salvar</Button>
            <Button size="sm" variant="outline" onClick={() => { setCreating(false); setEditing(null); }} className="text-xs h-8">Cancelar</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {plans.map((plan) => (
          <div key={plan.id} className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
            {plan.banner_url ? (
              <img src={plan.banner_url} alt={plan.name} className="w-20 h-12 rounded object-cover flex-shrink-0" />
            ) : (
              <div className="w-20 h-12 rounded bg-secondary flex items-center justify-center flex-shrink-0">
                <Crown className="w-5 h-5 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{plan.name}</p>
              <p className="text-[10px] text-muted-foreground">R${Number(plan.price).toFixed(2).replace(".", ",")} / {plan.period}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button onClick={() => toggleActive(plan)} className={`p-1.5 rounded ${plan.active ? "text-green-400" : "text-muted-foreground"}`}>
                {plan.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => openEdit(plan)} className="p-1.5 text-muted-foreground hover:text-foreground">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(plan.id)} className="p-1.5 text-muted-foreground hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        {plans.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nenhum plano VIP cadastrado</p>}
      </div>
    </div>
  );
};

export default AdminVipPlans;
