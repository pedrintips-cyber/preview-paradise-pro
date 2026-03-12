import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const failureStatuses = new Set(["failed", "refused", "canceled", "cancelled", "expired", "chargeback"]);

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

    const splitMatch = externalId.match(/-(AFF|OWN)$/i);
    const splitPart = splitMatch?.[1]?.toUpperCase() || null;
    const baseReference = splitPart ? externalId.replace(/-(AFF|OWN)$/i, "") : externalId;

    let purchase:
      | {
          id: string;
          affiliate_id: string | null;
          amount: number;
          plan_id: string | null;
          status: string;
          paradise_reference: string;
        }
      | null = null;

    if (baseReference) {
      const { data } = await supabase
        .from("purchases")
        .select("id, affiliate_id, amount, plan_id, status, paradise_reference")
        .eq("paradise_reference", baseReference)
        .maybeSingle();
      purchase = data;
    }

    if (!purchase && externalId) {
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
    let nextStatus = currentStatus;

    if (splitPart) {
      if (currentStatus !== "approved") {
        if (incomingStatus === "approved") {
          if (splitPart === "AFF") {
            nextStatus = currentStatus === "split_owner_paid" ? "approved" : "split_affiliate_paid";
          } else if (splitPart === "OWN") {
            nextStatus = currentStatus === "split_affiliate_paid" ? "approved" : "split_owner_paid";
          }
        } else if (failureStatuses.has(incomingStatus)) {
          nextStatus = "failed";
        }
      }
    } else {
      if (incomingStatus) nextStatus = incomingStatus;
    }

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

    if (hasJustBeenApproved && purchase.affiliate_id) {
      const { data: existingSale } = await supabase
        .from("affiliate_sales")
        .select("id")
        .eq("purchase_id", purchase.id)
        .maybeSingle();

      if (!existingSale) {
        const { data: affiliate } = await supabase
          .from("affiliates")
          .select("id, commission_rate, balance, total_earned, gateway_token")
          .eq("id", purchase.affiliate_id)
          .single();

        if (affiliate) {
          const saleAmount = Number(purchase.amount) / 100;
          const commissionPercent = affiliate.gateway_token ? 80 : Number(affiliate.commission_rate);
          const commissionAmount = saleAmount * (commissionPercent / 100);

          await supabase.from("affiliate_sales").insert({
            affiliate_id: affiliate.id,
            purchase_id: purchase.id,
            plan_id: purchase.plan_id,
            sale_amount: saleAmount,
            commission_amount: commissionAmount,
            status: "approved",
          });

          await supabase
            .from("affiliates")
            .update({
              balance: Number(affiliate.balance) + commissionAmount,
              total_earned: Number(affiliate.total_earned) + commissionAmount,
            })
            .eq("id", affiliate.id);

          console.log(
            `Affiliate ${affiliate.id} earned R$${commissionAmount.toFixed(2)} (${commissionPercent}%) from sale R$${saleAmount.toFixed(2)}. Owner earns R$${(saleAmount - commissionAmount).toFixed(2)} (${100 - commissionPercent}%)`
          );
        }
      }
    }

    console.log(`Purchase updated: ${purchase.paradise_reference} -> ${nextStatus} (incoming=${incomingStatus}, split=${splitPart || "none"})`);

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
