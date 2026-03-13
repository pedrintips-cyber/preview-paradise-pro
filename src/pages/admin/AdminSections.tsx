import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SectionRow {
  id: string;
  name: string;
  sort_order: number | null;
  active: boolean | null;
}

const AdminSections = () => {
  const [sections, setSections] = useState<SectionRow[]>([]);
  const [editing, setEditing] = useState<SectionRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", sort_order: 0 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    const { data } = await supabase
      .from("sections")
      .select("*")
      .order("sort_order");
    setSections(data || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Preencha o nome da divisória", variant: "destructive" });
      return;
    }

    const payload = {
      name: form.name.trim(),
      sort_order: form.sort_order,
    };

    if (editing) {
      await supabase.from("sections").update(payload).eq("id", editing.id);
      toast({ title: "Divisória atualizada!" });
    } else {
      await supabase.from("sections").insert(payload);
      toast({ title: "Divisória criada!" });
    }

    setEditing(null);
    setCreating(false);
    setForm({ name: "", sort_order: 0 });
    loadData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("sections").delete().eq("id", id);
    toast({ title: "Divisória removida" });
    loadData();
  };

  const toggleActive = async (section: SectionRow) => {
    await supabase.from("sections").update({ active: !section.active }).eq("id", section.id);
    loadData();
  };

  const openEdit = (section: SectionRow) => {
    setEditing(section);
    setCreating(true);
    setForm({ name: section.name, sort_order: section.sort_order || 0 });
  };

  const resetForm = () => {
    setCreating(true);
    setEditing(null);
    setForm({ name: "", sort_order: 0 });
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-display text-foreground">Divisórias</h1>
        <Button size="sm" onClick={resetForm} className="bg-primary text-primary-foreground text-xs h-8">
          <Plus className="w-3.5 h-3.5 mr-1" />
          Nova Divisória
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Crie divisórias para organizar os vídeos na home. Use emojis no nome! Ex: 🔥 Em Alta, ⭐ Destaques
      </p>

      {creating && (
        <div className="bg-card border border-border rounded-lg p-4 mb-4 space-y-3">
          <h3 className="text-sm font-medium text-foreground">{editing ? "Editar" : "Nova"} Divisória</h3>
          <Input
            placeholder="Nome da divisória (ex: 🔥 Em Alta)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-secondary border-border text-sm h-9"
          />
          <Input
            type="number"
            placeholder="Ordem (0, 1, 2...)"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
            className="bg-secondary border-border text-sm h-9 w-32"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} className="bg-primary text-primary-foreground text-xs h-8">Salvar</Button>
            <Button size="sm" variant="outline" onClick={() => { setCreating(false); setEditing(null); }} className="text-xs h-8">Cancelar</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {sections.map((section) => (
          <div key={section.id} className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
            <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{section.name}</p>
              <p className="text-[10px] text-muted-foreground">Ordem: {section.sort_order}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button onClick={() => toggleActive(section)} className={`p-1.5 rounded ${section.active ? "text-green-400" : "text-muted-foreground"}`}>
                {section.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => openEdit(section)} className="p-1.5 text-muted-foreground hover:text-foreground">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(section.id)} className="p-1.5 text-muted-foreground hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        {sections.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nenhuma divisória criada</p>}
      </div>
    </div>
  );
};

export default AdminSections;
