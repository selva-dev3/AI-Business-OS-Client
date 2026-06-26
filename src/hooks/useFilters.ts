"use client";

import { useState } from "react";

export function useFilters<T extends Record<string, unknown>>(defaults: T) {
  const [filters, setFilters] = useState<T>(defaults);

  const updateFilter = (key: keyof T, value: T[keyof T]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters(defaults);

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => v !== defaults[k as keyof T] && v !== undefined && v !== ""
  ).length;

  return {
    filters,
    updateFilter,
    resetFilters,
    activeFilterCount,
    setFilters,
  };
}
