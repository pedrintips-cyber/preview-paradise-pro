import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Crown, ArrowLeft, Copy, Check, Clock, QrCode, ShieldCheck, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  banner_url: string | null;
}

interface PixData {
  purchase_id: string;
  qr_code: string;
  qr_code_base64: string;
  expires_at: string;
  amount: number;
}

const periodLabel = (p: string) => {
  if (p === "mensal") return "/mês";
  if (p === "trimestral") return "/trimestre";
  return "/ano";
};

const CheckoutPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [groupLink, setGroupLink] = useState("");
  const [groupLinkLabel, setGroupLinkLabel] = useState("Entrar no Grupo VIP");

  const [email, setEmail] = useState("");

  const [pixData, setPixData] = useState<PixData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("pending");

  useEffect(() => {
    const loadPlan = async () => {
      if (!planId) return;
      const { data } = await supabase
        .from("vip_plans")
        .select("id, name, price, period, banner_url")
        .eq("id", planId)
        .eq("active", true)
        .single();
      if (data) setPlan(data);
      else navigate("/vip");
      setLoading(false);
    };
    loadPlan();
  }, [planId, navigate]);

  useEffect(() => {
    if (!pixData?.purchase_id) return;

    const channel = supabase
      .channel(`purchase-${pixData.purchase_id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "purchases",
          filter: `id=eq.${pixData.purchase_id}`,
        },
        (payload) => {
          const newStatus = (payload.new as { status: string }).status;
          setPaymentStatus(newStatus);
          if (newStatus === "approved") {
            toast({ title: "Pagamento confirmado! 🎉", description: "Seu acesso VIP foi ativado." });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pixData?.purchase_id, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan) return;

    if (!email.trim() || !email.includes("@")) {
      toast({ title: "Informe um e-mail válido", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      const affiliateId = localStorage.getItem("affiliate_id") || null;
      const res = await supabase.functions.invoke("create-pix", {
        body: {
          plan_id: plan.id,
          affiliate_id: affiliateId,
          customer: {
            name: email.split("@")[0],
            email: email.trim(),
            document: "00000000000",
            phone: "00000000000",
          },
        },
      });

      if (res.error) throw new Error(res.error.message);
      const data = res.data;
      if (data.error) throw new Error(data.error);

      setPixData(data);

      await supabase.from("analytics").insert({ event_type: "vip_click", metadata: { plan_id: plan.id } });
    } catch (err: unknown) {
      console.error("Checkout error:", err);
      toast({
        title: "Erro ao gerar PIX",
        description: err instanceof Error ? err.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const copyPixCode = async () => {
    if (!pixData) return;
    await navigator.clipboard.writeText(pixData.qr_code);
    setCopied(true);
    toast({ title: "Código PIX copiado!" });
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14 pb-8 px-4">
        <div className="max-w-md mx-auto">
          <Link to="/vip" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar aos planos
          </Link>

          {plan && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-primary/20 bg-card overflow-hidden mb-5">
              {plan.banner_url && <img src={plan.banner_url} alt={plan.name} className="w-full h-28 object-cover" />}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  <span className="font-display text-foreground">{plan.name}</span>
                </div>
                <span className="text-lg font-bold text-foreground">
                  R${Number(plan.price).toFixed(2).replace(".", ",")}<span className="text-xs text-muted-foreground font-normal">{periodLabel(plan.period)}</span>
                </span>
              </div>
            </motion.div>
          )}

          {!pixData ? (
            <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} onSubmit={handleSubmit} className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <h2 className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary" /> Quase lá!
                </h2>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Seu e-mail</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="bg-secondary border-border text-sm h-10"
                    required
                    autoFocus
                  />
                  <p className="text-[9px] text-muted-foreground mt-1">Enviaremos o acesso para este e-mail</p>
                </div>
              </div>

              <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow text-sm h-11 font-bold">
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" /> Gerando PIX...
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4 mr-2" /> PAGAR COM PIX
                  </>
                )}
              </Button>

              <p className="text-[9px] text-muted-foreground text-center">🔒 Pagamento 100% seguro via PIX • Acesso imediato</p>
            </motion.form>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
              {paymentStatus === "approved" ? (
                <div className="rounded-xl border border-primary/30 bg-primary/10 p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-lg font-display text-foreground mb-1">Pagamento Confirmado!</h2>
                  <p className="text-xs text-muted-foreground mb-4">Seu acesso VIP foi ativado com sucesso.</p>
                  <Link to="/">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm">Acessar Conteúdo VIP</Button>
                  </Link>
                </div>
              ) : (
                <div className="rounded-xl border border-primary/20 bg-card p-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-2">
                    <Clock className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-xs text-primary font-medium">Aguardando pagamento...</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-3">Escaneie o QR Code abaixo ou copie o código PIX</p>

                  {pixData.qr_code_base64 && (
                    <div className="bg-background rounded-lg p-2 inline-block mb-2">
                      <img src={pixData.qr_code_base64} alt="QR Code PIX" className="w-44 h-44 mx-auto" />
                    </div>
                  )}

                  <div className="bg-background rounded-lg p-2 mb-2">
                    <p className="text-[9px] text-muted-foreground break-all font-mono leading-relaxed max-h-16 overflow-y-auto">{pixData.qr_code}</p>
                  </div>

                  <Button onClick={copyPixCode} variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/10 text-xs h-8">
                    {copied ? <><Check className="w-3.5 h-3.5 mr-1.5" /> Copiado!</> : <><Copy className="w-3.5 h-3.5 mr-1.5" /> Copiar código PIX</>}
                  </Button>

                  {pixData.expires_at && (
                    <p className="text-[9px] text-muted-foreground mt-2">
                      Expira em: {new Date(pixData.expires_at).toLocaleString("pt-BR")}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
