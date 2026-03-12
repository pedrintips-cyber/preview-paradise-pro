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
    const PARADISE_API_KEY = Deno.env.get("PARADISE_API_KEY");
    if (!PARADISE_API_KEY) {
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

    const amountCents = Math.round(Number(plan.price) * 100);
    const reference = `VIP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Create transaction on Paradise
    const paradiseBody: Record<string, unknown> = {
      amount: amountCents,
      description: `Plano VIP ${plan.name}`,
      reference,
      customer: {
        name: customer.name,
        email: customer.email,
        document: customer.document.replace(/\D/g, ""),
        phone: customer.phone.replace(/\D/g, ""),
      },
    };

    if (productHash) {
      paradiseBody.productHash = productHash;
    } else {
      paradiseBody.source = "api_externa";
    }

    const paradiseRes = await fetch(PARADISE_API_URL, {
      method: "POST",
      headers: {
        "X-API-Key": PARADISE_API_KEY,
        "Content-Type": "application/json",
      },
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

    // Save purchase in DB
    const { data: purchase, error: insertErr } = await supabase
      .from("purchases")
      .insert({
        plan_id,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_document: customer.document.replace(/\D/g, ""),
        customer_phone: customer.phone.replace(/\D/g, ""),
        amount: amountCents,
        status: "pending",
        paradise_transaction_id: String(paradiseData.transaction_id),
        paradise_reference: reference,
        qr_code: paradiseData.qr_code,
        qr_code_base64: paradiseData.qr_code_base64,
        expires_at: paradiseData.expires_at,
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
        qr_code: paradiseData.qr_code,
        qr_code_base64: paradiseData.qr_code_base64,
        amount: amountCents,
        expires_at: paradiseData.expires_at,
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
