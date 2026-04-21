import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModerationActions } from "@/components/admin/moderation-actions";
import { EventDetailsModal } from "@/components/admin/event-details-modal";
import { DeleteEventButton } from "@/components/admin/delete-event-button";
import { getAdminEventsFromDb, AdminEvent } from "@/lib/supabase/events";

const STATUS_LABELS: Record<AdminEvent["status"], string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  reprovado: "Reprovado",
};

const STATUS_BADGE_VARIANTS: Record<AdminEvent["status"], "default" | "outline" | "secondary" | "destructive"> = {
  pendente: "secondary",
  aprovado: "default",
  reprovado: "destructive",
};

function EventCard({ event }: { event: AdminEvent }) {
  return (
    <article className="flex flex-col gap-3 rounded-md border p-3 md:flex-row md:items-start md:justify-between">
      <div className="space-y-1">
        <p className="font-medium">{event.title}</p>
        <p className="text-sm text-muted-foreground">{event.organizerName}</p>
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline">{event.category}</Badge>
          <Badge variant={STATUS_BADGE_VARIANTS[event.status]}>
            {STATUS_LABELS[event.status]}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {new Date(event.event_date + "T00:00:00").toLocaleDateString("pt-BR")} às {event.start_time}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <EventDetailsModal event={event} />
        {event.status === "pendente" && <ModerationActions eventId={event.id} />}
        <DeleteEventButton eventId={event.id} />
      </div>
    </article>
  );
}

function EventSection({ title, events }: { title: string; events: AdminEvent[] }) {
  if (events.length === 0) return null;
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</h3>
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

export async function ApprovalTable() {
  const events = await getAdminEventsFromDb();

  const pending = events.filter((e) => e.status === "pendente");
  const approved = events.filter((e) => e.status === "aprovado");
  const rejected = events.filter((e) => e.status === "reprovado");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todos os eventos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum evento cadastrado.</p>
        ) : (
          <>
            <EventSection title={`Pendentes (${pending.length})`} events={pending} />
            <EventSection title={`Aprovados (${approved.length})`} events={approved} />
            <EventSection title={`Reprovados (${rejected.length})`} events={rejected} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
