"use client";

import { useRef } from "react";
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
  const formRef = useRef<HTMLFormElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);

  function handleCategoryClick(cat: string) {
    if (categoryRef.current) categoryRef.current.value = cat;
    formRef.current?.submit();
  }

  return (
    <div className="space-y-4">
      {/* Search row */}
      <form ref={formRef} method="GET" action="/" className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={currentQ}
            placeholder="Buscar eventos, organizadores..."
            className="h-12 pl-10 text-sm"
          />
        </div>
        {/* Hidden select for category value */}
        <select ref={categoryRef} name="categoria" defaultValue={currentCategoria} className="hidden" />
        <Button type="submit" size="lg" className="h-12 shrink-0 px-6">
          Buscar
        </Button>
      </form>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
        <button
          type="button"
          onClick={() => handleCategoryClick("")}
          className={cn(
            "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200",
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
            onClick={() => handleCategoryClick(cat)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200",
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
