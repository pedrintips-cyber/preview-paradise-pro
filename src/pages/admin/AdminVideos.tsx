import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Eye, EyeOff, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoRow {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  duration: string | null;
  views: number | null;
  category_id: string | null;
  is_vip: boolean | null;
  active: boolean | null;
}

interface CategoryRow {
  id: string;
  name: string;
}

interface SectionRow {
  id: string;
  name: string;
}

const AdminVideos = () => {
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [sections, setSections] = useState<SectionRow[]>([]);
  const [editing, setEditing] = useState<VideoRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", thumbnail_url: "", video_url: "", duration: "", category_id: "", section_id: "", is_vip: false
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const { toast } = useToast();

  const loadData = async () => {
    const [videosRes, catsRes, sectionsRes] = await Promise.all([
      supabase.from("videos").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name").order("name"),
      supabase.from("sections").select("id, name").order("sort_order"),
    ]);
    setVideos(videosRes.data || []);
    setCategories(catsRes.data || []);
    setSections(sectionsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const extractThumbnailFromVideo = (videoUrl: string): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.src = videoUrl;
      video.muted = true;
      video.preload = "auto";

      video.addEventListener("loadeddata", () => {
        // Seek to 1 second or 10% of duration
        video.currentTime = Math.min(1, video.duration * 0.1);
      });

      video.addEventListener("seeked", () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.85);
      });

      video.addEventListener("error", () => resolve(null));
      // Timeout safety
      setTimeout(() => resolve(null), 15000);
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "thumbnail_url" | "video_url") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(field);
    const ext = file.name.split(".").pop();
    const folder = field === "thumbnail_url" ? "thumbnails" : "videos";
    const path = `${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) {
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
      setUploading(null);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
    setForm((f) => ({ ...f, [field]: publicUrl }));
    setUploading(null);

    // Auto-generate thumbnail when video is uploaded
    if (field === "video_url" && !form.thumbnail_url) {
      setUploading("thumbnail_url");
      toast({ title: "Gerando thumbnail automática..." });
      const blob = await extractThumbnailFromVideo(publicUrl);
      if (blob) {
        const thumbPath = `thumbnails/${Date.now()}.jpg`;
        const { error: thumbErr } = await supabase.storage.from("media").upload(thumbPath, blob, { contentType: "image/jpeg" });
        if (!thumbErr) {
          const { data: { publicUrl: thumbUrl } } = supabase.storage.from("media").getPublicUrl(thumbPath);
          setForm((f) => ({ ...f, thumbnail_url: thumbUrl }));
          toast({ title: "Thumbnail gerada automaticamente! ✓" });
        }
      } else {
        toast({ title: "Não foi possível gerar thumbnail", description: "Adicione manualmente", variant: "destructive" });
      }
      setUploading(null);
    }
  };

  const handleSave = async () => {
    if (!form.title) {
      toast({ title: "Preencha o título", variant: "destructive" });
      return;
    }

    const payload = {
      title: form.title,
      description: form.description || null,
      thumbnail_url: form.thumbnail_url || null,
      video_url: form.video_url || null,
      duration: form.duration || null,
      category_id: form.category_id || null,
      is_vip: form.is_vip,
    };

    if (editing) {
      await supabase.from("videos").update(payload).eq("id", editing.id);
      toast({ title: "Vídeo atualizado!" });
    } else {
      await supabase.from("videos").insert(payload);
      toast({ title: "Vídeo criado!" });
    }

    setEditing(null);
    setCreating(false);
    setForm({ title: "", description: "", thumbnail_url: "", video_url: "", duration: "", category_id: "", is_vip: false });
    loadData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("videos").delete().eq("id", id);
    toast({ title: "Vídeo removido" });
    loadData();
  };

  const toggleActive = async (video: VideoRow) => {
    await supabase.from("videos").update({ active: !video.active }).eq("id", video.id);
    loadData();
  };

  const openEdit = (video: VideoRow) => {
    setEditing(video);
    setCreating(true);
    setForm({
      title: video.title,
      description: video.description || "",
      thumbnail_url: video.thumbnail_url || "",
      video_url: video.video_url || "",
      duration: video.duration || "",
      category_id: video.category_id || "",
      is_vip: video.is_vip || false,
    });
  };

  const resetForm = () => {
    setCreating(true);
    setEditing(null);
    setForm({ title: "", description: "", thumbnail_url: "", video_url: "", duration: "", category_id: "", is_vip: false });
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-display text-foreground">Vídeos</h1>
        <Button size="sm" onClick={resetForm} className="bg-primary text-primary-foreground text-xs h-8">
          <Plus className="w-3.5 h-3.5 mr-1" />
          Novo Vídeo
        </Button>
      </div>

      {creating && (
        <div className="bg-card border border-border rounded-lg p-4 mb-4 space-y-3">
          <h3 className="text-sm font-medium text-foreground">{editing ? "Editar" : "Novo"} Vídeo</h3>
          <Input placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-secondary border-border text-sm h-9" />
          <textarea
            placeholder="Descrição"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-secondary border border-border rounded-md text-sm p-2 text-foreground placeholder:text-muted-foreground resize-none h-20"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input placeholder="Duração (ex: 12:34)" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="bg-secondary border-border text-sm h-9" />
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="bg-secondary border border-border rounded-md text-sm h-9 px-2 text-foreground"
            >
              <option value="">Sem categoria</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Thumbnail</label>
            <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "thumbnail_url")} className="text-xs text-muted-foreground" />
            {uploading === "thumbnail_url" && <span className="text-xs text-primary ml-2">Enviando...</span>}
            {form.thumbnail_url && <img src={form.thumbnail_url} alt="" className="mt-2 h-16 rounded object-cover" />}
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Arquivo de vídeo</label>
            <input type="file" accept="video/*" onChange={(e) => handleUpload(e, "video_url")} className="text-xs text-muted-foreground" />
            {uploading === "video_url" && <span className="text-xs text-primary ml-2">Enviando...</span>}
            {form.video_url && <p className="text-[10px] text-green-400 mt-1">✓ Vídeo carregado</p>}
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
        {videos.map((video) => (
          <div key={video.id} className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
            <img src={video.thumbnail_url || "/placeholder.svg"} alt={video.title} className="w-20 h-12 rounded object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-medium text-foreground truncate">{video.title}</p>
                {video.is_vip && <Crown className="w-3 h-3 text-primary flex-shrink-0" />}
              </div>
              <p className="text-[10px] text-muted-foreground">{video.duration || "—"} • {video.views || 0} views</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button onClick={() => toggleActive(video)} className={`p-1.5 rounded ${video.active ? "text-green-400" : "text-muted-foreground"}`}>
                {video.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => openEdit(video)} className="p-1.5 text-muted-foreground hover:text-foreground">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(video.id)} className="p-1.5 text-muted-foreground hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        {videos.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nenhum vídeo cadastrado</p>}
      </div>
    </div>
  );
};

export default AdminVideos;
