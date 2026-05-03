import Image from "next/image";
import Link from "next/link";
import { Calendar, ImageIcon, MapPin, Star } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { RegionalEvent } from "@/types/event";

interface EventCardProps {
  event: RegionalEvent;
  featured?: boolean;
}

export function EventCard({ event, featured = false }: EventCardProps) {
  return (
    <Link
      href={`/eventos/${event.slug}`}
      className="card-lift group block overflow-hidden rounded-2xl border border-border/60 bg-card"
    >
      {/* Image */}
      <div className={cn("relative w-full bg-muted", featured ? "h-64 md:h-72" : "h-48")}>
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            sizes={
              featured
                ? "(max-width: 768px) 100vw, 66vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
            className="card-image object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}

        {/* Badges overlaid on image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
            {event.category}
          </span>
          {event.averageRating > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-foreground/80 px-2.5 py-1 text-xs font-medium text-background backdrop-blur-sm">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {event.averageRating.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3
          className={cn(
            "line-clamp-2 font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary",
            featured ? "text-lg" : "text-base"
          )}
        >
          {event.title}
        </h3>

        <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>
              {format(new Date(event.date), "dd 'de' MMMM", { locale: ptBR })} às{" "}
              {event.startTime}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>
              {event.location.cidade}, {event.location.estado}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
