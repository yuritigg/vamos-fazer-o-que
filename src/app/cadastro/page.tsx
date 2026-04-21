"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AccountType = "usuario" | "organizador";

export default function CadastroPage() {
  const [type, setType] = useState<AccountType>("usuario");

  // Campos comuns
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Campos exclusivos do organizador
  const [companyName, setCompanyName] = useState("");
  const [document, setDocument] = useState("");
  const [phone, setPhone] = useState("");

  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  function handleTypeChange(next: AccountType) {
    setType(next);
    setMessage(null);
  }

  async function handleSignUp() {
    const isOrg = type === "organizador";

    if (!name || !email || !password) {
      setMessage({ text: "Preencha todos os campos obrigatórios.", ok: false });
      return;
    }
    if (isOrg && (!companyName || !document || !phone)) {
      setMessage({ text: "Preencha todos os campos obrigatórios.", ok: false });
      return;
    }

    setLoading(true);
    setMessage(null);

    const base = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const role = isOrg ? "organizador" : "espectador";

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${base}/api/auth/callback?role=${role}`,
        data: isOrg
          ? { full_name: name, role, display_name: companyName, document, phone }
          : { full_name: name, role },
      },
    });

    setLoading(false);
    setMessage(
      error
        ? { text: "Erro ao criar conta: " + error.message, ok: false }
        : { text: "Conta criada! Verifique seu e-mail para confirmar o cadastro.", ok: true },
    );
  }

  async function handleGoogle() {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const role = type === "organizador" ? "organizador" : "espectador";
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${base}/api/auth/callback?role=${role}`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
  }

  const isOrg = type === "organizador";

  return (
    <div className="container mx-auto max-w-md px-4 py-12">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Criar conta</CardTitle>
          <CardDescription>Escolha como deseja participar</CardDescription>

          {/* Seletor de tipo */}
          <div className="mt-2 flex rounded-lg border p-1">
            <button
              type="button"
              onClick={() => handleTypeChange("usuario")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                type === "usuario"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Usuário
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("organizador")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                type === "organizador"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Organizador
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Campo: Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">{isOrg ? "Nome do responsável *" : "Nome *"}</Label>
            <Input
              id="name"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Campos exclusivos do organizador */}
          {isOrg && (
            <>
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da empresa / organização *</Label>
                <Input
                  id="companyName"
                  placeholder="Ex: Associação Cultural XYZ"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="document">CPF ou CNPJ *</Label>
                <Input
                  id="document"
                  placeholder="000.000.000-00"
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </>
          )}

          {/* E-mail */}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              placeholder={isOrg ? "contato@empresa.com" : "voce@exemplo.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <Label htmlFor="password">Senha *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button className="w-full" onClick={handleSignUp} disabled={loading}>
            {loading ? "Criando conta..." : "Criar conta"}
          </Button>

          <div className="relative flex items-center gap-2">
            <div className="flex-1 border-t" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="flex-1 border-t" />
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>
            Continuar com Google
          </Button>

          {message && (
            <p className={`text-center text-sm ${message.ok ? "text-emerald-600" : "text-destructive"}`}>
              {message.text}
            </p>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
