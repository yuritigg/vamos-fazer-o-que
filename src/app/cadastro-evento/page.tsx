import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EventRegistrationForm } from "@/components/forms/event-registration-form";
import { getCurrentUserProfile } from "@/lib/supabase/authz";

export default async function EventRegistrationPage() {
  const { user, profile } = await getCurrentUserProfile();
  if (!user) {
    redirect("/login?next=/cadastro-evento");
  }

  const canAccess = Boolean(profile && (profile.role === "organizador" || profile.role === "admin" || profile.is_admin));
  if (!canAccess) {
    redirect("/?erro=apenas-organizadores");
  }

  return (
    <div className="container mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold">Cadastro de evento</h1>
        <p className="text-muted-foreground">
          Formulário base para organizadores. A imagem será enviada ao Cloudinary e o evento ficará pendente para aprovação.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo evento regional</CardTitle>
          <CardDescription>Preencha os dados para enviar para análise da equipe administrativa.</CardDescription>
        </CardHeader>
        <CardContent>
          <EventRegistrationForm />
        </CardContent>
      </Card>
    </div>
  );
}
