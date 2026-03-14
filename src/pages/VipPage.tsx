import { useState, useEffect } from "react";
import { Crown, Check, Star, Lock, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import type { DBVipPlan } from "@/types/database";

const benefits = [
  "Acesso a todos os vídeos exclusivos",
  "Qualidade HD • Sem anúncios",
  "Novos conteúdos toda semana",
  "Comunidade VIP exclusiva",
];

const periodLabel = (p: string) => {
  if (p === "mensal") return "/mês";
  if (p === "trimestral") return "/tri";
  return "/ano";
};

const VipPage = () => {
  const [plan, setPlan] = useState<DBVipPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("vip_plans")
        .select("*")
        .eq("active", true)
        .order("sort_order")
        .limit(1);
      setPlan(data && data.length > 0 ? (data[0] as DBVipPlan) : null);
      setLoading(false);
    };
    load();
  }, []);

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
      <main className="pt-12 md:pt-14">
        {plan ? (
          <div className="px-4 md:px-8 pt-6 pb-8">
            <div className="max-w-sm mx-auto">
              {/* Banner do plano */}
              {plan.banner_url && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-t-xl overflow-hidden"
                >
                  <img src={plan.banner_url} alt={plan.name} className="w-full object-contain" />
                </motion.div>
              )}

              {/* Card principal */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`border border-border bg-card p-4 md:p-5 ${plan.banner_url ? "rounded-b-xl" : "rounded-xl"}`}
              >
                {/* Preço */}
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-1 text-primary mb-1.5">
                    <Crown className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">{plan.name}</span>
                  </div>
                  <div className="flex items-baseline justify-center gap-0.5">
                    <span className="text-xs text-muted-foreground font-medium">R$</span>
                    <span className="text-4xl font-display text-foreground">
                      {Number(plan.price).toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-xs text-muted-foreground">{periodLabel(plan.period)}</span>
                  </div>
                </div>

                {/* Benefícios */}
                <div className="space-y-1.5 mb-4">
                  {benefits.map((text, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <span className="text-[11px] text-secondary-foreground">{text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link to={`/checkout/${plan.id}`}>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold h-11 rounded-lg">
                    <Lock className="w-3.5 h-3.5 mr-1.5" />
                    ASSINAR AGORA
                  </Button>
                </Link>

                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <ShieldCheck className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground">Pagamento seguro via PIX • Acesso imediato</span>
                </div>
              </motion.div>

              {/* Social proof compacto */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-5"
              >
                <div className="flex items-center justify-center gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                  ))}
                  <span className="text-[9px] text-muted-foreground ml-1">4.9 • +10.000 membros</span>
                </div>

                <div className="space-y-1.5">
                  {[
                    { name: "Lucas M.", text: "Melhor investimento. Conteúdo incrível." },
                    { name: "Ana P.", text: "Vale cada centavo. Super recomendo!" },
                    { name: "Carlos R.", text: "Qualidade top e sem enrolação." },
                  ].map((t, i) => (
                    <div key={i} className="flex items-start gap-2 py-1.5 px-2.5 rounded-lg bg-card border border-border">
                      <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[8px] font-bold text-muted-foreground">{t.name[0]}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground leading-snug">"{t.text}"</p>
                        <p className="text-[9px] text-primary font-medium mt-0.5">{t.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground text-sm">
            Nenhum plano disponível no momento.
          </div>
        )}
      </main>
    </div>
  );
};

export default VipPage;
