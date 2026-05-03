import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { ApprovalTable } from "@/components/admin/approval-table";
import { getCurrentUserProfile } from "@/lib/supabase/authz";

export default async function AdminPage() {
  const { user, profile } = await getCurrentUserProfile();
  if (!user) redirect("/login?next=/admin");

  const hasAdminAccess = Boolean(profile && (profile.is_admin || profile.role === "admin"));
  if (!hasAdminAccess) redirect("/?erro=acesso-negado");

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Page header */}
      <div className="mb-10 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary">
          <ShieldCheck className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Painel administrativo
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Moderação de eventos enviados por organizadores.
          </p>
        </div>
      </div>

      <ApprovalTable />
    </div>
  );
}
