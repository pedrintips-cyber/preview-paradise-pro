import { useState, useEffect } from "react";
import { Crown, Check, Zap, Shield, Star, Play, Lock, Users, ChevronRight } from "lucide-react";
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
  const [plans, setPlans] = useState<DBVipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("vip_plans")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      setPlans((data as DBVipPlan[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-12 md:pt-14">
        {/* Hero */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-transparent to-transparent" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[250px] h-[250px] bg-primary/10 rounded-full blur-[100px]" />

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 text-center px-4 pt-8 pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="w-14 h-14 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-3"
            >
              <Crown className="w-6 h-6 text-primary" />
            </motion.div>

            <h1 className="text-2xl md:text-5xl font-display text-foreground mb-1.5">
              SEJA <span className="text-primary">VIP</span> AGORA
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground max-w-xs mx-auto">
              Desbloqueie todo o conteúdo exclusivo da plataforma
            </p>
          </motion.div>
        </div>

        {/* Plans */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : plans.length > 0 ? (
          <div className="px-4 md:px-8 pb-6">
            <div className="max-w-lg mx-auto grid gap-4">
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.1 }}
                  className="relative rounded-xl overflow-hidden border border-primary/20 bg-card"
                >
                  {plan.banner_url && (
                    <img src={plan.banner_url} alt={plan.name} className="w-full h-32 md:h-40 object-cover" />
                  )}
                  <div className="p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-5 h-5 text-primary" />
                      <h3 className="text-lg md:text-xl font-display text-foreground">{plan.name}</h3>
                    </div>
                    {plan.description && (
                      <p className="text-xs text-muted-foreground mb-3">{plan.description}</p>
                    )}
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl md:text-4xl font-bold text-foreground">
                        R${Number(plan.price).toFixed(2).replace(".", ",")}
                      </span>
                      <span className="text-sm text-muted-foreground">{periodLabel(plan.period)}</span>
                    </div>
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow text-sm font-semibold">
                      <Lock className="w-4 h-4 mr-1.5" />
                      Assinar {plan.name}
                    </Button>
                    <p className="text-[9px] text-muted-foreground mt-2 text-center">Cancele quando quiser • Pagamento seguro</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground text-sm">
            Nenhum plano VIP disponível no momento.
          </div>
        )}

        {/* Benefits */}
        <div className="px-4 md:px-8 py-6">
          <h2 className="text-lg md:text-2xl font-display text-foreground text-center mb-4">O QUE VOCÊ GANHA</h2>
          <div className="max-w-md mx-auto space-y-2">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <b.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs text-secondary-foreground">{b.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div className="px-4 md:px-8 py-6 border-t border-border">
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-primary text-primary" />
            ))}
            <span className="text-[10px] text-muted-foreground ml-1">4.9/5 • +10.000 membros</span>
          </div>
          <div className="max-w-md mx-auto space-y-2">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.1 }} className="p-3 rounded-lg bg-card border border-border">
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
