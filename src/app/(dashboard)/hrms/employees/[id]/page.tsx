"use client";

import * as React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { useEmployeeProfile } from "@/hooks/useEmployeeTabData";
import { employeesKeys } from "@/hooks/queries/hrms/employees/employees.keys";
import { EmployeeProfile as EmployeeProfileType } from "@/types/hrms";
import { EmployeeHeader } from "@/components/hrms/employee/EmployeeHeader";
import { EmployeeTabBar, EmployeeTabKey } from "@/components/hrms/employee/EmployeeTabBar";

// Lazy tab imports
const OverviewTab = React.lazy(() => import("@/components/hrms/employee/tabs/OverviewTab"));
const AttendanceTab = React.lazy(() => import("@/components/hrms/employee/tabs/AttendanceTab"));
const LeaveTab = React.lazy(() => import("@/components/hrms/employee/tabs/LeaveTab"));
const PayrollTab = React.lazy(() => import("@/components/hrms/employee/tabs/PayrollTab"));
const DocumentsTab = React.lazy(() => import("@/components/hrms/employee/tabs/DocumentsTab"));
const NotesTab = React.lazy(() => import("@/components/hrms/employee/tabs/NotesTab"));
const RoleTab = React.lazy(() => import("@/components/hrms/employee/tabs/RoleTab"));
const AccessTab = React.lazy(() => import("@/components/hrms/employee/tabs/AccessTab"));
const ExitTab = React.lazy(() => import("@/components/hrms/employee/tabs/ExitTab"));

function TabSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <div className="h-8 w-48 bg-slate-100 rounded animate-pulse" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-slate-100 rounded animate-pulse" />
        ))}
      </div>
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// Fallback employee
const FALLBACK_EMPLOYEE: EmployeeProfileType = {
  id: "emp-1",
  employeeId: "EMP-2026-001",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@company.com",
  phone: "+1 (555) 234-5678",
  designation: "Principal Engineer",
  department: { id: "dept-1", name: "Engineering", color: "#6366f1" },
  status: "Active",
  employmentType: "full_time",
  dateOfJoining: "2024-03-15",
  dateOfBirth: "1992-05-15",
  gender: "male",
  bloodGroup: "O+",
  maritalStatus: "married",
  address: "123 Tech Lane",
  city: "San Francisco",
  state: "CA",
  country: "USA",
  zipCode: "94107",
  emergencyContact: { name: "Mary Doe", relation: "spouse", phone: "+1 (555) 987-6543" },
  bankDetails: { bankName: "Chase Bank", accountNumber: "1234567890", ifscCode: "CHASUS33XXX", accountType: "Savings" },
  panNumber: "ABCDE1234F",
  aadharNumber: "123456789012",
  createdAt: "2024-03-15T00:00:00Z",
  updatedAt: "2024-03-15T00:00:00Z",
  companyId: "comp-1",
};

export default function EmployeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const id = params?.id as string;
  const tabParam = searchParams.get("tab") || "overview";

  const [activeTab, setActiveTab] = React.useState<EmployeeTabKey>(
    (tabParam as EmployeeTabKey) || "overview"
  );
  const [mountedTabs, setMountedTabs] = React.useState<Set<string>>(new Set(["overview"]));

  const { data: serverEmployee, isLoading, isError } = useEmployeeProfile(id);

  const employee = React.useMemo<EmployeeProfileType>(() => {
    if (serverEmployee) {
      return {
        ...serverEmployee,
        employeeId: serverEmployee.employeeId || serverEmployee.employeeCode || "",
        employeeType:
          serverEmployee.employmentType === "full_time"
            ? "Full-Time"
            : serverEmployee.employmentType === "part_time"
            ? "Part-Time"
            : serverEmployee.employmentType === "contract"
            ? "Contract"
            : serverEmployee.employmentType === "intern"
            ? "Intern"
            : serverEmployee.employmentType ?? "",
        department: serverEmployee.department
          ? { id: serverEmployee.department.id, name: serverEmployee.department.name }
          : undefined,
      } as EmployeeProfileType;
    }
    return { ...FALLBACK_EMPLOYEE, id };
  }, [serverEmployee, id]);

  const handleTabChange = React.useCallback(
    (tab: EmployeeTabKey) => {
      setActiveTab(tab);
      setMountedTabs((prev) => new Set(prev).add(tab));
      router.push(`/hrms/employees/${id}?tab=${tab}`, { scroll: false });
    },
    [id, router]
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-sm font-semibold text-slate-500 mt-3 animate-pulse">Loading employee profile...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Button variant="ghost" onClick={() => router.push("/hrms/employees")} className="gap-2">
          Back to Employees
        </Button>
        <Card className="border-rose-100 bg-rose-50/20">
          <CardContent className="py-12 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Employee Profile Not Found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              We couldn&apos;t retrieve profile information for ID &quot;{id}&quot;.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 w-full space-y-4">
      {/* Header Card */}
      <EmployeeHeader
        employee={employee}
        onBack={() => router.push("/hrms/employees")}
        onEmployeeUpdate={() => {
          qc.invalidateQueries({ queryKey: employeesKeys.detail(id) });
          toast.success("Employee updated");
        }}
      />

      {/* Tab Bar */}
      <EmployeeTabBar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Tab Content Panels — keep mounted, toggle visibility */}
      <div className="min-h-[400px]">
        <React.Suspense fallback={<TabSkeleton />}>
          {mountedTabs.has("overview") && (
            <div className={activeTab === "overview" ? "block" : "hidden"}>
              <OverviewTab employee={employee} />
            </div>
          )}
          {mountedTabs.has("attendance") && (
            <div className={activeTab === "attendance" ? "block" : "hidden"}>
              <AttendanceTab employeeId={id} />
            </div>
          )}
          {mountedTabs.has("leaves") && (
            <div className={activeTab === "leaves" ? "block" : "hidden"}>
              <LeaveTab employeeId={id} />
            </div>
          )}
          {mountedTabs.has("payroll") && (
            <div className={activeTab === "payroll" ? "block" : "hidden"}>
              <PayrollTab employeeId={id} />
            </div>
          )}
          {mountedTabs.has("documents") && (
            <div className={activeTab === "documents" ? "block" : "hidden"}>
              <DocumentsTab employeeId={id} />
            </div>
          )}
          {mountedTabs.has("notes") && (
            <div className={activeTab === "notes" ? "block" : "hidden"}>
              <NotesTab employeeId={id} />
            </div>
          )}
          {mountedTabs.has("assign-role") && (
            <div className={activeTab === "assign-role" ? "block" : "hidden"}>
              <RoleTab employee={employee} />
            </div>
          )}
          {mountedTabs.has("access") && (
            <div className={activeTab === "access" ? "block" : "hidden"}>
              <AccessTab employee={employee} />
            </div>
          )}
          {mountedTabs.has("exit") && (
            <div className={activeTab === "exit" ? "block" : "hidden"}>
              <ExitTab employee={employee} />
            </div>
          )}
        </React.Suspense>
      </div>
    </div>
  );
}
