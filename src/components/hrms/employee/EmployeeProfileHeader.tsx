"use client";

import { Briefcase, Building2, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Employee } from "@/hooks/queries/hrms/employees/employees.types";
import {
  getInitials,
  getStatusBadge,
  getEmploymentTypeLabel,
  getDeptName,
} from "@/components/hrms/employee/types/employee-detail.utils";

interface EmployeeProfileHeaderProps {
  employee: Employee;
}

export function EmployeeProfileHeader({ employee }: EmployeeProfileHeaderProps) {
  return (
    <Card className="overflow-hidden border-slate-200/80 shadow-md">
      <div className="h-28 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-pink-500/10 border-b border-slate-100" />
      <CardContent className="relative px-6 pb-6 pt-0">
        <div className="flex flex-col md:flex-row md:items-end gap-5 -mt-10 md:mb-2">
          <Avatar className="h-24 w-24 rounded-2xl border-4 border-white shadow-md bg-white">
            <AvatarImage src={employee.avatar} alt={employee.firstName} />
            <AvatarFallback className="text-indigo-700 bg-indigo-50 text-2xl font-black rounded-2xl">
              {getInitials(employee.firstName, employee.lastName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {employee.firstName} {employee.lastName}
              </h1>
              {getStatusBadge(employee.status)}
              <Badge
                variant="secondary"
                className="bg-indigo-50/80 text-indigo-700 font-bold border border-indigo-100/50 text-[10px] rounded-full px-2.5 py-0.5"
              >
                {getEmploymentTypeLabel(employee.employmentType)}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-indigo-500" />
                {employee?.designation || (employee as any)?.designationId || "—"}
              </span>
              <span className="h-1 w-1 bg-slate-300 rounded-full hidden sm:inline" />
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                {getDeptName(employee)}
              </span>
              <span className="h-1 w-1 bg-slate-300 rounded-full hidden sm:inline" />
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                Joined:{" "}
                {employee.dateOfJoining
                  ? new Date(employee.dateOfJoining).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}