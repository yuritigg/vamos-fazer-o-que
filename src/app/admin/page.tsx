import { redirect } from "next/navigation";
import { ApprovalTable } from "@/components/admin/approval-table";
import { getCurrentUserProfile } from "@/lib/supabase/authz";

export default async function AdminPage() {
  const { user, profile } = await getCurrentUserProfile();
  if (!user) {
    redirect("/login?next=/admin");
  }

  const hasAdminAccess = Boolean(profile && (profile.is_admin || profile.role === "admin"));
  if (!hasAdminAccess) {
    redirect("/?erro=acesso-negado");
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold">Painel administrativo</h1>
        <p className="text-muted-foreground">
          Área para moderar eventos enviados por organizadores, aprovar/reprovar e acionar notificações por e-mail.
        </p>
      </div>
      <ApprovalTable />
    </div>
  );
}
