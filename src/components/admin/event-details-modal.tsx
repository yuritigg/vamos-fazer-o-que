"use client";

import Image from "next/image";
import { Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AdminEvent } from "@/lib/supabase/events";

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatPreco(preco: number | null) {
  if (preco == null) return "Gratuito";
  return `R$ ${preco.toFixed(2).replace(".", ",")}`;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm text-foreground">{value}</p>
    </div>
  );
}

export function EventDetailsModal({ event }: { event: AdminEvent }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Eye className="mr-1.5 h-3.5 w-3.5" />
        Ver detalhes
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="pr-6 text-base">{event.title}</DialogTitle>
        </DialogHeader>

        {event.cover_image_url && (
          <div className="relative h-44 w-full overflow-hidden rounded-xl">
            <Image
              src={event.cover_image_url}
              alt={event.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-xs">{event.category}</Badge>
            <Badge variant="outline" className="text-xs">{event.age_rating ?? "Livre"}</Badge>
            {event.outdoor_indoor && (
              <Badge variant="secondary" className="capitalize text-xs">
                {event.outdoor_indoor}
              </Badge>
            )}
          </div>

          {/* Fields grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Organizador" value={event.organizerName} />
            <Field
              label="Data e horário"
              value={`${formatDate(event.event_date)} às ${event.start_time}`}
            />
            {event.local_nome && (
              <Field label="Local" value={event.local_nome} />
            )}
            <Field
              label="Endereço"
              value={[event.address, event.city, event.state].filter(Boolean).join(", ")}
            />
            {event.vinculo && <Field label="Vínculo" value={event.vinculo} />}
            <Field label="Ingresso" value={formatPreco(event.preco)} />
            {event.modalidade_esportiva && (
              <Field
                label="Modalidade esportiva"
                value={
                  event.nivel_competitivo
                    ? `${event.modalidade_esportiva} — ${event.nivel_competitivo}`
                    : event.modalidade_esportiva
                }
              />
            )}
          </div>

          {/* Services */}
          {event.servicos && event.servicos.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Serviços
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {event.servicos.map((s) => (
                  <span key={s} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-emerald-500" />
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Descrição
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {event.description}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
