import { notFound } from "next/navigation";
import Image from "next/image";
import {
  Building2,
  Calendar,
  Check,
  Home,
  ImageIcon,
  Link2,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Star,
  Sun,
  Ticket,
  Trophy,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommentForm, ReviewForm } from "@/components/forms/event-feedback-forms";
import { DeleteFeedbackButton } from "@/components/admin/delete-feedback-button";
import { getEventBySlugFromDb } from "@/lib/supabase/events";
import { getCurrentUserProfile } from "@/lib/supabase/authz";

export const dynamic = "force-dynamic";

interface EventDetailPageProps {
  params: { slug: string };
}

function formatPreco(preco: number | null) {
  if (preco == null) return "Gratuito";
  return `R$ ${preco.toFixed(2).replace(".", ",")}`;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const [event, { profile }] = await Promise.all([
    getEventBySlugFromDb(params.slug),
    getCurrentUserProfile(),
  ]);
  if (!event) {
    notFound();
  }
  const isAdmin = !!(profile?.is_admin || profile?.role === "admin");

  const hasExtraInfo =
    event.localNome || event.vinculo || event.preco !== null || event.outdoorIndoor ||
    event.modalidadeEsportiva || event.nivelCompetitivo;
  const hasServicos = event.servicos && event.servicos.length > 0;

  return (
    <div className="container mx-auto space-y-6 px-4 py-10">
      {/* Hero */}
      <section className="overflow-hidden rounded-xl border">
        <div className="relative h-72 w-full bg-slate-100">
          {event.imageUrl ? (
            <Image src={event.imageUrl} alt={event.title} fill sizes="100vw" className="object-cover" />
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
            {event.outdoorIndoor && (
              <Badge variant="secondary" className="capitalize">{event.outdoorIndoor}</Badge>
            )}
            {event.preco != null ? (
              <Badge variant="secondary">{formatPreco(event.preco)}</Badge>
            ) : (
              <Badge variant="secondary">Gratuito</Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <p className="text-muted-foreground">{event.description}</p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <p className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(event.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às{" "}
              {event.startTime}
            </p>
            {event.localNome && (
              <p className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {event.localNome}
              </p>
            )}
            <p className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {event.location.endereco}, {event.location.cidade} - {event.location.estado}
            </p>
          </div>
        </div>
      </section>

      {/* Mapa + Avaliação média */}
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

      {/* Informações adicionais + Serviços */}
      {(hasExtraInfo || hasServicos) && (
        <section className="grid gap-6 lg:grid-cols-2">
          {hasExtraInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {event.vinculo && (
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{event.vinculo}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{formatPreco(event.preco)}</span>
                </div>
                {event.outdoorIndoor && (
                  <div className="flex items-center gap-2">
                    {event.outdoorIndoor === "outdoor" ? (
                      <Sun className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <Home className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="capitalize">{event.outdoorIndoor}</span>
                  </div>
                )}
                {event.modalidadeEsportiva && (
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{event.modalidadeEsportiva}</span>
                    {event.nivelCompetitivo && (
                      <span className="text-muted-foreground">— {event.nivelCompetitivo}</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {hasServicos && (
            <Card>
              <CardHeader>
                <CardTitle>Serviços disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2">
                  {event.servicos!.map((servico) => (
                    <div key={servico} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{servico}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      )}

      {/* Avaliações + Comentários */}
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
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{review.author}</p>
                      <p className="text-xs text-muted-foreground">Nota: {review.rating}/5</p>
                    </div>
                    {isAdmin && (
                      <DeleteFeedbackButton type="review" itemId={review.id} eventSlug={event.slug} />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
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
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{comment.author}</p>
                    {isAdmin && (
                      <DeleteFeedbackButton type="comment" itemId={comment.id} eventSlug={event.slug} />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{comment.message}</p>
                </article>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
