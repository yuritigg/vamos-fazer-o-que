"use client";

import { useRef } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EVENT_CATEGORIES } from "@/types/event";

interface EventSearchFiltersProps {
  currentQ: string;
  currentCategoria: string;
}

export function EventSearchFilters({ currentQ, currentCategoria }: EventSearchFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} method="GET" action="/" className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={currentQ}
          placeholder="Buscar por nome do evento, organizador ou categoria..."
          className="pl-9"
        />
      </div>
      <select
        name="categoria"
        defaultValue={currentCategoria}
        onChange={() => formRef.current?.submit()}
        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring sm:w-56"
      >
        <option value="">Todas as categorias</option>
        {EVENT_CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
      <Button type="submit" className="shrink-0">
        Buscar
      </Button>
    </form>
  );
}
