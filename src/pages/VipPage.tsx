import { Crown, Check, Zap, Shield, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const plans = [
  {
    id: "monthly",
    name: "Mensal",
    price: "R$ 29,90",
    period: "/mês",
    features: [
      "Acesso a todos os vídeos VIP",
      "Sem anúncios",
      "Qualidade HD",
      "Cancele quando quiser",
    ],
    highlight: false,
    icon: Zap,
  },
  {
    id: "quarterly",
    name: "Trimestral",
    price: "R$ 69,90",
    period: "/3 meses",
    originalPrice: "R$ 89,70",
    features: [
      "Tudo do plano mensal",
      "Economia de 22%",
      "Acesso antecipado a lançamentos",
      "Suporte prioritário",
    ],
    highlight: true,
    icon: Crown,
    badge: "MAIS POPULAR",
  },
  {
    id: "annual",
    name: "Anual",
    price: "R$ 199,90",
    period: "/ano",
    originalPrice: "R$ 358,80",
    features: [
      "Tudo do plano trimestral",
      "Economia de 44%",
      "Conteúdo exclusivo anual",
      "Badge VIP no perfil",
      "Downloads offline",
    ],
    highlight: false,
    icon: Shield,
    badge: "MELHOR VALOR",
  },
];

const VipPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-4 md:px-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto mb-10 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-4">
            <Crown className="w-4 h-4" />
            Acesso VIP
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-display text-foreground mb-3">
            DESBLOQUEIE TODO O{" "}
            <span className="text-gradient-red">CONTEÚDO</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
            Assista a todos os vídeos exclusivos, sem limites e sem anúncios.
            Escolha o plano ideal para você.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-xl border p-5 md:p-6 flex flex-col ${
                plan.highlight
                  ? "border-primary bg-primary/5 shadow-glow scale-[1.02] md:scale-105"
                  : "border-border bg-card"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] md:text-xs font-bold tracking-wide">
                  {plan.badge}
                </span>
              )}

              <div className="flex items-center gap-2 mb-4">
                <plan.icon className={`w-5 h-5 ${plan.highlight ? "text-primary" : "text-muted-foreground"}`} />
                <h3 className="font-display text-xl text-foreground">{plan.name}</h3>
              </div>

              <div className="mb-4">
                {plan.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through mr-2">
                    {plan.originalPrice}
                  </span>
                )}
                <span className="text-3xl md:text-4xl font-bold text-foreground">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm text-secondary-foreground">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? "text-primary" : "text-muted-foreground"}`} />
                    {feat}
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.highlight
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                <Crown className="w-4 h-4 mr-1.5" />
                Assinar {plan.name}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-10 text-muted-foreground text-xs md:text-sm"
        >
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4" />
            Pagamento seguro
          </span>
          <span className="flex items-center gap-1.5">
            <Star className="w-4 h-4" />
            +10.000 assinantes
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4" />
            Cancele quando quiser
          </span>
        </motion.div>
      </main>
    </div>
  );
};

export default VipPage;
