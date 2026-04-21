import { EventCard } from "@/components/events/event-card";
import { RegionalEvent } from "@/types/event";

interface EventListProps {
  events: RegionalEvent[];
}

export function EventList({ events }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-muted-foreground">Nenhum evento encontrado</p>
        <p className="mt-1 text-sm text-muted-foreground">Tente outros termos de busca ou remova os filtros</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
