import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, Link2, ShoppingCart, History,
  Wallet, ArrowDownToLine, Settings, MessageCircle,
  LogOut, Menu, X, CreditCard
} from "lucide-react";

interface Affiliate {
  id: string;
  name: string;
  email: string;
  slug: string;
  balance: number;
  commission_rate: number;
  pix_key: string | null;
  pix_key_type: string | null;
  gateway_token: string | null;
  gateway_type: string | null;
  total_earned: number;
  status: string;
}

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/afiliado" },
  { label: "Meu Link", icon: Link2, path: "/afiliado/link" },
  { label: "Vendas", icon: ShoppingCart, path: "/afiliado/vendas" },
  { label: "Histórico", icon: History, path: "/afiliado/historico" },
  { label: "Saques", icon: ArrowDownToLine, path: "/afiliado/saques" },
  { label: "Carteira", icon: Wallet, path: "/afiliado/carteira" },
  { label: "Gateway", icon: CreditCard, path: "/afiliado/gateway" },
  { label: "Configurações", icon: Settings, path: "/afiliado/config" },
];

const AffiliateLayout = () => {
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/afiliado/login"); return; }

      const { data } = await supabase
        .from("affiliates")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!data) { navigate("/afiliado/login"); return; }
      setAffiliate(data as Affiliate);
      setLoading(false);
    };
    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate("/afiliado/login");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/afiliado/login");
  };

  const whatsappUrl = "https://wa.me/5500000000000?text=Olá! Sou afiliado e preciso de suporte.";

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-card border-r border-border min-h-screen fixed left-0 top-0">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-display text-primary tracking-wider">PAINEL AFILIADO</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{affiliate?.name}</p>
        </div>
        <nav className="flex-1 py-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors ${
                location.pathname === item.path
                  ? "text-primary bg-primary/10 border-r-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          >
            <MessageCircle className="w-4 h-4" />
            Suporte
          </a>
        </nav>
        <div className="p-3 border-t border-border">
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive w-full px-1 py-1.5">
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border flex items-center justify-between px-4 h-12">
        <h2 className="text-sm font-display text-primary">PAINEL AFILIADO</h2>
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-foreground">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-sm pt-12">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                  location.pathname === item.path
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="w-4 h-4" />
              Suporte
            </a>
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted-foreground hover:text-destructive w-full">
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-56 pt-12 md:pt-0 p-4 md:p-6">
        <Outlet context={{ affiliate, setAffiliate }} />
      </main>
    </div>
  );
};

export default AffiliateLayout;
export type { Affiliate };
