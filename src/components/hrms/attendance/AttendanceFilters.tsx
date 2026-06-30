import React from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Department {
  id: string;
  name: string;
}

interface AttendanceFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  dateFilter: string;
  onDateChange: (date: string) => void;
  deptFilter: string;
  onDeptChange: (dept: string) => void;
  departments: Department[];
  onClearFilters: () => void;
}

export const AttendanceFilters: React.FC<AttendanceFiltersProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  dateFilter,
  onDateChange,
  deptFilter,
  onDeptChange,
  departments,
  onClearFilters,
}) => {
  const hasActiveFilters = searchQuery || statusFilter || deptFilter;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
        <Input
          placeholder="Search employee by name, role..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Filters</span>
        </div>

        {/* Date Filter */}
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => onDateChange(e.target.value)}
          className="h-9 w-38 px-2 text-xs font-medium bg-white rounded-lg border border-slate-200 focus:outline-hidden"
        />

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="h-9 px-2 text-xs font-medium bg-white rounded-lg border border-slate-200 focus:outline-hidden"
        >
          <option value="">All Statuses</option>
          <option value="present">Present</option>
          <option value="late">Late</option>
          <option value="half_day">Half Day</option>
          <option value="absent">Absent</option>
          <option value="on_leave">On Leave</option>
        </select>

        {/* Department Filter */}
        <select
          value={deptFilter}
          onChange={(e) => onDeptChange(e.target.value)}
          className="h-9 px-2 text-xs font-medium bg-white rounded-lg border border-slate-200 focus:outline-hidden"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        {/* Clear button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-rose-500 hover:text-rose-600 font-semibold"
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};