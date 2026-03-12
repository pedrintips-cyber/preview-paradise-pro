import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PARADISE_API_URL = "https://multi.paradisepags.com/api/v1/transaction.php";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OWNER_API_KEY = Deno.env.get("PARADISE_API_KEY");
    if (!OWNER_API_KEY) {
      throw new Error("PARADISE_API_KEY is not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    const { plan_id, customer, productHash, affiliate_id } = body;

    if (!plan_id || !customer?.name || !customer?.email || !customer?.document || !customer?.phone) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios: plan_id, customer (name, email, document, phone)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch plan
    const { data: plan, error: planErr } = await supabase
      .from("vip_plans")
      .select("*")
      .eq("id", plan_id)
      .eq("active", true)
      .single();

    if (planErr || !plan) {
      return new Response(
        JSON.stringify({ error: "Plano não encontrado ou inativo" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const totalAmountCents = Math.round(Number(plan.price) * 100);
    const reference = `VIP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Check if affiliate has their own gateway
    let affiliateGatewayToken: string | null = null;
    let affiliateData: { id: string; gateway_token: string | null; commission_rate: number } | null = null;

    if (affiliate_id) {
      const { data: aff } = await supabase
        .from("affiliates")
        .select("id, gateway_token, commission_rate")
        .eq("id", affiliate_id)
        .eq("status", "active")
        .single();

      if (aff) {
        affiliateData = aff;
        if (aff.gateway_token) {
          affiliateGatewayToken = aff.gateway_token;
        }
      }
    }

    const customerData = {
      name: customer.name,
      email: customer.email,
      document: customer.document.replace(/\D/g, ""),
      phone: customer.phone.replace(/\D/g, ""),
    };

    let pixResult: any;

    if (affiliateGatewayToken) {
      // SPLIT: 80% to affiliate gateway, 20% to owner gateway
      const affiliateAmount = Math.round(totalAmountCents * 0.80);
      const ownerAmount = totalAmountCents - affiliateAmount;

      console.log(`Split payment: total=${totalAmountCents}, affiliate=${affiliateAmount}, owner=${ownerAmount}`);

      // Create PIX on AFFILIATE's gateway (80%)
      const affBody: Record<string, unknown> = {
        amount: affiliateAmount,
        description: `Plano VIP ${plan.name} (Afiliado)`,
        reference: `${reference}-AFF`,
        customer: customerData,
      };
      if (productHash) affBody.productHash = productHash;
      else affBody.source = "api_externa";

      const affRes = await fetch(PARADISE_API_URL, {
        method: "POST",
        headers: { "X-API-Key": affiliateGatewayToken, "Content-Type": "application/json" },
        body: JSON.stringify(affBody),
      });
      const affData = await affRes.json();

      if (!affRes.ok || affData.status !== "success") {
        console.error("Affiliate gateway error:", affData);
        return new Response(
          JSON.stringify({ error: "Erro ao gerar PIX no gateway do afiliado", details: affData }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create PIX on OWNER's gateway (20%)
      const ownerBody: Record<string, unknown> = {
        amount: ownerAmount,
        description: `Plano VIP ${plan.name} (Comissão)`,
        reference: `${reference}-OWN`,
        customer: customerData,
      };
      if (productHash) ownerBody.productHash = productHash;
      else ownerBody.source = "api_externa";

      const ownRes = await fetch(PARADISE_API_URL, {
        method: "POST",
        headers: { "X-API-Key": OWNER_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify(ownerBody),
      });
      const ownData = await ownRes.json();

      if (!ownRes.ok || ownData.status !== "success") {
        console.error("Owner gateway error (non-blocking):", ownData);
        // Non-blocking - affiliate PIX is the main one shown to user
      }

      // The customer sees the AFFILIATE's PIX (which is the larger amount - 80%)
      // We show the full price but the PIX code is for the affiliate's 80%
      pixResult = {
        qr_code: affData.qr_code,
        qr_code_base64: affData.qr_code_base64,
        transaction_id: affData.transaction_id,
        expires_at: affData.expires_at,
        owner_transaction_id: ownData?.transaction_id || null,
        split: true,
        affiliate_amount: affiliateAmount,
        owner_amount: ownerAmount,
      };
    } else {
      // NO SPLIT: full amount to owner gateway
      const paradiseBody: Record<string, unknown> = {
        amount: totalAmountCents,
        description: `Plano VIP ${plan.name}`,
        reference,
        customer: customerData,
      };
      if (productHash) paradiseBody.productHash = productHash;
      else paradiseBody.source = "api_externa";

      const paradiseRes = await fetch(PARADISE_API_URL, {
        method: "POST",
        headers: { "X-API-Key": OWNER_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify(paradiseBody),
      });
      const paradiseData = await paradiseRes.json();

      if (!paradiseRes.ok || paradiseData.status !== "success") {
        console.error("Paradise API error:", paradiseData);
        return new Response(
          JSON.stringify({ error: "Erro ao gerar PIX", details: paradiseData }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      pixResult = {
        qr_code: paradiseData.qr_code,
        qr_code_base64: paradiseData.qr_code_base64,
        transaction_id: paradiseData.transaction_id,
        expires_at: paradiseData.expires_at,
        split: false,
      };
    }

    // Save purchase in DB
    const { data: purchase, error: insertErr } = await supabase
      .from("purchases")
      .insert({
        plan_id,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_document: customer.document.replace(/\D/g, ""),
        customer_phone: customer.phone.replace(/\D/g, ""),
        amount: totalAmountCents,
        status: "pending",
        paradise_transaction_id: String(pixResult.transaction_id),
        paradise_reference: reference,
        qr_code: pixResult.qr_code,
        qr_code_base64: pixResult.qr_code_base64,
        expires_at: pixResult.expires_at,
        affiliate_id: affiliate_id || null,
      })
      .select()
      .single();

    if (insertErr) {
      console.error("DB insert error:", insertErr);
      throw new Error("Erro ao salvar compra");
    }

    // Track analytics
    await supabase.from("analytics").insert({ event_type: "purchase", metadata: { plan_id, plan_name: plan.name } });

    return new Response(
      JSON.stringify({
        purchase_id: purchase.id,
        qr_code: pixResult.qr_code,
        qr_code_base64: pixResult.qr_code_base64,
        amount: totalAmountCents,
        expires_at: pixResult.expires_at,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Erro interno";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
