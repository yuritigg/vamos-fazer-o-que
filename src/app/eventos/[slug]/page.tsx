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
  if (!event) notFound();

  const isAdmin = !!(profile?.is_admin || profile?.role === "admin");
  const hasExtraInfo =
    event.localNome || event.vinculo || event.preco !== null || event.outdoorIndoor ||
    event.modalidadeEsportiva || event.nivelCompetitivo;
  const hasServicos = event.servicos && event.servicos.length > 0;

  return (
    <div className="pb-20">
      {/* Hero image */}
      <div className="relative h-72 w-full bg-muted md:h-96">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-20 w-20 text-muted-foreground/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      <div className="container mx-auto px-4">
        {/* Title area — overlaps hero gradient */}
        <div className="-mt-8 space-y-4 pb-8 md:-mt-12">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="text-xs">{event.category}</Badge>
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <ShieldCheck className="h-3 w-3" />
              {event.ageRating}
            </Badge>
            {event.outdoorIndoor && (
              <Badge variant="secondary" className="capitalize text-xs">
                {event.outdoorIndoor}
              </Badge>
            )}
            {event.preco != null ? (
              <Badge variant="secondary" className="text-xs">
                {formatPreco(event.preco)}
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">Gratuito</Badge>
            )}
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {event.title}
          </h1>

          <p className="max-w-[65ch] text-base leading-relaxed text-muted-foreground">
            {event.description}
          </p>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary" />
              {format(new Date(event.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às{" "}
              {event.startTime}
            </span>
            {event.localNome && (
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-primary" />
                {event.localNome}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              {event.location.endereco}, {event.location.cidade} — {event.location.estado}
            </span>
          </div>
        </div>

        <div className="space-y-8">
          {/* Map + Rating */}
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="overflow-hidden rounded-2xl border border-border/60 lg:col-span-2">
              <div className="border-b border-border/50 px-5 py-3.5">
                <h2 className="text-sm font-semibold text-foreground">Localização</h2>
              </div>
              <iframe
                title="Mapa do evento"
                className="h-64 w-full"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${event.location.longitude - 0.01}%2C${event.location.latitude - 0.01}%2C${event.location.longitude + 0.01}%2C${event.location.latitude + 0.01}&layer=mapnik&marker=${event.location.latitude}%2C${event.location.longitude}`}
              />
            </div>

            <div className="rounded-2xl border border-border/60 p-5">
              <div className="mb-3 flex items-center gap-1.5">
                <Star className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Avaliação média</h2>
              </div>
              <p className="text-4xl font-bold tracking-tight text-foreground">
                {event.averageRating.toFixed(1)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Baseado em {event.reviews.length} avaliação{event.reviews.length !== 1 ? "ões" : ""}
              </p>

              {/* Visual stars */}
              <div className="mt-3 flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${
                      s <= Math.round(event.averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Extra info + Services */}
          {(hasExtraInfo || hasServicos) && (
            <div className="grid gap-5 lg:grid-cols-2">
              {hasExtraInfo && (
                <div className="rounded-2xl border border-border/60 p-5">
                  <h2 className="mb-4 text-sm font-semibold text-foreground">Informações</h2>
                  <ul className="space-y-2.5 text-sm">
                    {event.vinculo && (
                      <li className="flex items-center gap-2.5 text-muted-foreground">
                        <Link2 className="h-4 w-4 shrink-0 text-primary" />
                        <span>{event.vinculo}</span>
                      </li>
                    )}
                    <li className="flex items-center gap-2.5 text-muted-foreground">
                      <Ticket className="h-4 w-4 shrink-0 text-primary" />
                      <span>{formatPreco(event.preco)}</span>
                    </li>
                    {event.outdoorIndoor && (
                      <li className="flex items-center gap-2.5 text-muted-foreground">
                        {event.outdoorIndoor === "outdoor" ? (
                          <Sun className="h-4 w-4 shrink-0 text-primary" />
                        ) : (
                          <Home className="h-4 w-4 shrink-0 text-primary" />
                        )}
                        <span className="capitalize">{event.outdoorIndoor}</span>
                      </li>
                    )}
                    {event.modalidadeEsportiva && (
                      <li className="flex items-center gap-2.5 text-muted-foreground">
                        <Trophy className="h-4 w-4 shrink-0 text-primary" />
                        <span>
                          {event.modalidadeEsportiva}
                          {event.nivelCompetitivo && (
                            <span className="text-muted-foreground/70">
                              {" "}— {event.nivelCompetitivo}
                            </span>
                          )}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {hasServicos && (
                <div className="rounded-2xl border border-border/60 p-5">
                  <h2 className="mb-4 text-sm font-semibold text-foreground">
                    Serviços disponíveis
                  </h2>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {event.servicos!.map((servico) => (
                      <div key={servico} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                          <Check className="h-3 w-3 text-emerald-600" />
                        </div>
                        <span>{servico}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reviews + Comments */}
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Reviews */}
            <div className="rounded-2xl border border-border/60">
              <div className="border-b border-border/50 px-5 py-4">
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">Avaliações</h2>
                </div>
              </div>
              <div className="space-y-4 p-5">
                <ReviewForm eventId={event.id} eventSlug={event.slug} />
                {event.reviews.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    Seja o primeiro a avaliar este evento.
                  </p>
                ) : (
                  <div className="space-y-3 pt-1">
                    {event.reviews.map((review) => (
                      <article
                        key={review.id}
                        className="rounded-xl border border-border/50 bg-muted/20 p-3.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {review.author}
                            </p>
                            <div className="mt-0.5 flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`h-3 w-3 ${
                                    s <= review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-muted-foreground/30"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {isAdmin && (
                            <DeleteFeedbackButton
                              type="review"
                              itemId={review.id}
                              eventSlug={event.slug}
                            />
                          )}
                        </div>
                        {review.comment && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {review.comment}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Comments */}
            <div className="rounded-2xl border border-border/60">
              <div className="border-b border-border/50 px-5 py-4">
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">Comentários</h2>
                </div>
              </div>
              <div className="space-y-4 p-5">
                <CommentForm eventId={event.id} eventSlug={event.slug} />
                {event.comments.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    Nenhum comentário ainda. Seja o primeiro.
                  </p>
                ) : (
                  <div className="space-y-3 pt-1">
                    {event.comments.map((comment) => (
                      <article
                        key={comment.id}
                        className="rounded-xl border border-border/50 bg-muted/20 p-3.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">
                            {comment.author}
                          </p>
                          {isAdmin && (
                            <DeleteFeedbackButton
                              type="comment"
                              itemId={comment.id}
                              eventSlug={event.slug}
                            />
                          )}
                        </div>
                        <p className="mt-1.5 text-sm text-muted-foreground">
                          {comment.message}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
