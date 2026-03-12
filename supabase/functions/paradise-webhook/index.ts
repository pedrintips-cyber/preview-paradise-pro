import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const payload = await req.json();
    console.log("Webhook received:", JSON.stringify(payload));

    const externalId = payload.external_id ? String(payload.external_id) : "";
    const incomingStatus = payload.status ? String(payload.status).toLowerCase() : "";
    const transactionId = payload.transaction_id ? String(payload.transaction_id) : "";

    if (!externalId && !transactionId) {
      return new Response(JSON.stringify({ error: "Missing external_id or transaction_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find purchase
    let purchase: {
      id: string;
      affiliate_id: string | null;
      amount: number;
      plan_id: string | null;
      status: string;
      paradise_reference: string;
    } | null = null;

    if (externalId) {
      const { data } = await supabase
        .from("purchases")
        .select("id, affiliate_id, amount, plan_id, status, paradise_reference")
        .eq("paradise_reference", externalId)
        .maybeSingle();
      purchase = data;
    }

    if (!purchase && transactionId) {
      const { data } = await supabase
        .from("purchases")
        .select("id, affiliate_id, amount, plan_id, status, paradise_reference")
        .ilike("paradise_transaction_id", `%${transactionId}%`)
        .maybeSingle();
      purchase = data;
    }

    if (!purchase) {
      console.warn(`Purchase not found for reference=${externalId || "n/a"} transaction=${transactionId || "n/a"}`);
      return new Response(JSON.stringify({ success: true, ignored: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const currentStatus = String(purchase.status || "pending").toLowerCase();
    const nextStatus = incomingStatus || currentStatus;

    if (nextStatus !== currentStatus) {
      const { error: updateErr } = await supabase
        .from("purchases")
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq("id", purchase.id);

      if (updateErr) {
        console.error("Error updating purchase:", updateErr);
        return new Response(JSON.stringify({ error: "Failed to update purchase" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const hasJustBeenApproved = currentStatus !== "approved" && nextStatus === "approved";
    const isAffiliateActivation = purchase.paradise_reference.startsWith("AFF-ACT-");

    // Handle affiliate activation payment
    if (hasJustBeenApproved && isAffiliateActivation && purchase.affiliate_id) {
      await supabase
        .from("affiliates")
        .update({
          is_paid: true,
          paid_at: new Date().toISOString(),
          activation_purchase_id: purchase.id,
        })
        .eq("id", purchase.affiliate_id);

      console.log(`Affiliate ${purchase.affiliate_id} activated via payment ${purchase.id}`);
    }

    // Handle VIP purchase with affiliate tracking
    if (hasJustBeenApproved && !isAffiliateActivation && purchase.affiliate_id) {
      const { data: existingSale } = await supabase
        .from("affiliate_sales")
        .select("id")
        .eq("purchase_id", purchase.id)
        .maybeSingle();

      if (!existingSale) {
        const saleAmount = Number(purchase.amount) / 100;

        // 100% goes to affiliate — record the full sale
        await supabase.from("affiliate_sales").insert({
          affiliate_id: purchase.affiliate_id,
          purchase_id: purchase.id,
          plan_id: purchase.plan_id,
          sale_amount: saleAmount,
          commission_amount: saleAmount, // 100% to affiliate
          status: "approved",
        });

        // Update affiliate totals
        const { data: affiliate } = await supabase
          .from("affiliates")
          .select("balance, total_earned")
          .eq("id", purchase.affiliate_id)
          .single();

        if (affiliate) {
          await supabase
            .from("affiliates")
            .update({
              balance: Number(affiliate.balance) + saleAmount,
              total_earned: Number(affiliate.total_earned) + saleAmount,
            })
            .eq("id", purchase.affiliate_id);
        }

        console.log(`Affiliate ${purchase.affiliate_id} earned R$${saleAmount.toFixed(2)} (100%) from sale`);
      }
    }

    console.log(`Purchase updated: ${purchase.paradise_reference} -> ${nextStatus}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
