"use client";

import Link from "next/link";
import { CalendarDays, MapPin, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Início" },
  { href: "/cadastro-evento", label: "Cadastrar evento" },
  { href: "/admin", label: "Admin" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/95 text-slate-100 shadow-lg backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-wide">
          <CalendarDays className="h-5 w-5 text-sky-400" />
          <span>Vamos Fazer O Que?</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-slate-300 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-slate-100 hover:bg-slate-800 hover:text-white",
            )}
          >
            <MapPin className="mr-1 h-4 w-4" />
            Entrar
          </Link>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-sky-500 text-slate-950 hover:bg-sky-400",
            )}
          >
            <ShieldCheck className="mr-1 h-4 w-4" />
            Quero organizar
          </Link>
        </div>
      </div>
    </header>
  );
}
