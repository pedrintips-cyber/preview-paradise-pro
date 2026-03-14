import { useState, useEffect } from "react";
import { Crown, Check, Zap, Shield, Star, Play, Lock, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import type { DBVipPlan } from "@/types/database";

const benefits = [
  { icon: Play, text: "Acesso a todos os vídeos exclusivos" },
  { icon: Zap, text: "Zero anúncios, experiência limpa" },
  { icon: Shield, text: "Qualidade HD em todos os conteúdos" },
  { icon: Star, text: "Lançamentos antecipados" },
  { icon: Users, text: "Comunidade VIP exclusiva" },
];

const testimonials = [
  { name: "Lucas M.", text: "Melhor investimento que fiz. Conteúdo incrível por um preço absurdo." },
  { name: "Ana P.", text: "Não acredito que é tão barato. Vale cada centavo!" },
  { name: "Carlos R.", text: "Conteúdo de qualidade e sem enrolação. Recomendo demais." },
];

const periodLabel = (p: string) => {
  if (p === "mensal") return "/mês";
  if (p === "trimestral") return "/trimestre";
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
        {/* Hero */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent" />
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-primary/15 rounded-full blur-[120px]" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 text-center px-4 pt-10 pb-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center mx-auto mb-4 rotate-3"
            >
              <Crown className="w-7 h-7 text-primary" />
            </motion.div>

            <h1 className="text-3xl md:text-6xl font-display text-foreground mb-2 tracking-wide">
              ACESSO <span className="text-primary">VIP</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Desbloqueie todo o conteúdo exclusivo e entre para a comunidade
            </p>
          </motion.div>
        </div>

        {/* Single Plan Card */}
        {plan ? (
          <div className="px-4 md:px-8 py-6">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="max-w-sm mx-auto"
            >
              <div className="relative rounded-2xl overflow-hidden border-2 border-primary/30 bg-card shadow-[0_0_40px_hsl(var(--primary)/0.15)]">
                {/* Banner */}
                {plan.banner_url && (
                  <div className="relative">
                    <img src={plan.banner_url} alt={plan.name} className="w-full h-36 md:h-44 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  </div>
                )}

                <div className="p-5 md:p-7">
                  {/* Price */}
                  <div className="text-center mb-5">
                    <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-3">
                      <Crown className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-medium text-primary">{plan.name}</span>
                    </div>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-sm text-muted-foreground">R$</span>
                      <span className="text-5xl md:text-6xl font-display text-foreground tracking-tight">
                        {Number(plan.price).toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{periodLabel(plan.period)}</span>
                  </div>

                  {/* Benefits inline */}
                  <div className="space-y-2 mb-6">
                    {benefits.map((b, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 + i * 0.05 }}
                        className="flex items-center gap-2.5"
                      >
                        <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-xs text-secondary-foreground">{b.text}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link to={`/checkout/${plan.id}`}>
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow text-sm font-bold h-12 rounded-xl">
                      <Lock className="w-4 h-4 mr-2" />
                      ASSINAR AGORA
                    </Button>
                  </Link>
                  <p className="text-[9px] text-muted-foreground mt-2.5 text-center">
                    Pagamento seguro via PIX • Acesso imediato
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground text-sm">
            Nenhum plano VIP disponível no momento.
          </div>
        )}

        {/* Social proof */}
        <div className="px-4 md:px-8 py-6">
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-primary text-primary" />
            ))}
            <span className="text-[10px] text-muted-foreground ml-1.5">4.9/5 • +10.000 membros</span>
          </div>
          <div className="max-w-sm mx-auto space-y-2">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="p-3 rounded-lg bg-card border border-border"
              >
                <p className="text-xs text-muted-foreground italic mb-1">"{t.text}"</p>
                <p className="text-[10px] text-primary font-medium">— {t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VipPage;
