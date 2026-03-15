import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard, Link2, ShoppingCart, History,
  Wallet, Settings, MessageCircle,
  LogOut, Menu, X, CreditCard, Lock,
  Crown, Copy, Check, Clock, QrCode, ShieldCheck
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
  is_paid: boolean;
  paid_at: string | null;
}

// Activation paywall component
const ActivationPaywall = ({ affiliate, setAffiliate }: { affiliate: Affiliate; setAffiliate: (a: Affiliate) => void }) => {
  const [generating, setGenerating] = useState(false);
  const [pixData, setPixData] = useState<{ purchase_id: string; qr_code: string; qr_code_base64: string; expires_at: string } | null>(null);
  const [status, setStatus] = useState("pending");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!pixData?.purchase_id) return;
    const channel = supabase
      .channel(`activation-${pixData.purchase_id}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "purchases",
        filter: `id=eq.${pixData.purchase_id}`,
      }, (payload) => {
        const newStatus = (payload.new as { status: string }).status;
        setStatus(newStatus);
        if (newStatus === "approved") {
          toast({ title: "Conta ativada! 🎉", description: "Seu painel de afiliado foi liberado." });
          setAffiliate({ ...affiliate, is_paid: true, paid_at: new Date().toISOString() });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [pixData?.purchase_id, toast, affiliate, setAffiliate]);

  const handleActivate = async () => {
    setGenerating(true);
    try {
      const res = await supabase.functions.invoke("create-pix", {
        body: {
          type: "affiliate_activation",
          affiliate_id: affiliate.id,
          customer: {
            name: affiliate.name,
            email: affiliate.email,
            document: "00000000000",
            phone: "00000000000",
          },
        },
      });
      if (res.error) throw new Error(res.error.message);
      const data = res.data;
      if (data.error) throw new Error(data.error);
      setPixData(data);
    } catch (err: unknown) {
      toast({
        title: "Erro ao gerar pagamento",
        description: err instanceof Error ? err.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyPix = async () => {
    if (!pixData) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(pixData.qr_code);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = pixData.qr_code;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      toast({ title: "Código PIX copiado!" });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast({ title: "Erro ao copiar", description: "Copie manualmente o código acima.", variant: "destructive" });
    }
  };

  if (status === "approved") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-8 text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-display text-foreground mb-1">Conta Ativada!</h2>
          <p className="text-xs text-muted-foreground mb-4">Seu painel de afiliado foi liberado. Recarregue a página para acessar.</p>
          <Button onClick={() => window.location.reload()} className="bg-primary text-primary-foreground text-sm">
            Recarregar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-sm w-full space-y-4">
        <div className="rounded-xl border border-primary/20 bg-card p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Crown className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-lg font-display text-foreground mb-1">Ative sua conta de afiliado</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Para liberar seu painel, link de indicação e começar a vender, é necessário pagar a taxa de ativação.
          </p>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
            <p className="text-2xl font-bold text-primary">R$250,00</p>
            <p className="text-[10px] text-muted-foreground">Pagamento único • Acesso vitalício</p>
          </div>

          {!pixData ? (
            <Button onClick={handleActivate} disabled={generating} className="w-full bg-primary text-primary-foreground text-sm h-10">
              {generating ? (
                <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" /> Gerando PIX...</>
              ) : (
                <><QrCode className="w-4 h-4 mr-2" /> Pagar e Ativar</>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Clock className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-xs text-primary font-medium">Aguardando pagamento...</span>
              </div>

              {pixData.qr_code_base64 && (
                <div className="bg-background rounded-lg p-2 inline-block">
                  <img src={pixData.qr_code_base64} alt="QR Code" className="w-40 h-40 mx-auto" />
                </div>
              )}

              <div className="bg-background rounded-lg p-2">
                <p className="text-[9px] text-muted-foreground break-all font-mono leading-relaxed max-h-16 overflow-y-auto">{pixData.qr_code}</p>
              </div>

              <Button onClick={copyPix} variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/10 text-xs h-8">
                {copied ? <><Check className="w-3.5 h-3.5 mr-1.5" /> Copiado!</> : <><Copy className="w-3.5 h-3.5 mr-1.5" /> Copiar código PIX</>}
              </Button>
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-display text-foreground mb-2">O QUE VOCÊ RECEBE</h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>✅ Link de indicação personalizado</p>
            <p>✅ Dashboard completo com métricas</p>
            <p>✅ 100% do valor das vendas vai pra você</p>
            <p>✅ Recebimento direto no seu gateway</p>
            <p>✅ Relatório de cliques e vendas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AffiliateLayout = () => {
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isPaid = affiliate?.is_paid === true;

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/afiliado", locked: !isPaid },
    { label: "Meu Link", icon: Link2, path: "/afiliado/link", locked: !isPaid },
    { label: "Vendas", icon: ShoppingCart, path: "/afiliado/vendas", locked: !isPaid },
    { label: "Histórico", icon: History, path: "/afiliado/historico", locked: !isPaid },
    { label: "Carteira", icon: Wallet, path: "/afiliado/carteira", locked: !isPaid },
    { label: "Gateway", icon: CreditCard, path: "/afiliado/gateway", locked: !isPaid },
    { label: "Configurações", icon: Settings, path: "/afiliado/config", locked: false },
  ];

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
      setAffiliate(data as unknown as Affiliate);
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
          {!isPaid && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 mt-1 inline-block">
              Conta não ativada
            </span>
          )}
        </div>
        <nav className="flex-1 py-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.locked ? "#" : item.path}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors ${
                item.locked
                  ? "text-muted-foreground/50 cursor-not-allowed"
                  : location.pathname === item.path
                  ? "text-primary bg-primary/10 border-r-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
              onClick={(e) => { if (item.locked) e.preventDefault(); }}
            >
              {item.locked ? <Lock className="w-4 h-4" /> : <item.icon className="w-4 h-4" />}
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
                to={item.locked ? "#" : item.path}
                onClick={(e) => {
                  if (item.locked) e.preventDefault();
                  else setMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                  item.locked
                    ? "text-muted-foreground/50"
                    : location.pathname === item.path
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.locked ? <Lock className="w-4 h-4" /> : <item.icon className="w-4 h-4" />}
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
        {!isPaid && location.pathname !== "/afiliado/config" ? (
          <ActivationPaywall affiliate={affiliate!} setAffiliate={setAffiliate} />
        ) : (
          <Outlet context={{ affiliate, setAffiliate }} />
        )}
      </main>
    </div>
  );
};

export default AffiliateLayout;
export type { Affiliate };
