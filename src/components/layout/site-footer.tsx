import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto flex flex-col gap-3 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Vamos Fazer O Que? Todos os direitos reservados.</p>
        <div className="flex items-center gap-4">
          <Link href="/eventos/festa-junina-de-campina" className="hover:text-foreground">
            Evento em destaque
          </Link>
          <Link href="/admin" className="hover:text-foreground">
            Área administrativa
          </Link>
        </div>
      </div>
    </footer>
  );
}
