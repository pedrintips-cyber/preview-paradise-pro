import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AffiliateTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get("ref");

    if (ref) {
      // Store ref in localStorage
      localStorage.setItem("affiliate_ref", ref);

      // Track click
      const trackClick = async () => {
        const { data: affiliate } = await supabase
          .from("affiliates")
          .select("id")
          .eq("slug", ref)
          .eq("status", "active")
          .maybeSingle();

        if (affiliate) {
          localStorage.setItem("affiliate_id", affiliate.id);
          await supabase.from("affiliate_clicks").insert({
            affiliate_id: affiliate.id,
            page: location.pathname,
            user_agent: navigator.userAgent,
            referrer: document.referrer || null,
          });
        }
      };
      trackClick();
    }
  }, [location.search]);

  return null;
};

export default AffiliateTracker;
