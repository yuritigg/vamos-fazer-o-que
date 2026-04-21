"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { createEventAction } from "@/lib/actions/events";
import { INITIAL_ACTION_RESULT } from "@/types/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AGE_RATINGS, EVENT_CATEGORIES } from "@/types/event";

export function EventRegistrationForm() {
  const [state, action] = useFormState(createEventAction, INITIAL_ACTION_RESULT);

  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [stateUf, setStateUf] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [cepStatus, setCepStatus] = useState<"idle" | "loading" | "error">("idle");

  async function fetchViaCep(value: string) {
    const cleaned = value.replace(/\D/g, "");
    setCep(cleaned);
    setCepStatus("idle");

    if (cleaned.length !== 8) return;

    setCepStatus("loading");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepStatus("error");
      } else {
        const s = data.logradouro ?? "";
        const n = data.bairro ?? "";
        const c = data.localidade ?? "";
        const u = data.uf ?? "";
        setStreet(s);
        setNeighborhood(n);
        setCity(c);
        setStateUf(u);
        setCepStatus("idle");
        await geocodeAddress(s, c, u);
      }
    } catch {
      setCepStatus("error");
    }
  }

  async function geocodeAddress(streetVal?: string, cityVal?: string, ufVal?: string) {
    const q = [streetVal ?? street, cityVal ?? city, ufVal ?? stateUf, "Brasil"]
      .filter(Boolean)
      .join(", ");
    if (!q.trim()) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
        { headers: { "User-Agent": "VamosFazerOQue/1.0" } },
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setLat(String(data[0].lat));
        setLng(String(data[0].lon));
      }
    } catch {
      // geocoding é melhor-esforço; silencia erros de rede
    }
  }

  return (
    <form action={action} className="grid gap-5">

      {/* Título */}
      <div className="space-y-2">
        <Label htmlFor="title">Título do evento *</Label>
        <Input id="title" name="title" placeholder="Ex: Festival de Inverno 2025" required />
      </div>

      {/* Categoria + Faixa etária */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Categoria *</Label>
          <select
            id="category"
            name="category"
            required
            defaultValue=""
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="" disabled>
              Selecione
            </option>
            {EVENT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ageRating">Faixa etária *</Label>
          <select
            id="ageRating"
            name="ageRating"
            required
            defaultValue="Livre"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {AGE_RATINGS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data + Horário */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="eventDate">Data *</Label>
          <Input id="eventDate" name="eventDate" type="date" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startTime">Horário de início *</Label>
          <Input id="startTime" name="startTime" type="time" required />
        </div>
      </div>

      {/* Localização */}
      <fieldset className="space-y-4 rounded-lg border p-4">
        <legend className="px-1 text-sm font-medium">Localização do evento</legend>

        <div className="space-y-2">
          <Label htmlFor="cep">CEP *</Label>
          <div className="flex items-center gap-3">
            <Input
              id="cep"
              name="cep"
              placeholder="00000-000"
              value={cep}
              onChange={(e) => fetchViaCep(e.target.value)}
              maxLength={9}
              className="max-w-[160px]"
            />
            {cepStatus === "loading" && (
              <span className="text-xs text-muted-foreground">Buscando endereço...</span>
            )}
            {cepStatus === "error" && (
              <span className="text-xs text-destructive">CEP não encontrado.</span>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="street">Rua / Avenida *</Label>
            <Input
              id="street"
              name="street"
              placeholder="Nome da rua"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="number">Número *</Label>
            <Input
              id="number"
              name="number"
              placeholder="Ex: 123"
              required
              onBlur={() => geocodeAddress()}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="complement">Complemento</Label>
            <Input id="complement" name="complement" placeholder="Apto, sala, bloco..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro *</Label>
            <Input
              id="neighborhood"
              name="neighborhood"
              placeholder="Nome do bairro"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="city">Cidade *</Label>
            <Input
              id="city"
              name="city"
              placeholder="Nome da cidade"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">Estado (UF) *</Label>
            <Input
              id="state"
              name="state"
              placeholder="PE"
              value={stateUf}
              onChange={(e) => setStateUf(e.target.value)}
              maxLength={2}
              required
            />
          </div>
        </div>

        {lat && lng && (
          <p className="text-xs text-emerald-600">✓ Coordenadas identificadas automaticamente</p>
        )}
        <input type="hidden" name="latitude" value={lat} />
        <input type="hidden" name="longitude" value={lng} />
      </fieldset>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="description">Descrição *</Label>
        <Textarea
          id="description"
          name="description"
          rows={5}
          placeholder="Detalhes do evento, atrações, informações úteis para o público..."
          required
        />
      </div>

      {/* Imagem */}
      <div className="space-y-2">
        <Label htmlFor="image">Imagem de capa</Label>
        <Input id="image" name="image" type="file" accept="image/*" />
        <p className="text-xs text-muted-foreground">Formatos aceitos: JPG, PNG, WEBP. Tamanho máximo: 5 MB.</p>
      </div>

      <SubmitButton pendingText="Enviando evento...">Enviar para aprovação</SubmitButton>

      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-emerald-600" : "text-destructive"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
