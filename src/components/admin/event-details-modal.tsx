"use client";

import Image from "next/image";
import { Eye } from "lucide-react";
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

export function EventDetailsModal({ event }: { event: AdminEvent }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Eye className="mr-1 h-4 w-4" />
        Ver detalhes
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>

        {event.cover_image_url && (
          <div className="relative h-48 w-full overflow-hidden rounded-lg">
            <Image
              src={event.cover_image_url}
              alt={event.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{event.category}</Badge>
            <Badge variant="outline">{event.age_rating ?? "Livre"}</Badge>
          </div>

          <div>
            <p className="font-medium text-muted-foreground">Organizador</p>
            <p>{event.organizerName}</p>
          </div>

          <div>
            <p className="font-medium text-muted-foreground">Data e horário</p>
            <p>
              {formatDate(event.event_date)} às {event.start_time}
            </p>
          </div>

          <div>
            <p className="font-medium text-muted-foreground">Endereço</p>
            <p>
              {event.address}
              {event.address && ", "}
              {event.city} — {event.state}
            </p>
          </div>

          <div>
            <p className="font-medium text-muted-foreground">Descrição</p>
            <p className="whitespace-pre-wrap">{event.description}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
