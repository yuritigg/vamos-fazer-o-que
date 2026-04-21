"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CadastroPage() {
  return (
    <div className="container mx-auto max-w-lg px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Criar conta</h1>
        <p className="mt-2 text-muted-foreground">Escolha como deseja participar</p>
      </div>

      <Tabs defaultValue="espectador">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="espectador">Sou espectador</TabsTrigger>
          <TabsTrigger value="organizador">Sou organizador</TabsTrigger>
        </TabsList>

        <TabsContent value="espectador">
          <EspectadorForm />
        </TabsContent>

        <TabsContent value="organizador">
          <OrganizadorForm />
        </TabsContent>
      </Tabs>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}

function EspectadorForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSignUp() {
    if (!name || !email || !password) {
      setMessage({ text: "Preencha todos os campos.", ok: false });
      return;
    }
    setLoading(true);
    setMessage(null);
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${base}/api/auth/callback?role=espectador`,
        data: { full_name: name, role: "espectador" },
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
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${base}/api/auth/callback?role=espectador`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Cadastro de espectador</CardTitle>
        <CardDescription>Descubra e acompanhe eventos na sua região</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="esp-name">Nome *</Label>
          <Input id="esp-name" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="esp-email">E-mail *</Label>
          <Input id="esp-email" type="email" placeholder="voce@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="esp-password">Senha *</Label>
          <Input id="esp-password" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button className="w-full" onClick={handleSignUp} disabled={loading}>
          {loading ? "Criando conta..." : "Criar conta"}
        </Button>
        <Separator />
        <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>
          Continuar com Google
        </Button>
        {message && (
          <p className={`text-center text-sm ${message.ok ? "text-emerald-600" : "text-destructive"}`}>
            {message.text}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function OrganizadorForm() {
  const [responsibleName, setResponsibleName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [document, setDocument] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSignUp() {
    if (!responsibleName || !companyName || !document || !phone || !email || !password) {
      setMessage({ text: "Preencha todos os campos obrigatórios.", ok: false });
      return;
    }
    setLoading(true);
    setMessage(null);
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${base}/api/auth/callback?role=organizador`,
        data: {
          full_name: responsibleName,
          role: "organizador",
          display_name: companyName,
          document,
          phone,
        },
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
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${base}/api/auth/callback?role=organizador`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Cadastro de organizador</CardTitle>
        <CardDescription>Publique e gerencie eventos na sua região</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="org-responsible">Nome do responsável *</Label>
          <Input id="org-responsible" placeholder="Nome completo" value={responsibleName} onChange={(e) => setResponsibleName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="org-company">Nome da empresa / organização *</Label>
          <Input id="org-company" placeholder="Ex: Associação Cultural XYZ" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="org-document">CPF ou CNPJ *</Label>
            <Input id="org-document" placeholder="000.000.000-00" value={document} onChange={(e) => setDocument(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-phone">Telefone *</Label>
            <Input id="org-phone" type="tel" placeholder="(00) 00000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="org-email">E-mail *</Label>
          <Input id="org-email" type="email" placeholder="contato@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="org-password">Senha *</Label>
          <Input id="org-password" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button className="w-full" onClick={handleSignUp} disabled={loading}>
          {loading ? "Criando conta..." : "Criar conta"}
        </Button>
        <Separator />
        <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>
          Continuar com Google
        </Button>
        {message && (
          <p className={`text-center text-sm ${message.ok ? "text-emerald-600" : "text-destructive"}`}>
            {message.text}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Separator() {
  return (
    <div className="relative flex items-center gap-2">
      <div className="flex-1 border-t" />
      <span className="text-xs text-muted-foreground">ou</span>
      <div className="flex-1 border-t" />
    </div>
  );
}
