import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PARADISE_API_URL = "https://multi.paradisepags.com/api/v1/transaction.php";

type CustomerPayload = {
  name: string;
  email: string;
  document: string;
  phone: string;
};

type ParadisePixResponse = {
  qr_code: string;
  qr_code_base64: string;
  transaction_id: string | number;
  expires_at: string;
};

const createParadisePix = async (params: {
  apiKey: string;
  amount: number;
  description: string;
  reference: string;
  customer: CustomerPayload;
  productHash?: string;
}): Promise<ParadisePixResponse> => {
  const { apiKey, amount, description, reference, customer, productHash } = params;

  const payload: Record<string, unknown> = {
    amount,
    description,
    reference,
    customer,
  };

  if (productHash) payload.productHash = productHash;
  else payload.source = "api_externa";

  const paradiseRes = await fetch(PARADISE_API_URL, {
    method: "POST",
    headers: { "X-API-Key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const paradiseData = await paradiseRes.json();

  if (!paradiseRes.ok || paradiseData.status !== "success") {
    console.error("Paradise API error:", paradiseData);
    throw new Error("Erro ao gerar PIX");
  }

  return {
    qr_code: paradiseData.qr_code,
    qr_code_base64: paradiseData.qr_code_base64,
    transaction_id: paradiseData.transaction_id,
    expires_at: paradiseData.expires_at,
  };
};

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
    const { plan_id, customer, productHash, affiliate_id, type } = body;

    // Type "affiliate_activation" = R$250 payment to activate affiliate account
    if (type === "affiliate_activation") {
      const { affiliate_id: affId } = body;
      if (!affId || !customer?.name || !customer?.email || !customer?.document || !customer?.phone) {
        return new Response(
          JSON.stringify({ error: "Campos obrigatórios: affiliate_id, customer (name, email, document, phone)" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const activationAmountCents = 25000; // R$250
      const reference = `AFF-ACT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const customerData: CustomerPayload = {
        name: customer.name,
        email: customer.email,
        document: customer.document.replace(/\D/g, ""),
        phone: customer.phone.replace(/\D/g, ""),
      };

      const pix = await createParadisePix({
        apiKey: OWNER_API_KEY,
        amount: activationAmountCents,
        description: "Ativação Conta Afiliado",
        reference,
        customer: customerData,
      });

      // Store as a purchase with special plan_id = null and a recognizable reference
      const { data: purchase, error: insertErr } = await supabase
        .from("purchases")
        .insert({
          plan_id: null,
          customer_name: customer.name,
          customer_email: customer.email,
          customer_document: customer.document.replace(/\D/g, ""),
          customer_phone: customer.phone.replace(/\D/g, ""),
          amount: activationAmountCents,
          status: "pending",
          paradise_transaction_id: String(pix.transaction_id),
          paradise_reference: reference,
          qr_code: pix.qr_code,
          qr_code_base64: pix.qr_code_base64,
          expires_at: pix.expires_at,
          affiliate_id: affId,
        })
        .select()
        .single();

      if (insertErr) {
        console.error("DB insert error:", insertErr);
        throw new Error("Erro ao salvar compra de ativação");
      }

      // Save the activation_purchase_id on the affiliate
      await supabase
        .from("affiliates")
        .update({ activation_purchase_id: purchase.id })
        .eq("id", affId);

      return new Response(
        JSON.stringify({
          purchase_id: purchase.id,
          qr_code: pix.qr_code,
          qr_code_base64: pix.qr_code_base64,
          amount: activationAmountCents,
          expires_at: pix.expires_at,
          split: false,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normal VIP purchase flow
    if (!plan_id || !customer?.name || !customer?.email || !customer?.document || !customer?.phone) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios: plan_id, customer (name, email, document, phone)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: plan, error: planErr } = await supabase
      .from("vip_plans")
      .select("*")
      .eq("id", plan_id)
      .eq("active", true)
      .single();

    if (planErr || !plan) {
      return new Response(JSON.stringify({ error: "Plano não encontrado ou inativo" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const totalAmountCents = Math.round(Number(plan.price) * 100);
    const reference = `VIP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    let affiliateData: { id: string; gateway_token: string | null; is_paid: boolean } | null = null;

    if (affiliate_id) {
      const { data: aff } = await supabase
        .from("affiliates")
        .select("id, gateway_token, is_paid")
        .eq("id", affiliate_id)
        .eq("status", "active")
        .single();

      // Only use affiliate gateway if they are paid and have a gateway
      if (aff && aff.is_paid && aff.gateway_token) {
        affiliateData = aff;
      }
    }

    const customerData: CustomerPayload = {
      name: customer.name,
      email: customer.email,
      document: customer.document.replace(/\D/g, ""),
      phone: customer.phone.replace(/\D/g, ""),
    };

    // If affiliate is paid and has gateway, 100% goes to their gateway
    // Otherwise, 100% goes to owner
    const apiKey = affiliateData?.gateway_token || OWNER_API_KEY;
    const description = affiliateData
      ? `Plano VIP ${plan.name} • Via Afiliado`
      : `Plano VIP ${plan.name}`;

    console.log(
      `Payment: total=${totalAmountCents}, affiliate=${affiliateData?.id || "none"}, gateway=${affiliateData ? "affiliate" : "owner"}`
    );

    const pix = await createParadisePix({
      apiKey,
      amount: totalAmountCents,
      description,
      reference,
      customer: customerData,
      productHash,
    });

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
        paradise_transaction_id: String(pix.transaction_id),
        paradise_reference: reference,
        qr_code: pix.qr_code,
        qr_code_base64: pix.qr_code_base64,
        expires_at: pix.expires_at,
        affiliate_id: affiliateData?.id || null,
      })
      .select()
      .single();

    if (insertErr) {
      console.error("DB insert error:", insertErr);
      throw new Error("Erro ao salvar compra");
    }

    await supabase.from("analytics").insert({ event_type: "purchase", metadata: { plan_id, plan_name: plan.name } });

    return new Response(
      JSON.stringify({
        purchase_id: purchase.id,
        qr_code: pix.qr_code,
        qr_code_base64: pix.qr_code_base64,
        amount: totalAmountCents,
        expires_at: pix.expires_at,
        split: false,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Erro interno";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
