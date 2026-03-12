import { useOutletContext } from "react-router-dom";
import { Copy, Link2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Affiliate } from "./AffiliateLayout";

const AffiliateLink = () => {
  const { affiliate } = useOutletContext<{ affiliate: Affiliate }>();
  const { toast } = useToast();

  const baseUrl = window.location.origin;
  const affiliateLink = `${baseUrl}/?ref=${affiliate.slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    toast({ title: "Link copiado!" });
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({ title: "Assine VIP", url: affiliateLink });
    } else {
      copyLink();
    }
  };

  return (
    <div>
      <h1 className="text-xl font-display text-foreground mb-4">MEU LINK</h1>

      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Link2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Seu link de afiliado</p>
            <p className="text-[10px] text-muted-foreground">Compartilhe para vender</p>
          </div>
        </div>

        <div className="bg-secondary border border-border rounded-lg p-3">
          <p className="text-xs text-foreground break-all font-mono">{affiliateLink}</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={copyLink} className="flex-1 bg-primary text-primary-foreground text-xs h-9">
            <Copy className="w-3.5 h-3.5 mr-1.5" />
            Copiar Link
          </Button>
          <Button onClick={shareLink} variant="outline" className="text-xs h-9">
            <Share2 className="w-3.5 h-3.5 mr-1.5" />
            Compartilhar
          </Button>
        </div>
      </div>

      <div className="mt-4 bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-display text-foreground mb-2">COMO FUNCIONA</h3>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>1. Compartilhe seu link com seus seguidores</p>
          <p>2. Quando alguém acessar pelo seu link, o clique é registrado</p>
          <p>3. Se a pessoa comprar um plano VIP, <span className="text-primary font-medium">100% do valor vai pra você</span></p>
          <p>4. O dinheiro cai direto no seu gateway conectado</p>
        </div>
      </div>
    </div>
  );
};

export default AffiliateLink;
