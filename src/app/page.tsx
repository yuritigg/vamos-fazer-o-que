import Link from "next/link";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { EventList } from "@/components/events/event-list";
import { EventSearchFilters } from "@/components/events/event-search-filters";
import { buttonVariants } from "@/components/ui/button";
import { getApprovedEventsFromDb } from "@/lib/supabase/events";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams?: {
    erro?: string;
    q?: string;
    categoria?: string;
    sucesso?: string;
  };
}

function ErrorMessage({ code }: { code?: string }) {
  if (code !== "acesso-negado" && code !== "apenas-organizadores") return null;

  const config =
    code === "acesso-negado"
      ? {
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta área.",
        }
      : {
          title: "Área exclusiva para organizadores",
          description: "Para publicar eventos, sua conta precisa ser de organizador.",
        };

  return (
    <div className="mb-8 rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4">
      <p className="font-semibold text-destructive">{config.title}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{config.description}</p>
      <Link
        href="/login"
        className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-3")}
      >
        Ir para login
      </Link>
    </div>
  );
}

export default async function Home({ searchParams }: HomePageProps) {
  const q = searchParams?.q ?? "";
  const categoria = searchParams?.categoria ?? "";

  const events = await getApprovedEventsFromDb({
    category: categoria || undefined,
    q: q || undefined,
  });

  const isFiltered = Boolean(q || categoria);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border/50 px-4 pb-14 pt-16 md:pt-24">
        <div className="container mx-auto">
          <div className="max-w-2xl animate-fade-up">
            <p className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              <CalendarCheck className="h-3.5 w-3.5" />
              Portal de eventos regionais
            </p>
            <h1 className="text-balance text-5xl font-bold leading-[1.1] tracking-tight text-foreground md:text-6xl">
              Descubra o que está acontecendo perto de você
            </h1>
            <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-muted-foreground">
              Shows, feiras, esportes, teatro e muito mais. Conectamos você às melhores experiências da sua região.
            </p>
          </div>

          <div className="mt-10 animate-fade-up [animation-delay:80ms]">
            <EventSearchFilters currentQ={q} currentCategoria={categoria} />
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="container mx-auto px-4 py-12">
        <ErrorMessage code={searchParams?.erro} />

        {searchParams?.sucesso === "evento-enviado" && (
          <div className="mb-8 rounded-xl border border-emerald-500/30 bg-emerald-50 px-5 py-4">
            <p className="font-semibold text-emerald-700">Evento enviado para aprovação.</p>
            <p className="mt-0.5 text-sm text-emerald-600/80">
              Nossa equipe analisará as informações e você será notificado em breve.
            </p>
          </div>
        )}

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {isFiltered ? "Resultados da busca" : "Eventos em destaque"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {events.length === 0
                ? "Nenhum evento encontrado"
                : `${events.length} evento${events.length !== 1 ? "s" : ""}${isFiltered ? ` encontrado${events.length !== 1 ? "s" : ""}` : " disponíveis"}`}
            </p>
          </div>
          {!isFiltered && (
            <Link
              href="/cadastro-evento"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "hidden md:flex"
              )}
            >
              Publicar evento
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        <EventList events={events} />

        {/* CTA bottom — shown when no filters active */}
        {!isFiltered && events.length > 0 && (
          <div className="mt-16 rounded-2xl border border-border/60 bg-muted/30 px-8 py-10 text-center">
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              Você organiza eventos?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Cadastre-se como organizador e divulgue suas experiências para toda a região.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Link href="/cadastro" className={cn(buttonVariants())}>
                Criar conta de organizador
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "ghost" }), "text-muted-foreground")}
              >
                Já tenho conta
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
