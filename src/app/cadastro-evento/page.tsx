import { redirect } from "next/navigation";
import { CalendarPlus } from "lucide-react";
import { EventRegistrationForm } from "@/components/forms/event-registration-form";
import { getCurrentUserProfile } from "@/lib/supabase/authz";

export default async function EventRegistrationPage() {
  const { user, profile } = await getCurrentUserProfile();
  if (!user) redirect("/login?next=/cadastro-evento");

  const canAccess = Boolean(
    profile && (profile.role === "organizador" || profile.role === "admin" || profile.is_admin)
  );
  if (!canAccess) redirect("/?erro=apenas-organizadores");

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      {/* Page header */}
      <div className="mb-10 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary">
          <CalendarPlus className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Cadastro de evento
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Preencha os dados do seu evento. Após análise da nossa equipe, ele será publicado na plataforma.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 md:p-8">
        <div className="mb-6 border-b border-border/50 pb-4">
          <h2 className="text-base font-semibold text-foreground">Novo evento</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Todos os campos marcados com * são obrigatórios.
          </p>
        </div>
        <EventRegistrationForm />
      </div>
    </div>
  );
}
