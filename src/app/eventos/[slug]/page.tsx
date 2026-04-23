import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, ImageIcon, MapPin, MessageCircle, ShieldCheck, Star } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommentForm, ReviewForm } from "@/components/forms/event-feedback-forms";
import { getEventBySlugFromDb } from "@/lib/supabase/events";

interface EventDetailPageProps {
  params: { slug: string };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const event = await getEventBySlugFromDb(params.slug);
  if (!event) {
    notFound();
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-10">
      <section className="overflow-hidden rounded-xl border">
        <div className="relative h-72 w-full bg-slate-100">
          {event.imageUrl ? (
            <Image src={event.imageUrl} alt={event.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageIcon className="h-16 w-16 text-slate-300" />
            </div>
          )}
        </div>
        <div className="space-y-4 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{event.category}</Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              {event.ageRating}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <p className="text-muted-foreground">{event.description}</p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <p className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(event.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às{" "}
              {event.startTime}
            </p>
            <p className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {event.location.endereco}, {event.location.cidade} - {event.location.estado}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Localização</CardTitle>
          </CardHeader>
          <CardContent>
            <iframe
              title="Mapa do evento"
              className="h-72 w-full rounded-md border"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${event.location.longitude - 0.01}%2C${event.location.latitude - 0.01}%2C${event.location.longitude + 0.01}%2C${event.location.latitude + 0.01}&layer=mapnik&marker=${event.location.latitude}%2C${event.location.longitude}`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" /> Avaliação média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{event.averageRating.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">
              Baseado em {event.reviews.length} avaliação(ões)
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Avaliações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ReviewForm eventId={event.id} eventSlug={event.slug} />
            {event.reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem avaliações até o momento.</p>
            ) : (
              event.reviews.map((review) => (
                <article key={review.id} className="rounded-md border p-3">
                  <p className="text-sm font-medium">{review.author}</p>
                  <p className="text-xs text-muted-foreground">Nota: {review.rating}/5</p>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </article>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Comentários
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <CommentForm eventId={event.id} eventSlug={event.slug} />
            {event.comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem comentários até agora.</p>
            ) : (
              event.comments.map((comment) => (
                <article key={comment.id} className="rounded-md border p-3">
                  <p className="text-sm font-medium">{comment.author}</p>
                  <p className="text-sm text-muted-foreground">{comment.message}</p>
                </article>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
