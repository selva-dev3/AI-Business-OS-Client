"use client";

import { useState } from "react";
import { api } from "@/lib/api/client";

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportData = async (endpoint: string, format: "xlsx" | "pdf" | "csv", filters?: Record<string, unknown>) => {
    setIsExporting(true);
    try {
      const response = await api.post(
        `${endpoint}/export`,
        { format, filters },
        { responseType: "blob" }
      );
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export.${format === "xlsx" ? "xlsx" : format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  return { exportData, isExporting };
}
