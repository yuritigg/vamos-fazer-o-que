"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { UserRole } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleSignIn(role: UserRole) {
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setMessage(`Erro ao entrar: ${error.message}`);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from("users")
        .upsert({
          id: user.id,
          full_name: user.user_metadata.full_name ?? user.email ?? "Usuário",
          email: user.email,
          role,
        });
    }

    setMessage("Login realizado com sucesso.");
  }

  async function handleSignUp(role: UserRole) {
    setLoading(true);
    setMessage(null);

    const redirectBase = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${redirectBase}/api/auth/callback?role=${role}`,
        data: { full_name: fullName || email.split("@")[0], role },
      },
    });

    setLoading(false);
    setMessage(error ? `Erro no cadastro: ${error.message}` : "Cadastro realizado. Confira seu e-mail para confirmar.");
  }

  async function handleGoogle(role: UserRole) {
    const redirectBase = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${redirectBase}/api/auth/callback?role=${role}`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
  }

  return (
    <div className="container mx-auto max-w-xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Acesso ao sistema</CardTitle>
          <CardDescription>
            Entre ou crie conta como espectador ou organizador com Supabase Auth.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome</Label>
            <Input id="fullName" placeholder="Seu nome" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="voce@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <Tabs defaultValue="espectador">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="espectador">Espectador</TabsTrigger>
              <TabsTrigger value="organizador">Organizador</TabsTrigger>
            </TabsList>
            <TabsContent value="espectador" className="space-y-2">
              <AuthButtons loading={loading} onSignIn={() => handleSignIn("espectador")} onSignUp={() => handleSignUp("espectador")} onGoogle={() => handleGoogle("espectador")} />
            </TabsContent>
            <TabsContent value="organizador" className="space-y-2">
              <AuthButtons loading={loading} onSignIn={() => handleSignIn("organizador")} onSignUp={() => handleSignUp("organizador")} onGoogle={() => handleGoogle("organizador")} />
            </TabsContent>
          </Tabs>
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}

function AuthButtons({
  loading,
  onSignIn,
  onSignUp,
  onGoogle,
}: {
  loading: boolean;
  onSignIn: () => Promise<void>;
  onSignUp: () => Promise<void>;
  onGoogle: () => Promise<void>;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Button type="button" onClick={onSignIn} disabled={loading}>
        Entrar com e-mail e senha
      </Button>
      <Button type="button" variant="secondary" onClick={onSignUp} disabled={loading}>
        Criar conta
      </Button>
      <Button type="button" variant="outline" onClick={onGoogle} disabled={loading}>
        Entrar com Google
      </Button>
    </div>
  );
}
