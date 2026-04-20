"use client";

import { EVENT_CATEGORIES } from "@/types/event";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EventFiltersProps {
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
}

export function EventFilters({ selectedCategory, onCategoryChange }: EventFiltersProps) {
  return (
    <div className="w-full md:w-72">
      <Select
        value={selectedCategory}
        onValueChange={(value) => {
          onCategoryChange(value ?? "todas");
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Filtrar por categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todas">Todas as categorias</SelectItem>
          {EVENT_CATEGORIES.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
