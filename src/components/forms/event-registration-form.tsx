"use client";

import { useFormState } from "react-dom";
import { createEventAction } from "@/lib/actions/events";
import { INITIAL_ACTION_RESULT } from "@/types/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EVENT_CATEGORIES } from "@/types/event";

export function EventRegistrationForm() {
  const [state, action] = useFormState(createEventAction, INITIAL_ACTION_RESULT);

  return (
    <form action={action} className="grid gap-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input id="title" name="title" placeholder="Ex: Festival de Inverno" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoria</Label>
        <select
          id="category"
          name="category"
          required
          defaultValue=""
          className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="" disabled>
            Selecione uma categoria
          </option>
          {EVENT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="eventDate">Data</Label>
          <Input id="eventDate" name="eventDate" type="date" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startTime">Horário</Label>
          <Input id="startTime" name="startTime" type="time" required />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city">Cidade</Label>
          <Input id="city" name="city" placeholder="Ex: Caruaru" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">Estado (UF)</Label>
          <Input id="state" name="state" placeholder="PE" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Endereço</Label>
        <Input id="address" name="address" placeholder="Rua, número e bairro" required />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input id="latitude" name="latitude" type="number" step="0.0000001" placeholder="-8.05389" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input id="longitude" name="longitude" type="number" step="0.0000001" placeholder="-34.88111" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          rows={5}
          placeholder="Detalhes do evento, atrações e informações úteis."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Imagem de capa</Label>
        <Input id="image" name="image" type="file" accept="image/*" />
      </div>

      <SubmitButton pendingText="Enviando evento...">Enviar para aprovação</SubmitButton>
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-emerald-600" : "text-destructive"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
