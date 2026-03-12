import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DUPLICATE_EMAIL_REGEX = /(already\s+been\s+registered|already\s+registered|already\s+exists|duplicate)/i;

const buildSlug = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);

const generateUniqueSlug = async (supabase: ReturnType<typeof createClient>, name: string) => {
  const base = buildSlug(name) || "afiliado";

  for (let i = 0; i < 8; i++) {
    const suffix = Math.random().toString(36).slice(2, 6);
    const slug = `${base}-${suffix}`;

    const { data, error } = await supabase
      .from("affiliates")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw new Error(`Erro ao validar slug: ${error.message}`);
    }

    if (!data) return slug;
  }

  throw new Error("Não foi possível gerar um slug único");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "").trim();
    const name = String(body?.name ?? "").trim();
    const phone = body?.phone ? String(body.phone).trim() : null;

    if (!email || !password || !name) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios: email, password, name" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let userId: string | null = null;
    let userAlreadyExists = false;

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      if (!DUPLICATE_EMAIL_REGEX.test(authError.message)) {
        return new Response(
          JSON.stringify({ error: authError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      userAlreadyExists = true;

      const { data: usersData, error: listUsersError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

      if (listUsersError) {
        return new Response(
          JSON.stringify({ error: `Erro ao localizar usuário existente: ${listUsersError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const existingUser = usersData.users.find((u) => (u.email ?? "").toLowerCase() === email);

      if (!existingUser) {
        return new Response(
          JSON.stringify({ success: true, already_exists: true, message: "Email já cadastrado. Faça login." }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      userId = existingUser.id;
    } else {
      userId = authData.user.id;
    }

    if (!userId) {
      throw new Error("Não foi possível determinar o usuário para afiliado");
    }

    const { data: existingAffiliate, error: existingAffiliateError } = await supabase
      .from("affiliates")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingAffiliateError) {
      return new Response(
        JSON.stringify({ error: `Erro ao verificar afiliado existente: ${existingAffiliateError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (existingAffiliate) {
      return new Response(
        JSON.stringify({ success: true, already_exists: true, message: "Esse email já possui conta de afiliado. Faça login." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const slug = await generateUniqueSlug(supabase, name);

    const { error: affError } = await supabase.from("affiliates").insert({
      user_id: userId,
      name,
      email,
      phone,
      slug,
    });

    if (affError) {
      if (!userAlreadyExists) {
        await supabase.auth.admin.deleteUser(userId);
      }

      return new Response(
        JSON.stringify({ error: `Erro ao criar perfil de afiliado: ${affError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        already_exists: false,
        message: userAlreadyExists
          ? "Conta de afiliado ativada para este email. Faça login."
          : "Conta criada! Verifique seu email para confirmar.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("create-affiliate error:", error);
    const message = error instanceof Error ? error.message : "Erro interno";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
