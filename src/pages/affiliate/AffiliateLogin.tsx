import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserPlus } from "lucide-react";

const AffiliateLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") + "-" + Math.random().toString(36).substring(2, 6);
  };

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Check if user is an affiliate
    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("id")
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "")
      .maybeSingle();

    if (!affiliate) {
      await supabase.auth.signOut();
      toast({ title: "Acesso negado", description: "Essa conta não é de afiliado.", variant: "destructive" });
      setLoading(false);
      return;
    }

    navigate("/afiliado");
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      const res = await supabase.functions.invoke("create-affiliate", {
        body: { email: email.trim(), password, name: name.trim(), phone: phone.trim() || null },
      });

      if (res.error) throw new Error(res.error.message);
      const data = res.data;
      if (data.error) throw new Error(data.error);

      toast({ title: "Conta criada!", description: "Verifique seu email para confirmar o cadastro." });
      setIsLogin(true);
    } catch (err: unknown) {
      toast({ title: "Erro no cadastro", description: err instanceof Error ? err.message : "Tente novamente", variant: "destructive" });
    } finally {
      setLoading(false);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-3">
            {isLogin ? <LogIn className="w-5 h-5 text-primary" /> : <UserPlus className="w-5 h-5 text-primary" />}
          </div>
          <h1 className="text-2xl font-display text-foreground">
            {isLogin ? "PAINEL DO AFILIADO" : "CADASTRO DE AFILIADO"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isLogin ? "Entre na sua conta de afiliado" : "Crie sua conta e comece a vender"}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          {!isLogin && (
            <>
              <Input
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-secondary border-border text-sm h-10"
              />
              <Input
                placeholder="WhatsApp (opcional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-secondary border-border text-sm h-10"
              />
            </>
          )}
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-secondary border-border text-sm h-10"
          />
          <Input
            placeholder="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-secondary border-border text-sm h-10"
          />
          <Button
            onClick={isLogin ? handleLogin : handleSignup}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold h-10"
          >
            {loading ? "Aguarde..." : isLogin ? "Entrar" : "Criar Conta"}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          {isLogin ? "Não tem conta? " : "Já tem conta? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline"
          >
            {isLogin ? "Cadastre-se" : "Faça login"}
          </button>
        </p>

        <Link to="/" className="block text-center text-xs text-muted-foreground mt-3 hover:text-foreground">
          ← Voltar ao site
        </Link>
      </div>
    </div>
  );
};

export default AffiliateLogin;
