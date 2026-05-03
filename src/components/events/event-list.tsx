import { SearchX } from "lucide-react";
import { EventCard } from "@/components/events/event-card";
import { RegionalEvent } from "@/types/event";

interface EventListProps {
  events: RegionalEvent[];
}

export function EventList({ events }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <SearchX className="h-7 w-7 text-muted-foreground/50" />
        </div>
        <p className="text-base font-medium text-foreground">Nenhum evento encontrado</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tente outros termos de busca ou remova os filtros
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event, index) => (
        <div
          key={event.id}
          className={index === 0 && events.length > 1 ? "sm:col-span-2 lg:col-span-2" : ""}
        >
          <EventCard event={event} featured={index === 0} />
        </div>
      ))}
    </div>
  );
}
