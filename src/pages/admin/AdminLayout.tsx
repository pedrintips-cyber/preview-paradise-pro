import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Image, FolderOpen, Video, Settings, LogOut, Crown, Menu, X, Users } from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Banners", icon: Image, path: "/admin/banners" },
  { label: "Categorias", icon: FolderOpen, path: "/admin/categorias" },
  { label: "Vídeos", icon: Video, path: "/admin/videos" },
  { label: "Planos VIP", icon: Crown, path: "/admin/vip" },
  { label: "Afiliados", icon: Users, path: "/admin/afiliados" },
  { label: "Configurações", icon: Settings, path: "/admin/config" },
];

const AdminLayout = () => {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/admin/login");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");

      if (!roles || roles.length === 0) {
        navigate("/admin/login");
        return;
      }

      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate("/admin/login");
    });

    checkAdmin();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-56 bg-card border-r border-border flex flex-col transition-transform duration-200 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-4 h-12 border-b border-border">
          <Link to="/" className="flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-primary" />
            <span className="font-display text-sm text-primary tracking-wider">STREAMVIP</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 py-2 px-2 space-y-0.5">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs transition-colors ${
                  active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-2.5 px-5 py-3 text-xs text-muted-foreground hover:text-destructive transition-colors border-t border-border">
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-background/50 z-40 md:hidden" />}

      {/* Main */}
      <div className="flex-1 md:ml-56">
        <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-sm border-b border-border h-12 flex items-center px-4">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1.5 text-muted-foreground hover:text-foreground mr-3">
            <Menu className="w-4 h-4" />
          </button>
          <span className="text-xs text-muted-foreground">Painel Administrativo</span>
        </header>
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
