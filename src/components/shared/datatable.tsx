import * as React from "react";
import { Loader2, AlertCircle } from "lucide-react";

export interface Column<T> {
  header: React.ReactNode;
  cell?: (row: T) => React.ReactNode;
  accessorKey?: keyof T | string;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  data,
  columns,
  isLoading = false,
  emptyMessage = "No records found",
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/55 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            {columns.map((column, index) => (
              <th
                key={index}
                className={`py-3 px-4 ${column.className || ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-500" />
                <span className="text-xs mt-2 block font-medium">Fetching directory...</span>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-slate-400">
                <AlertCircle className="h-6 w-6 mx-auto text-slate-300 mb-2" />
                <span className="text-xs font-medium">{emptyMessage}</span>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className={`hover:bg-slate-50/70 transition-colors ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {columns.map((column, colIndex) => {
                  const content = column.cell
                    ? column.cell(row)
                    : column.accessorKey
                    ? (row[column.accessorKey as keyof T] as React.ReactNode)
                    : null;

                  return (
                    <td
                      key={colIndex}
                      className={`py-3.5 px-4 ${column.className || ""}`}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
