"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AccountType = "usuario" | "organizador";
type OrgTipo = "juridica" | "fisica";

function maskCpf(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskCnpj(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 14);
  return d
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

function maskPhone(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

function validateCpf(cpf: string): boolean {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i);
  let rem = (sum * 10) % 11;
  if (rem === 10 || rem === 11) rem = 0;
  if (rem !== parseInt(d[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i);
  rem = (sum * 10) % 11;
  if (rem === 10 || rem === 11) rem = 0;
  return rem === parseInt(d[10]);
}

function validateCnpj(cnpj: string): boolean {
  const d = cnpj.replace(/\D/g, "");
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = w1.reduce((acc, w, i) => acc + parseInt(d[i]) * w, 0);
  let rem = sum % 11;
  const first = rem < 2 ? 0 : 11 - rem;
  if (first !== parseInt(d[12])) return false;
  sum = w2.reduce((acc, w, i) => acc + parseInt(d[i]) * w, 0);
  rem = sum % 11;
  const second = rem < 2 ? 0 : 11 - rem;
  return second === parseInt(d[13]);
}

export default function CadastroPage() {
  const [type, setType] = useState<AccountType>("usuario");
  const [orgTipo, setOrgTipo] = useState<OrgTipo>("juridica");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Usuário simples
  const [userName, setUserName] = useState("");

  // Pessoa Física
  const [pfNome, setPfNome] = useState("");
  const [pfCpf, setPfCpf] = useState("");
  const [pfNascimento, setPfNascimento] = useState("");
  const [pfEndereco, setPfEndereco] = useState("");
  const [pfTelefone, setPfTelefone] = useState("");

  // Pessoa Jurídica
  const [pjNome, setPjNome] = useState("");
  const [pjNomeFantasia, setPjNomeFantasia] = useState("");
  const [pjCnpj, setPjCnpj] = useState("");
  const [pjTelefone, setPjTelefone] = useState("");
  const [pjResponsavel, setPjResponsavel] = useState("");

  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  function handleTypeChange(next: AccountType) {
    setType(next);
    setMessage(null);
  }

  async function handleSignUp() {
    const isOrg = type === "organizador";

    if (!email || !password) {
      setMessage({ text: "Preencha todos os campos obrigatórios.", ok: false });
      return;
    }
    if (password.length < 6) {
      setMessage({ text: "A senha deve ter pelo menos 6 caracteres.", ok: false });
      return;
    }

    let metadata: Record<string, string> = {};

    if (!isOrg) {
      if (!userName) {
        setMessage({ text: "Preencha todos os campos obrigatórios.", ok: false });
        return;
      }
      metadata = { full_name: userName, role: "espectador" };
    } else if (orgTipo === "fisica") {
      if (!pfNome || !pfCpf || !pfNascimento || !pfTelefone) {
        setMessage({ text: "Preencha todos os campos obrigatórios.", ok: false });
        return;
      }
      if (!validateCpf(pfCpf)) {
        setMessage({ text: "CPF inválido. Verifique o número informado.", ok: false });
        return;
      }
      metadata = {
        full_name: pfNome,
        role: "organizador",
        tipo: "fisica",
        document: pfCpf.replace(/\D/g, ""),
        phone: pfTelefone.replace(/\D/g, ""),
        data_nascimento: pfNascimento,
        endereco: pfEndereco,
      };
    } else {
      if (!pjNome || !pjCnpj || !pjTelefone || !pjResponsavel) {
        setMessage({ text: "Preencha todos os campos obrigatórios.", ok: false });
        return;
      }
      if (!validateCnpj(pjCnpj)) {
        setMessage({ text: "CNPJ inválido. Verifique o número informado.", ok: false });
        return;
      }
      metadata = {
        full_name: pjNome,
        role: "organizador",
        tipo: "juridica",
        display_name: pjNome,
        document: pjCnpj.replace(/\D/g, ""),
        phone: pjTelefone.replace(/\D/g, ""),
        nome_fantasia: pjNomeFantasia,
        responsavel: pjResponsavel,
      };
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
        data: metadata,
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
    <div className="container mx-auto max-w-lg px-4 py-12">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Criar conta</CardTitle>
          <CardDescription>Escolha como deseja participar</CardDescription>

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

          {isOrg && (
            <div className="mt-3 flex gap-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="orgTipo"
                  value="juridica"
                  checked={orgTipo === "juridica"}
                  onChange={() => { setOrgTipo("juridica"); setMessage(null); }}
                  className="accent-blue-600"
                />
                Pessoa Jurídica
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="orgTipo"
                  value="fisica"
                  checked={orgTipo === "fisica"}
                  onChange={() => { setOrgTipo("fisica"); setMessage(null); }}
                  className="accent-blue-600"
                />
                Pessoa Física
              </label>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Usuário simples */}
          {!isOrg && (
            <div className="space-y-2">
              <Label htmlFor="userName">Nome *</Label>
              <Input
                id="userName"
                placeholder="Seu nome completo"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
          )}

          {/* Organizador — Pessoa Física */}
          {isOrg && orgTipo === "fisica" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="pfNome">Nome completo *</Label>
                <Input
                  id="pfNome"
                  placeholder="Seu nome completo"
                  value={pfNome}
                  onChange={(e) => setPfNome(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pfCpf">CPF *</Label>
                <Input
                  id="pfCpf"
                  placeholder="000.000.000-00"
                  value={pfCpf}
                  onChange={(e) => setPfCpf(maskCpf(e.target.value))}
                  maxLength={14}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pfNascimento">Data de nascimento *</Label>
                <Input
                  id="pfNascimento"
                  type="date"
                  value={pfNascimento}
                  onChange={(e) => setPfNascimento(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pfEndereco">Endereço completo</Label>
                <Input
                  id="pfEndereco"
                  placeholder="Rua, Número, Bairro, Cidade, Estado, CEP"
                  value={pfEndereco}
                  onChange={(e) => setPfEndereco(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pfTelefone">Telefone *</Label>
                <Input
                  id="pfTelefone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={pfTelefone}
                  onChange={(e) => setPfTelefone(maskPhone(e.target.value))}
                  maxLength={15}
                />
              </div>
            </>
          )}

          {/* Organizador — Pessoa Jurídica */}
          {isOrg && orgTipo === "juridica" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="pjNome">Nome da empresa *</Label>
                <Input
                  id="pjNome"
                  placeholder="Razão social"
                  value={pjNome}
                  onChange={(e) => setPjNome(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pjNomeFantasia">Nome fantasia</Label>
                <Input
                  id="pjNomeFantasia"
                  placeholder="Nome fantasia (opcional)"
                  value={pjNomeFantasia}
                  onChange={(e) => setPjNomeFantasia(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pjCnpj">CNPJ *</Label>
                <Input
                  id="pjCnpj"
                  placeholder="00.000.000/0000-00"
                  value={pjCnpj}
                  onChange={(e) => setPjCnpj(maskCnpj(e.target.value))}
                  maxLength={18}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pjTelefone">Telefone da empresa *</Label>
                <Input
                  id="pjTelefone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={pjTelefone}
                  onChange={(e) => setPjTelefone(maskPhone(e.target.value))}
                  maxLength={15}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pjResponsavel">Responsável pelo cadastro *</Label>
                <Input
                  id="pjResponsavel"
                  placeholder="Nome completo do responsável"
                  value={pjResponsavel}
                  onChange={(e) => setPjResponsavel(e.target.value)}
                />
              </div>
            </>
          )}

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
