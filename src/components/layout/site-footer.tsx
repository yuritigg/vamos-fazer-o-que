import Link from "next/link";
import { CalendarDays } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 bg-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <CalendarDays className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold tracking-tight text-foreground">
                Vamos Fazer O Que?
              </span>
            </div>
            <p className="mt-3 max-w-[36ch] text-sm leading-relaxed text-muted-foreground">
              Conectamos pessoas aos melhores eventos regionais e ajudamos organizadores a divulgar suas experiências.
            </p>
          </div>

          {/* Descobrir */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Descobrir</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="transition-colors hover:text-foreground">
                  Todos os eventos
                </Link>
              </li>
              <li>
                <Link href="/?categoria=M%C3%BAsica" className="transition-colors hover:text-foreground">
                  Música
                </Link>
              </li>
              <li>
                <Link href="/?categoria=Esporte" className="transition-colors hover:text-foreground">
                  Esporte
                </Link>
              </li>
              <li>
                <Link href="/?categoria=Gastronomia" className="transition-colors hover:text-foreground">
                  Gastronomia
                </Link>
              </li>
            </ul>
          </div>

          {/* Organizadores */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Organizadores</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/cadastro" className="transition-colors hover:text-foreground">
                  Criar conta
                </Link>
              </li>
              <li>
                <Link href="/cadastro-evento" className="transition-colors hover:text-foreground">
                  Publicar evento
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition-colors hover:text-foreground">
                  Entrar
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border/50 pt-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Vamos Fazer O Que? Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
