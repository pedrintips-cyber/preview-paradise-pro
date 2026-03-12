import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Crown, ArrowLeft, Copy, Check, Clock, QrCode, ShieldCheck } from "lucide-react";
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

  // Form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [document, setDocument] = useState("");
  const [phone, setPhone] = useState("");

  // PIX result
  const [pixData, setPixData] = useState<{
    purchase_id: string;
    qr_code: string;
    qr_code_base64: string;
    expires_at: string;
  } | null>(null);

  // Payment status
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

  // Realtime subscription for payment status
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

    const cleanDoc = document.replace(/\D/g, "");
    const cleanPhone = phone.replace(/\D/g, "");

    if (!name.trim() || !email.trim() || cleanDoc.length < 11 || cleanPhone.length < 10) {
      toast({ title: "Preencha todos os campos corretamente", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      const res = await supabase.functions.invoke("create-pix", {
        body: {
          plan_id: plan.id,
          customer: { name: name.trim(), email: email.trim(), document: cleanDoc, phone: cleanPhone },
        },
      });

      if (res.error) throw new Error(res.error.message);
      const data = res.data;
      if (data.error) throw new Error(data.error);

      setPixData(data);

      // Track VIP click
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
    if (!pixData?.qr_code) return;
    await navigator.clipboard.writeText(pixData.qr_code);
    setCopied(true);
    toast({ title: "Código PIX copiado!" });
    setTimeout(() => setCopied(false), 3000);
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

          {/* Plan summary */}
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

          {/* Show form or PIX */}
          {!pixData ? (
            <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} onSubmit={handleSubmit} className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <h2 className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary" /> Seus dados
                </h2>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Nome completo</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="João da Silva" className="bg-secondary border-border text-sm h-9" required />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">E-mail</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="joao@email.com" className="bg-secondary border-border text-sm h-9" required />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">CPF</label>
                  <Input value={document} onChange={(e) => setDocument(e.target.value)} placeholder="000.000.000-00" className="bg-secondary border-border text-sm h-9" required />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Telefone com DDD</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" className="bg-secondary border-border text-sm h-9" required />
                </div>
              </div>

              <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow text-sm h-10 font-semibold">
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" /> Gerando PIX...</>
                ) : (
                  <><QrCode className="w-4 h-4 mr-2" /> Gerar PIX</>
                )}
              </Button>

              <p className="text-[9px] text-muted-foreground text-center">
                Pagamento 100% seguro via PIX • Acesso imediato após confirmação
              </p>
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
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm">
                      Acessar Conteúdo VIP
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="rounded-xl border border-primary/20 bg-card p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-3">
                      <Clock className="w-4 h-4 text-primary animate-pulse" />
                      <span className="text-xs text-primary font-medium">Aguardando pagamento...</span>
                    </div>

                    {pixData.qr_code_base64 && (
                      <div className="bg-white rounded-lg p-3 inline-block mb-3">
                        <img src={pixData.qr_code_base64} alt="QR Code PIX" className="w-48 h-48 mx-auto" />
                      </div>
                    )}

                    <p className="text-[10px] text-muted-foreground mb-3">
                      Escaneie o QR Code acima ou copie o código PIX abaixo
                    </p>

                    <div className="bg-secondary rounded-lg p-2.5 mb-3">
                      <p className="text-[9px] text-muted-foreground break-all font-mono leading-relaxed max-h-16 overflow-y-auto">
                        {pixData.qr_code}
                      </p>
                    </div>

                    <Button onClick={copyPixCode} variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/10 text-sm h-9">
                      {copied ? <><Check className="w-4 h-4 mr-1.5" /> Copiado!</> : <><Copy className="w-4 h-4 mr-1.5" /> Copiar código PIX</>}
                    </Button>
                  </div>

                  {pixData.expires_at && (
                    <p className="text-[9px] text-muted-foreground text-center">
                      Este PIX expira em: {new Date(pixData.expires_at).toLocaleString("pt-BR")}
                    </p>
                  )}
                </>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
