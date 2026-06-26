export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ApiError = {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
};

export type SortDirection = "asc" | "desc";

export type FilterConfig = {
  key: string;
  label: string;
  type: "select" | "multi-select" | "date-range" | "number-range" | "boolean";
  options?: { value: string; label: string }[];
};

export type Filter = {
  key: string;
  value: string | string[] | boolean | Date | [Date, Date] | [number, number];
};
