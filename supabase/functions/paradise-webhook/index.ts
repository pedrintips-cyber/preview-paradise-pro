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

    const { external_id, status, transaction_id } = payload;

    if (!external_id && !transaction_id) {
      return new Response(
        JSON.stringify({ error: "Missing external_id or transaction_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find purchase by reference or transaction_id
    let query = supabase.from("purchases").update({ 
      status, 
      updated_at: new Date().toISOString() 
    });

    if (external_id) {
      query = query.eq("paradise_reference", external_id);
    } else {
      query = query.eq("paradise_transaction_id", String(transaction_id));
    }

    const { error } = await query;

    if (error) {
      console.error("Error updating purchase:", error);
      return new Response(
        JSON.stringify({ error: "Failed to update purchase" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Purchase updated: ${external_id || transaction_id} -> ${status}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
