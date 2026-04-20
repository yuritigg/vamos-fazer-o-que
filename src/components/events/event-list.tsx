"use client";

import { useMemo, useState } from "react";
import { EventCard } from "@/components/events/event-card";
import { EventFilters } from "@/components/events/event-filters";
import { RegionalEvent } from "@/types/event";

interface EventListProps {
  events: RegionalEvent[];
}

export function EventList({ events }: EventListProps) {
  const [selectedCategory, setSelectedCategory] = useState("todas");

  const filteredEvents = useMemo(() => {
    if (selectedCategory === "todas") return events;
    return events.filter((event) => event.category === selectedCategory);
  }, [events, selectedCategory]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Eventos em destaque</h2>
          <p className="text-sm text-muted-foreground">
            {filteredEvents.length} evento(s) encontrado(s)
          </p>
        </div>
        <EventFilters selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
