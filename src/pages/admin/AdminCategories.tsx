import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  sort_order: number | null;
  active: boolean | null;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", image_url: "" });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const loadCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => { loadCategories(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `categories/${Date.now()}.${ext}`;
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

  const generateSlug = (name: string) => name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async () => {
    if (!form.name || !form.image_url) {
      toast({ title: "Preencha nome e imagem", variant: "destructive" });
      return;
    }
    const slug = form.slug || generateSlug(form.name);

    if (editing) {
      await supabase.from("categories").update({ name: form.name, slug, image_url: form.image_url }).eq("id", editing.id);
      toast({ title: "Categoria atualizada!" });
    } else {
      await supabase.from("categories").insert({ name: form.name, slug, image_url: form.image_url, sort_order: categories.length });
      toast({ title: "Categoria criada!" });
    }

    setEditing(null);
    setCreating(false);
    setForm({ name: "", slug: "", image_url: "" });
    loadCategories();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("categories").delete().eq("id", id);
    toast({ title: "Categoria removida" });
    loadCategories();
  };

  const toggleActive = async (cat: Category) => {
    await supabase.from("categories").update({ active: !cat.active }).eq("id", cat.id);
    loadCategories();
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setCreating(true);
    setForm({ name: cat.name, slug: cat.slug, image_url: cat.image_url });
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-display text-foreground">Categorias</h1>
        <Button size="sm" onClick={() => { setCreating(true); setEditing(null); setForm({ name: "", slug: "", image_url: "" }); }} className="bg-primary text-primary-foreground text-xs h-8">
          <Plus className="w-3.5 h-3.5 mr-1" />
          Nova Categoria
        </Button>
      </div>

      {creating && (
        <div className="bg-card border border-border rounded-lg p-4 mb-4 space-y-3">
          <h3 className="text-sm font-medium text-foreground">{editing ? "Editar" : "Nova"} Categoria</h3>
          <Input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })} className="bg-secondary border-border text-sm h-9" />
          <Input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="bg-secondary border-border text-sm h-9" />
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Imagem (vertical)</label>
            <input type="file" accept="image/*" onChange={handleUpload} className="text-xs text-muted-foreground" />
            {uploading && <span className="text-xs text-primary ml-2">Enviando...</span>}
            {form.image_url && <img src={form.image_url} alt="" className="mt-2 h-24 rounded object-cover" />}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} className="bg-primary text-primary-foreground text-xs h-8">Salvar</Button>
            <Button size="sm" variant="outline" onClick={() => { setCreating(false); setEditing(null); }} className="text-xs h-8">Cancelar</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-card border border-border rounded-lg overflow-hidden">
            <img src={cat.image_url} alt={cat.name} className="w-full h-28 object-cover" />
            <div className="p-2">
              <p className="text-xs font-medium text-foreground">{cat.name}</p>
              <p className="text-[10px] text-muted-foreground">/{cat.slug}</p>
              <div className="flex items-center gap-1 mt-2">
                <button onClick={() => toggleActive(cat)} className={`p-1 rounded ${cat.active ? "text-green-400" : "text-muted-foreground"}`}>
                  {cat.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => openEdit(cat)} className="p-1 text-muted-foreground hover:text-foreground">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(cat.id)} className="p-1 text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {categories.length === 0 && <p className="col-span-full text-sm text-muted-foreground text-center py-8">Nenhuma categoria cadastrada</p>}
      </div>
    </div>
  );
};

export default AdminCategories;
