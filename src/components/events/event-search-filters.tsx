"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EVENT_CATEGORIES } from "@/types/event";
import { cn } from "@/lib/utils";

interface EventSearchFiltersProps {
  currentQ: string;
  currentCategoria: string;
}

export function EventSearchFilters({ currentQ, currentCategoria }: EventSearchFiltersProps) {
  const router = useRouter();
  const [q, setQ] = useState(currentQ);

  // Sync controlled input when URL search param changes (soft navigation)
  useEffect(() => {
    setQ(currentQ);
  }, [currentQ]);

  function navigate(searchQ: string, categoria: string) {
    const params = new URLSearchParams();
    if (searchQ.trim()) params.set("q", searchQ.trim());
    if (categoria) params.set("categoria", categoria);
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  return (
    <div className="space-y-4">
      {/* Search row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate(q, currentCategoria);
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar eventos, organizadores..."
            className="h-12 pl-10 text-sm"
          />
        </div>
        <Button type="submit" size="lg" className="h-12 shrink-0 px-6 active:scale-[0.97]">
          Buscar
        </Button>
      </form>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
        <button
          type="button"
          onClick={() => navigate(q, "")}
          className={cn(
            "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-[transform,background-color,border-color,color] duration-200 active:scale-[0.97]",
            !currentCategoria
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
          )}
        >
          Todos
        </button>
        {EVENT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => navigate(q, cat)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-[transform,background-color,border-color,color] duration-200 active:scale-[0.97]",
              currentCategoria === cat
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
