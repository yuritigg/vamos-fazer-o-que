import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { EventList } from "@/components/events/event-list";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getApprovedEventsFromDb } from "@/lib/supabase/events";
import { cn } from "@/lib/utils";

interface HomePageProps {
  searchParams?: {
    erro?: string;
  };
}

function ErrorMessage({ code }: { code?: string }) {
  if (code !== "acesso-negado" && code !== "apenas-organizadores") return null;

  const config =
    code === "acesso-negado"
      ? {
          title: "Acesso negado",
          description:
            "Você não tem permissão para acessar esta área. Apenas administradores podem abrir o painel.",
        }
      : {
          title: "Área exclusiva para organizadores",
          description:
            "Para cadastrar eventos, sua conta precisa estar como organizador (ou administrador).",
        };

  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <CardContent className="space-y-3 p-4">
        <h2 className="text-lg font-semibold text-destructive">{config.title}</h2>
        <p className="text-sm text-muted-foreground">{config.description}</p>
        <Link href="/login" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
          Ir para login
        </Link>
      </CardContent>
    </Card>
  );
}

export default async function Home({ searchParams }: HomePageProps) {
  const events = await getApprovedEventsFromDb();

  return (
    <div className="container mx-auto space-y-12 px-4 py-10">
      <ErrorMessage code={searchParams?.erro} />

      <section className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-400/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-20 h-48 w-48 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="max-w-2xl space-y-4">
          <p className="text-sm font-medium text-sky-300">Portal de eventos regionais</p>
          <h1 className="text-4xl font-bold tracking-tight">Descubra tudo o que está rolando perto de você</h1>
          <p className="text-slate-200">
            O Vamos Fazer O Que? conecta pessoas aos melhores eventos regionais e ajuda organizadores a divulgar experiências incríveis.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/cadastro-evento"
              className={cn(buttonVariants(), "bg-sky-500 text-slate-950 hover:bg-sky-400")}
            >
              Publicar evento
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/admin"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "border-slate-400/60 bg-transparent text-white hover:bg-slate-700/60",
              )}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Painel administrativo
            </Link>
          </div>
        </div>
      </section>

      <EventList events={events} />
    </div>
  );
}
