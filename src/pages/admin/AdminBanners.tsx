import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  is_vip: boolean | null;
  sort_order: number | null;
  active: boolean | null;
}

const AdminBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", subtitle: "", image_url: "", is_vip: false });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const loadBanners = async () => {
    const { data } = await supabase.from("banners").select("*").order("sort_order");
    setBanners(data || []);
    setLoading(false);
  };

  useEffect(() => { loadBanners(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `banners/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) {
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: publicUrl }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title || !form.image_url) {
      toast({ title: "Preencha título e imagem", variant: "destructive" });
      return;
    }

    if (editing) {
      await supabase.from("banners").update({
        title: form.title,
        subtitle: form.subtitle,
        image_url: form.image_url,
        is_vip: form.is_vip,
      }).eq("id", editing.id);
      toast({ title: "Banner atualizado!" });
    } else {
      await supabase.from("banners").insert({
        title: form.title,
        subtitle: form.subtitle,
        image_url: form.image_url,
        is_vip: form.is_vip,
        sort_order: banners.length,
      });
      toast({ title: "Banner criado!" });
    }

    setEditing(null);
    setCreating(false);
    setForm({ title: "", subtitle: "", image_url: "", is_vip: false });
    loadBanners();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("banners").delete().eq("id", id);
    toast({ title: "Banner removido" });
    loadBanners();
  };

  const toggleActive = async (banner: Banner) => {
    await supabase.from("banners").update({ active: !banner.active }).eq("id", banner.id);
    loadBanners();
  };

  const openEdit = (banner: Banner) => {
    setEditing(banner);
    setCreating(true);
    setForm({ title: banner.title, subtitle: banner.subtitle || "", image_url: banner.image_url, is_vip: banner.is_vip || false });
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-display text-foreground">Banners</h1>
        <Button size="sm" onClick={() => { setCreating(true); setEditing(null); setForm({ title: "", subtitle: "", image_url: "", is_vip: false }); }} className="bg-primary text-primary-foreground text-xs h-8">
          <Plus className="w-3.5 h-3.5 mr-1" />
          Novo Banner
        </Button>
      </div>

      {creating && (
        <div className="bg-card border border-border rounded-lg p-4 mb-4 space-y-3">
          <h3 className="text-sm font-medium text-foreground">{editing ? "Editar" : "Novo"} Banner</h3>
          <Input placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-secondary border-border text-sm h-9" />
          <Input placeholder="Subtítulo" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="bg-secondary border-border text-sm h-9" />
          
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Imagem</label>
            <input type="file" accept="image/*" onChange={handleUpload} className="text-xs text-muted-foreground" />
            {uploading && <span className="text-xs text-primary ml-2">Enviando...</span>}
            {form.image_url && <img src={form.image_url} alt="" className="mt-2 h-20 rounded object-cover" />}
          </div>

          <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
            <input type="checkbox" checked={form.is_vip} onChange={(e) => setForm({ ...form, is_vip: e.target.checked })} className="rounded" />
            Conteúdo VIP
          </label>

          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} className="bg-primary text-primary-foreground text-xs h-8">Salvar</Button>
            <Button size="sm" variant="outline" onClick={() => { setCreating(false); setEditing(null); }} className="text-xs h-8">Cancelar</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {banners.map((banner) => (
          <div key={banner.id} className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
            <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0 cursor-grab" />
            <img src={banner.image_url} alt={banner.title} className="w-20 h-12 rounded object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{banner.title}</p>
              <p className="text-[10px] text-muted-foreground truncate">{banner.subtitle}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button onClick={() => toggleActive(banner)} className={`p-1.5 rounded ${banner.active ? "text-green-400" : "text-muted-foreground"}`}>
                {banner.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => openEdit(banner)} className="p-1.5 text-muted-foreground hover:text-foreground">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(banner.id)} className="p-1.5 text-muted-foreground hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        {banners.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nenhum banner cadastrado</p>}
      </div>
    </div>
  );
};

export default AdminBanners;
