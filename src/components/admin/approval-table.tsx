import { Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ModerationActions } from "@/components/admin/moderation-actions";
import { EventDetailsModal } from "@/components/admin/event-details-modal";
import { DeleteEventButton } from "@/components/admin/delete-event-button";
import { getAdminEventsFromDb, AdminEvent } from "@/lib/supabase/events";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  AdminEvent["status"],
  { label: string; className: string }
> = {
  pendente: {
    label: "Pendente",
    className: "border-amber-300/60 bg-amber-50 text-amber-700",
  },
  aprovado: {
    label: "Aprovado",
    className: "border-emerald-300/60 bg-emerald-50 text-emerald-700",
  },
  reprovado: {
    label: "Reprovado",
    className: "border-red-300/60 bg-red-50 text-red-700",
  },
};

const SECTION_CONFIG: Record<
  AdminEvent["status"],
  { dot: string; heading: string }
> = {
  pendente: { dot: "bg-amber-400", heading: "text-amber-700" },
  aprovado: { dot: "bg-emerald-500", heading: "text-emerald-700" },
  reprovado: { dot: "bg-red-400", heading: "text-red-600" },
};

function EventRow({ event }: { event: AdminEvent }) {
  const statusCfg = STATUS_CONFIG[event.status];

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-border md:flex-row md:items-start md:justify-between">
      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{event.title}</p>
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs font-medium",
              statusCfg.className
            )}
          >
            {statusCfg.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{event.organizerName}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {event.category}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(event.event_date + "T00:00:00").toLocaleDateString("pt-BR")} às{" "}
            {event.start_time}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <EventDetailsModal event={event} />
        {event.status === "pendente" && <ModerationActions eventId={event.id} />}
        <DeleteEventButton eventId={event.id} />
      </div>
    </article>
  );
}

function EventSection({
  title,
  status,
  events,
}: {
  title: string;
  status: AdminEvent["status"];
  events: AdminEvent[];
}) {
  if (events.length === 0) return null;

  const cfg = SECTION_CONFIG[status];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={cn("h-2 w-2 rounded-full", cfg.dot)} />
        <h3 className={cn("text-xs font-semibold uppercase tracking-[0.1em]", cfg.heading)}>
          {title} ({events.length})
        </h3>
      </div>
      <div className="space-y-2.5">
        {events.map((event) => (
          <EventRow key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}

export async function ApprovalTable() {
  const events = await getAdminEventsFromDb();

  const pending = events.filter((e) => e.status === "pendente");
  const approved = events.filter((e) => e.status === "aprovado");
  const rejected = events.filter((e) => e.status === "reprovado");

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 py-24 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <Inbox className="h-7 w-7 text-muted-foreground/50" />
        </div>
        <p className="text-base font-medium text-foreground">Nenhum evento cadastrado</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Quando organizadores enviarem eventos, eles aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pendentes", count: pending.length, color: "text-amber-600", bg: "bg-amber-50 border-amber-200/60" },
          { label: "Aprovados", count: approved.length, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200/60" },
          { label: "Reprovados", count: rejected.length, color: "text-red-600", bg: "bg-red-50 border-red-200/60" },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={cn("rounded-xl border p-4", bg)}>
            <p className={cn("text-2xl font-bold", color)}>{count}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Event sections */}
      <EventSection title="Pendentes" status="pendente" events={pending} />
      <EventSection title="Aprovados" status="aprovado" events={approved} />
      <EventSection title="Reprovados" status="reprovado" events={rejected} />
    </div>
  );
}
