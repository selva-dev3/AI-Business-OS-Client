"use client";

import { useState } from "react";

export function usePagination(defaultPage = 1, defaultLimit = 20) {
  const [page, setPage] = useState(defaultPage);
  const [limit, setLimit] = useState(defaultLimit);

  const reset = () => setPage(1);

  return {
    page,
    limit,
    offset: (page - 1) * limit,
    setPage,
    setLimit: (l: number) => {
      setLimit(l);
      setPage(1);
    },
    reset,
    params: { page, limit },
  };
}
