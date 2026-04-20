import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModerationActions } from "@/components/admin/moderation-actions";
import { getPendingEventsFromDb } from "@/lib/supabase/events";

export async function ApprovalTable() {
  const pendingEvents = await getPendingEventsFromDb();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Eventos pendentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pendingEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">Não há eventos pendentes no momento.</p>
        ) : (
          pendingEvents.map((event) => (
            // Supabase can return relation as array in nested select.
            <article key={event.id} className="flex flex-col gap-3 rounded-md border p-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-muted-foreground">
                  {Array.isArray(event.organizers)
                    ? event.organizers[0]?.display_name ??
                      event.organizers[0]?.users?.[0]?.full_name ??
                      "Organizador"
                    : "Organizador"}
                </p>
                <Badge variant="outline">{event.category}</Badge>
              </div>
              <ModerationActions eventId={event.id} />
            </article>
          ))
        )}
      </CardContent>
    </Card>
  );
}
