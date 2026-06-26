"use client";

import { useState } from "react";
import { useDebounce } from "./useDebounce";

export function useSearch(delay = 300) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, delay);

  return {
    query,
    debouncedQuery,
    setQuery,
    clearSearch: () => setQuery(""),
  };
}
