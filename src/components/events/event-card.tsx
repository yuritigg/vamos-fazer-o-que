import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Star } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RegionalEvent } from "@/types/event";

interface EventCardProps {
  event: RegionalEvent;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Card className="overflow-hidden rounded-2xl border-slate-200/70 shadow-lg transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-52 w-full">
        <Image src={event.imageUrl} alt={event.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
      </div>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary">{event.category}</Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-4 w-4 text-yellow-500" />
            {event.averageRating > 0 ? event.averageRating.toFixed(1) : "Sem nota"}
          </span>
        </div>
        <CardTitle className="line-clamp-2">{event.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p className="line-clamp-2">{event.description}</p>
        <p className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {format(new Date(event.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {event.startTime}
        </p>
        <p className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {event.location.cidade} - {event.location.estado}
        </p>
      </CardContent>
      <CardFooter>
        <Link href={`/eventos/${event.slug}`} className="text-sm font-medium text-primary hover:underline">
          Ver detalhes
        </Link>
      </CardFooter>
    </Card>
  );
}
