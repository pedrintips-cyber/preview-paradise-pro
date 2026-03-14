import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { DBVipPlan } from "@/types/database";
import CheckoutModal from "@/components/CheckoutModal";

interface CheckoutContextType {
  openCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextType>({ openCheckout: () => {} });

export const useCheckout = () => useContext(CheckoutContext);

export const CheckoutProvider = ({ children }: { children: ReactNode }) => {
  const [plan, setPlan] = useState<DBVipPlan | null>(null);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadPlan = async () => {
      const { data } = await supabase
        .from("vip_plans")
        .select("*")
        .eq("active", true)
        .order("sort_order")
        .limit(1);
      if (data && data.length > 0) setPlan(data[0]);
      setLoaded(true);
    };
    loadPlan();
  }, []);

  const openCheckout = () => {
    if (plan) setOpen(true);
  };

  return (
    <CheckoutContext.Provider value={{ openCheckout }}>
      {children}
      {loaded && plan && (
        <CheckoutModal plan={plan} open={open} onClose={() => setOpen(false)} />
      )}
    </CheckoutContext.Provider>
  );
};
