import { Crown, Check, Zap, Shield, Star, Play, Lock, Users, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

const benefits = [
  { icon: Play, text: "Acesso a todos os vídeos exclusivos" },
  { icon: Zap, text: "Zero anúncios, experiência limpa" },
  { icon: Shield, text: "Qualidade HD em todos os conteúdos" },
  { icon: Star, text: "Lançamentos antecipados" },
  { icon: Users, text: "Comunidade VIP exclusiva" },
];

const testimonials = [
  { name: "Lucas M.", text: "Melhor investimento que fiz. Conteúdo incrível por um preço absurdo." },
  { name: "Ana P.", text: "Não acredito que é só R$29,90 no ANO. Vale cada centavo!" },
  { name: "Carlos R.", text: "Conteúdo de qualidade e sem enrolação. Recomendo demais." },
];

const VipPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-transparent to-transparent" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px]" />
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 text-center px-4 pt-8 pb-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="w-12 h-12 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-3"
            >
              <Crown className="w-5 h-5 text-primary" />
            </motion.div>

            <h1 className="text-2xl md:text-4xl font-display text-foreground mb-1.5 leading-tight">
              SEJA <span className="text-primary">VIP</span> AGORA
            </h1>
            <p className="text-[11px] md:text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Desbloqueie todo o conteúdo exclusivo da plataforma por apenas
            </p>

            {/* Price highlight */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4 mb-5"
            >
              <div className="inline-block relative">
                <span className="text-4xl md:text-5xl font-bold text-foreground">R$29,90</span>
                <span className="text-sm text-muted-foreground ml-1">/ano</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Apenas R$2,49/mês • Menos que um café ☕
              </p>
            </motion.div>

            <Link to="#">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow px-8 py-2.5 text-sm font-semibold w-full max-w-[260px]">
                <Lock className="w-3.5 h-3.5 mr-1.5" />
                Desbloquear VIP — R$29,90/ano
              </Button>
            </Link>
            <p className="text-[9px] text-muted-foreground mt-2">
              Cancele quando quiser • Pagamento seguro
            </p>
          </motion.div>
        </div>

        {/* Benefits */}
        <div className="px-4 md:px-8 py-5">
          <h2 className="text-base md:text-xl font-display text-foreground text-center mb-4">
            O QUE VOCÊ GANHA
          </h2>
          <div className="max-w-md mx-auto space-y-2">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-card border border-border"
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <b.icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-xs text-secondary-foreground">{b.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div className="px-4 md:px-8 py-5 border-t border-border">
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
            ))}
            <span className="text-[10px] text-muted-foreground ml-1">4.9/5 • +10.000 membros</span>
          </div>
          <div className="max-w-md mx-auto space-y-2">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="p-3 rounded-lg bg-card border border-border"
              >
                <p className="text-[11px] text-muted-foreground italic mb-1">"{t.text}"</p>
                <p className="text-[10px] text-primary font-medium">— {t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center px-4 py-6 border-t border-border"
        >
          <p className="text-xs text-muted-foreground mb-3">
            Não perca mais tempo. Comece a assistir agora.
          </p>
          <Link to="#">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow px-6 py-2 text-xs font-semibold">
              <Crown className="w-3.5 h-3.5 mr-1.5" />
              Quero ser VIP — R$29,90/ano
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </motion.div>
      </main>
    </div>
  );
};

export default VipPage;
