import { useState, useEffect } from "react";
import { Crown, Copy, Check, Clock, QrCode, ShieldCheck, ExternalLink, X, Lock, Users, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { DBVipPlan } from "@/types/database";

interface PixData {
  purchase_id: string;
  qr_code: string;
  qr_code_base64: string;
  expires_at: string;
  amount: number;
}

interface CheckoutModalProps {
  plan: DBVipPlan;
  open: boolean;
  onClose: () => void;
}

const periodLabel = (p: string) => {
  if (p === "mensal") return "/mês";
  if (p === "trimestral") return "/tri";
  return "/ano";
};

const CheckoutModal = ({ plan, open, onClose }: CheckoutModalProps) => {
  const { toast } = useToast();

  const [cpf, setCpf] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("pending");
  const [groupLink, setGroupLink] = useState("");
  const [groupLinkLabel, setGroupLinkLabel] = useState("Entrar no Grupo VIP");

  useEffect(() => {
    if (!open) return;
    const loadSettings = async () => {
      const { data } = await supabase
        .from("settings")
        .select("key, value")
        .in("key", ["group_link", "group_link_label"]);
      data?.forEach((s) => {
        if (s.key === "group_link") setGroupLink(s.value);
        if (s.key === "group_link_label") setGroupLinkLabel(s.value || "Entrar no Grupo VIP");
      });
    };
    loadSettings();
  }, [open]);

  useEffect(() => {
    if (!pixData?.purchase_id) return;
    const channel = supabase
      .channel(`purchase-${pixData.purchase_id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "purchases", filter: `id=eq.${pixData.purchase_id}` },
        (payload) => {
          const newStatus = (payload.new as { status: string }).status;
          setPaymentStatus(newStatus);
          if (newStatus === "approved") {
            toast({ title: "Pagamento confirmado! 🎉", description: "Seu acesso VIP foi ativado." });
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [pixData?.purchase_id, toast]);

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length !== 11) {
      toast({ title: "Informe um CPF válido (11 dígitos)", variant: "destructive" });
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
            name: "Cliente",
            email: `${cleanCpf}@checkout.local`,
            document: cleanCpf,
            phone: "00000000000",
          },
        },
      });
      if (res.error) throw new Error(res.error.message);
      if (res.data.error) throw new Error(res.data.error);
      setPixData(res.data);
      await supabase.from("analytics").insert({ event_type: "vip_click", metadata: { plan_id: plan.id } });
    } catch (err: unknown) {
      console.error("Checkout error:", err);
      toast({ title: "Erro ao gerar PIX", description: err instanceof Error ? err.message : "Tente novamente", variant: "destructive" });
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

  const handleClose = () => {
    if (!submitting) {
      setCpf("");
      setPixData(null);
      setPaymentStatus("pending");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-foreground/85 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[380px] bg-card border border-border rounded-2xl overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-foreground/50 flex items-center justify-center text-background hover:text-background/80 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Banner area */}
            {plan.banner_url ? (
              <div className="relative w-full">
                <img 
                  src={plan.banner_url} 
                  alt={plan.name} 
                  className="w-full object-cover max-h-[160px]" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
              </div>
            ) : (
              <div className="relative w-full h-[100px] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Crown className="w-10 h-10 text-primary/30" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              </div>
            )}

            {/* Plan info overlay */}
            <div className="px-5 -mt-6 relative z-10">
              <div className="flex items-end gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-card border border-border flex items-center justify-center shadow-lg">
                  <Crown className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground leading-tight">{plan.name}</h3>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-[10px] text-muted-foreground">R$</span>
                    <span className="text-2xl font-display font-bold text-foreground">
                      {Number(plan.price).toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{periodLabel(plan.period)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="px-5 mb-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg bg-secondary/50 border border-border">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span className="text-[8px] text-muted-foreground text-center leading-tight">Pagamento<br/>Seguro</span>
                </div>
                <div className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg bg-secondary/50 border border-border">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-[8px] text-muted-foreground text-center leading-tight">Acesso<br/>Imediato</span>
                </div>
                <div className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg bg-secondary/50 border border-border">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-[8px] text-muted-foreground text-center leading-tight">+10.000<br/>Membros</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Content */}
            <div className="p-5">
              {!pixData ? (
                paymentStatus !== "approved" && (
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    {/* CPF Field */}
                    <div>
                      <label className="text-[11px] text-muted-foreground font-medium mb-1.5 block">
                        CPF do titular
                      </label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={formatCpf(cpf)}
                        onChange={(e) => setCpf(e.target.value.replace(/\D/g, "").slice(0, 11))}
                        placeholder="000.000.000-00"
                        className="bg-secondary border-border text-sm h-10 rounded-lg font-mono tracking-wider"
                        required
                        autoFocus
                      />
                    </div>

                    {/* Payment method indicator */}
                    <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-secondary/50 border border-border">
                      <QrCode className="w-4 h-4 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-[11px] text-foreground font-medium">Pagamento via PIX</p>
                        <p className="text-[9px] text-muted-foreground">Aprovação instantânea</p>
                      </div>
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm h-11 font-bold rounded-xl"
                    >
                      {submitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                          Gerando PIX...
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 mr-1.5" />
                          PAGAR AGORA
                        </>
                      )}
                    </Button>

                    {/* Guarantee seal */}
                    <div className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-primary/20 bg-primary/5">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full border-2 border-primary/40 flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] text-foreground font-semibold">Garantia de 7 dias</p>
                        <p className="text-[8px] text-muted-foreground">Não gostou? Devolvemos 100% do valor.</p>
                      </div>
                    </div>

                    <p className="text-[7px] text-muted-foreground text-center">
                      Seus dados estão protegidos • Criptografia SSL 256-bit
                    </p>
                  </form>
                )
              ) : paymentStatus === "approved" ? (
                <div className="text-center py-2">
                  <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-3">
                    <Check className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-1">Pagamento Confirmado!</h3>
                  <p className="text-[11px] text-muted-foreground mb-4">Seu acesso VIP foi ativado.</p>
                  {groupLink ? (
                    <a href={groupLink} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm h-10 font-bold rounded-xl">
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                        {groupLinkLabel}
                      </Button>
                    </a>
                  ) : (
                    <Button onClick={handleClose} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm h-10 rounded-xl">
                      Acessar Conteúdo
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-2">
                    <Clock className="w-3.5 h-3.5 text-primary animate-pulse" />
                    <span className="text-[11px] text-primary font-medium">Aguardando pagamento</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground mb-3">Escaneie o QR Code ou copie o código</p>

                  {pixData.qr_code_base64 && (
                    <div className="bg-background rounded-xl p-2 inline-block mb-3">
                      <img src={pixData.qr_code_base64} alt="QR Code PIX" className="w-40 h-40 mx-auto" />
                    </div>
                  )}

                  <div className="bg-background rounded-lg p-2.5 mb-3">
                    <p className="text-[8px] text-muted-foreground break-all font-mono leading-relaxed max-h-12 overflow-y-auto">
                      {pixData.qr_code}
                    </p>
                  </div>

                  <Button
                    onClick={copyPixCode}
                    variant="outline"
                    className="w-full border-border text-foreground hover:bg-secondary text-xs h-9 rounded-xl"
                  >
                    {copied ? (
                      <><Check className="w-3 h-3 mr-1.5 text-primary" /> Copiado!</>
                    ) : (
                      <><Copy className="w-3 h-3 mr-1.5" /> Copiar código PIX</>
                    )}
                  </Button>

                  {pixData.expires_at && (
                    <p className="text-[8px] text-muted-foreground mt-2">
                      Expira: {new Date(pixData.expires_at).toLocaleString("pt-BR")}
                    </p>
                  )}

                  <div className="flex items-center justify-center gap-1 mt-3">
                    <ShieldCheck className="w-2.5 h-2.5 text-muted-foreground" />
                    <span className="text-[7px] text-muted-foreground">Transação segura e criptografada</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CheckoutModal;
