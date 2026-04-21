import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto flex flex-col gap-3 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Vamos Fazer O Que? Todos os direitos reservados.</p>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-foreground">
            Eventos
          </Link>
          <Link href="/cadastro" className="hover:text-foreground">
            Criar conta
          </Link>
          <Link href="/cadastro-evento" className="hover:text-foreground">
            Publicar evento
          </Link>
        </div>
      </div>
    </footer>
  );
}
