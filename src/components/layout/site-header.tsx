import Link from "next/link";
import { CalendarDays, PlusCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCurrentUserProfile } from "@/lib/supabase/authz";
import { LogoutButton } from "@/components/layout/logout-button";

export async function SiteHeader() {
  const { user, profile } = await getCurrentUserProfile();
  const canPublish = Boolean(
    profile?.role === "organizador" ||
    profile?.role === "admin" ||
    profile?.is_admin,
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <CalendarDays className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Vamos Fazer O Que?
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-0.5 md:flex">
          <Link
            href="/"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Início
          </Link>
          {canPublish && (
            <Link
              href="/cadastro-evento"
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Publicar evento
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden max-w-[160px] truncate text-sm text-muted-foreground md:block">
                {profile?.full_name ?? user.email}
              </span>
              {canPublish && (
                <Link
                  href="/cadastro-evento"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "hidden md:flex"
                  )}
                >
                  <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                  Novo evento
                </Link>
              )}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "text-muted-foreground hover:text-foreground"
                )}
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Criar conta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
