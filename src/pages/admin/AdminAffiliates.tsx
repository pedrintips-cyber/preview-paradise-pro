import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Users, Eye, Ban, CheckCircle, DollarSign, MousePointerClick, TrendingUp, ArrowLeft, X } from "lucide-react";

interface Affiliate {
  id: string;
  name: string;
  email: string;
  slug: string;
  status: string;
  balance: number;
  total_earned: number;
  commission_rate: number;
  gateway_token: string | null;
  created_at: string | null;
  phone: string | null;
}

interface AffiliateSale {
  id: string;
  sale_amount: number;
  commission_amount: number;
  status: string;
  created_at: string | null;
  plan_id: string | null;
}

const AdminAffiliates = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Affiliate | null>(null);
  const [sales, setSales] = useState<AffiliateSale[]>([]);
  const [clickCount, setClickCount] = useState(0);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [ownerEarnings, setOwnerEarnings] = useState(0);
  const [totalSalesCount, setTotalSalesCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadAffiliates();
    loadOwnerStats();
  }, []);

  const loadAffiliates = async () => {
    const { data } = await supabase
      .from("affiliates")
      .select("id, name, email, slug, status, balance, total_earned, commission_rate, gateway_token, created_at, phone")
      .order("total_earned", { ascending: false });
    setAffiliates(data || []);
    setLoading(false);
  };

  const loadOwnerStats = async () => {
    // Calculate owner's 20% from all affiliate sales
    const { data: allSales } = await supabase
      .from("affiliate_sales")
      .select("sale_amount, commission_amount")
      .eq("status", "approved");

    if (allSales) {
      const ownerTotal = allSales.reduce((sum, s) => sum + (Number(s.sale_amount) - Number(s.commission_amount)), 0);
      setOwnerEarnings(ownerTotal);
      setTotalSalesCount(allSales.length);
    }
  };

  const openDetail = async (aff: Affiliate) => {
    setSelected(aff);
    setLoadingDetail(true);

    const [salesRes, clicksRes] = await Promise.all([
      supabase
        .from("affiliate_sales")
        .select("id, sale_amount, commission_amount, status, created_at, plan_id")
        .eq("affiliate_id", aff.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("affiliate_clicks")
        .select("id", { count: "exact", head: true })
        .eq("affiliate_id", aff.id),
    ]);

    setSales(salesRes.data || []);
    setClickCount(clicksRes.count || 0);
    setLoadingDetail(false);
  };

  const toggleStatus = async (aff: Affiliate) => {
    const newStatus = aff.status === "active" ? "inactive" : "active";
    await supabase.from("affiliates").update({ status: newStatus }).eq("id", aff.id);
    toast({ title: newStatus === "active" ? "Afiliado reativado" : "Afiliado desativado" });
    loadAffiliates();
    if (selected?.id === aff.id) setSelected({ ...aff, status: newStatus });
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-xl font-display text-foreground mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" /> Afiliados
      </h1>

      {/* Owner earnings summary */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Seus Ganhos (20%)</p>
          <p className="text-lg font-bold text-primary mt-1">R${ownerEarnings.toFixed(2).replace(".", ",")}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Vendas Afiliados</p>
          <p className="text-lg font-bold text-foreground mt-1">{totalSalesCount}</p>
        </div>
      </div>

      {/* Detail view */}
      {selected ? (
        <div className="space-y-4">
          <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar à lista
          </button>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">{selected.name}</h2>
                <p className="text-xs text-muted-foreground">{selected.email}</p>
                {selected.phone && <p className="text-xs text-muted-foreground">{selected.phone}</p>}
                <p className="text-xs text-muted-foreground mt-1">Slug: <span className="text-foreground font-mono">{selected.slug}</span></p>
                <p className="text-xs text-muted-foreground">Desde: {selected.created_at ? new Date(selected.created_at).toLocaleDateString("pt-BR") : "—"}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${selected.status === "active" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                  {selected.status === "active" ? "Ativo" : "Inativo"}
                </span>
                <Button size="sm" variant="outline" onClick={() => toggleStatus(selected)} className="text-xs h-7">
                  {selected.status === "active" ? <><Ban className="w-3 h-3 mr-1" /> Desativar</> : <><CheckCircle className="w-3 h-3 mr-1" /> Reativar</>}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="bg-secondary rounded-md p-2 text-center">
                <DollarSign className="w-3.5 h-3.5 text-primary mx-auto mb-0.5" />
                <p className="text-xs font-bold text-foreground">R${Number(selected.total_earned).toFixed(2).replace(".", ",")}</p>
                <p className="text-[9px] text-muted-foreground">Total ganho</p>
              </div>
              <div className="bg-secondary rounded-md p-2 text-center">
                <MousePointerClick className="w-3.5 h-3.5 text-primary mx-auto mb-0.5" />
                <p className="text-xs font-bold text-foreground">{clickCount}</p>
                <p className="text-[9px] text-muted-foreground">Cliques</p>
              </div>
              <div className="bg-secondary rounded-md p-2 text-center">
                <TrendingUp className="w-3.5 h-3.5 text-primary mx-auto mb-0.5" />
                <p className="text-xs font-bold text-foreground">{sales.length}</p>
                <p className="text-[9px] text-muted-foreground">Vendas</p>
              </div>
            </div>

            <div className="mt-2 text-xs text-muted-foreground">
              Gateway: {selected.gateway_token ? <span className="text-primary">Conectado</span> : <span className="text-destructive">Não conectado</span>}
              {" • "}Comissão: {selected.gateway_token ? "80%" : `${selected.commission_rate}%`}
            </div>
          </div>

          {/* Sales history */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">Histórico de Vendas</h3>
            {loadingDetail ? (
              <div className="flex justify-center py-4"><div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : sales.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhuma venda registrada</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {sales.map((sale) => {
                  const ownerCut = Number(sale.sale_amount) - Number(sale.commission_amount);
                  return (
                    <div key={sale.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-xs text-foreground">Venda R${Number(sale.sale_amount).toFixed(2).replace(".", ",")}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {sale.created_at ? new Date(sale.created_at).toLocaleString("pt-BR") : "—"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-primary font-medium">Afiliado: R${Number(sale.commission_amount).toFixed(2).replace(".", ",")}</p>
                        <p className="text-[10px] text-muted-foreground">Você: R${ownerCut.toFixed(2).replace(".", ",")}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Affiliates list */
        <div className="space-y-2">
          {affiliates.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum afiliado cadastrado</p>
            </div>
          ) : (
            affiliates.map((aff) => (
              <div key={aff.id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between hover:border-primary/30 transition-colors cursor-pointer" onClick={() => openDetail(aff)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{aff.name}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${aff.status === "active" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                      {aff.status === "active" ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{aff.email}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-sm font-bold text-primary">R${Number(aff.total_earned).toFixed(2).replace(".", ",")}</p>
                  <p className="text-[10px] text-muted-foreground">total ganho</p>
                </div>
                <Eye className="w-4 h-4 text-muted-foreground ml-3 flex-shrink-0" />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminAffiliates;
