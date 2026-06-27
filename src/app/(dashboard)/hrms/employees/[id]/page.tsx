"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  Calendar,
  User,
  MapPin,
  Briefcase,
  CreditCard,
  HeartPulse,
  UserCheck,
  UserX,
  Loader2,
  AlertCircle,
  Building2,
  Activity,
  FileText,
  BadgeAlert,
  Eye,
  EyeOff,
  ShieldCheck
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEmployee, useUpdateEmployee } from "@/hooks/queries/hrms/employees/employees.hooks";
import { Employee } from "@/hooks/queries/hrms/employees/employees.types";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function EmployeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  // Retrieve employee from API query
  const { data: serverEmployee, isLoading, isError } = useEmployee(id);
  const updateEmployeeMutation = useUpdateEmployee(id);

  // Tabs navigation state
  const [activeTab, setActiveTab] = React.useState<"overview" | "financial">("overview");

  // Local fallback mock database for editing
  const [localEmployee, setLocalEmployee] = React.useState<Employee | null>(null);

  // Edit form state for Financial & Identity
  const [isEditing, setIsEditing] = React.useState(false);
  const [showAccountNumber, setShowAccountNumber] = React.useState(false);
  const [financialForm, setFinancialForm] = React.useState({
    panNumber: "",
    aadharNumber: "",
    accountType: "Savings",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
  });
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
  const [apiError, setApiError] = React.useState<string | null>(null);

  // Local fallback mock database for seamless simulation if not on DB yet
  const fallbackEmployees: Employee[] = React.useMemo(() => {
    return [
      {
        id: "emp-1",
        employeeId: "EMP-2026-001",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@company.com",
        phone: "+1 (555) 234-5678",
        alternatePhone: "+1 (555) 234-5679",
        personalEmail: "john.doe.personal@gmail.com",
        designation: "Principal Engineer",
        departmentId: "dept-1",
        department: { id: "dept-1", name: "Engineering" },
        managerId: "m2",
        manager: { id: "m2", firstName: "Alex", lastName: "Rivera" },
        status: "active",
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
        emergencyContact: {
          name: "Mary Doe",
          relation: "spouse",
          phone: "+1 (555) 987-6543",
        },
        bankDetails: {
          bankName: "Chase Bank",
          accountNumber: "1234567890",
          ifscCode: "CHASUS33XXX",
          accountType: "savings",
        },
        panNumber: "ABCDE1234F",
        aadharNumber: "1234-5678-9012",
        createdAt: "2024-03-15T00:00:00Z",
        updatedAt: "2024-03-15T00:00:00Z",
        companyId: "comp-1",
      },
      {
        id: "emp-2",
        employeeId: "EMP-2026-002",
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@company.com",
        phone: "+1 (555) 345-6789",
        alternatePhone: "+1 (555) 345-6780",
        personalEmail: "jane.smith.personal@gmail.com",
        designation: "Product Lead",
        departmentId: "dept-2",
        department: { id: "dept-2", name: "Product & Design" },
        managerId: "m2",
        manager: { id: "m2", firstName: "Alex", lastName: "Rivera" },
        status: "active",
        employmentType: "full_time",
        dateOfJoining: "2023-11-01",
        dateOfBirth: "1994-08-22",
        gender: "female",
        bloodGroup: "A-",
        maritalStatus: "single",
        address: "456 Design Blvd",
        city: "New York",
        state: "NY",
        country: "USA",
        zipCode: "10011",
        emergencyContact: {
          name: "Richard Smith",
          relation: "father",
          phone: "+1 (555) 876-5432",
        },
        bankDetails: {
          bankName: "Bank of America",
          accountNumber: "9876543210",
          ifscCode: "BOFAUS3NXXX",
          accountType: "checking",
        },
        panNumber: "FGHIJ5678K",
        aadharNumber: "5678-1234-9012",
        createdAt: "2023-11-01T00:00:00Z",
        updatedAt: "2023-11-01T00:00:00Z",
        companyId: "comp-1",
      },
      {
        id: "emp-3",
        employeeId: "EMP-2026-003",
        firstName: "Robert",
        lastName: "Chen",
        email: "robert.chen@company.com",
        phone: "+1 (555) 456-7890",
        personalEmail: "robert.chen.personal@gmail.com",
        designation: "Talent Partner",
        departmentId: "dept-4",
        department: { id: "dept-4", name: "Human Resources" },
        managerId: "m1",
        manager: { id: "m1", firstName: "Sarah", lastName: "Jenkins" },
        status: "on_leave",
        employmentType: "full_time",
        dateOfJoining: "2025-01-20",
        dateOfBirth: "1990-12-05",
        gender: "male",
        bloodGroup: "B+",
        maritalStatus: "married",
        address: "789 HR Circle",
        city: "Chicago",
        state: "IL",
        country: "USA",
        zipCode: "60601",
        emergencyContact: {
          name: "Tina Chen",
          relation: "spouse",
          phone: "+1 (555) 765-4321",
        },
        bankDetails: {
          bankName: "Wells Fargo",
          accountNumber: "4567890123",
          ifscCode: "WFCUUS44XXX",
          accountType: "savings",
        },
        panNumber: "KLMNO9012P",
        aadharNumber: "9012-3456-7812",
        createdAt: "2025-01-20T00:00:00Z",
        updatedAt: "2025-01-20T00:00:00Z",
        companyId: "comp-1",
      },
      {
        id: "emp-4",
        employeeId: "EMP-2026-004",
        firstName: "Emily",
        lastName: "Watson",
        email: "emily.watson@company.com",
        phone: "+1 (555) 789-0123",
        designation: "Marketing Specialist",
        departmentId: "dept-3",
        department: { id: "dept-3", name: "Sales & Marketing" },
        managerId: "m3",
        manager: { id: "m3", firstName: "Elena", lastName: "Rostova" },
        status: "active",
        employmentType: "contract",
        dateOfJoining: "2025-05-10",
        createdAt: "2025-05-10T00:00:00Z",
        updatedAt: "2025-05-10T00:00:00Z",
        companyId: "comp-1",
      },
      {
        id: "emp-5",
        employeeId: "EMP-2026-005",
        firstName: "David",
        lastName: "Kim",
        email: "david.kim@company.com",
        phone: "+1 (555) 901-2345",
        designation: "QA Engineer Intern",
        departmentId: "dept-1",
        department: { id: "dept-1", name: "Engineering" },
        managerId: "m2",
        manager: { id: "m2", firstName: "Alex", lastName: "Rivera" },
        status: "inactive",
        employmentType: "intern",
        dateOfJoining: "2026-04-01",
        createdAt: "2026-04-01T00:00:00Z",
        updatedAt: "2026-04-01T00:00:00Z",
        companyId: "comp-1",
      },
    ];
  }, []);

  React.useEffect(() => {
    if (serverEmployee) {
      setLocalEmployee(serverEmployee);
    } else {
      const found = fallbackEmployees.find((emp) => emp.id === id);
      if (found) {
        setLocalEmployee(found);
      }
    }
  }, [serverEmployee, id, fallbackEmployees]);

  const employee = localEmployee || serverEmployee || fallbackEmployees.find((emp) => emp.id === id);

  React.useEffect(() => {
    if (employee) {
      setFinancialForm({
        panNumber: employee.panNumber || "",
        aadharNumber: employee.aadharNumber || "",
        accountType: employee.bankDetails?.accountType || "Savings",
        bankName: employee.bankDetails?.bankName || "",
        accountNumber: employee.bankDetails?.accountNumber || "",
        ifscCode: employee.bankDetails?.ifscCode || "",
      });
    }
  }, [employee, isEditing]);

  const formatMaskedAadhar = (val?: string) => {
    if (!val) return "Not Provided";
    const clean = val.replace(/\D/g, "");
    if (clean.length === 12) {
      return `XXXX XXXX ${clean.slice(-4)}`;
    }
    if (val.length > 4) {
      return `XXXX XXXX ${val.slice(-4)}`;
    }
    return val;
  };

  const maskAccountNumber = (val?: string) => {
    if (!val) return "Not Provided";
    if (val.length <= 4) return "••••";
    return `••••••••${val.slice(-4)}`;
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormErrors({});
    setApiError(null);
    if (employee) {
      setFinancialForm({
        panNumber: employee.panNumber || "",
        aadharNumber: employee.aadharNumber || "",
        accountType: employee.bankDetails?.accountType || "Savings",
        bankName: employee.bankDetails?.bankName || "",
        accountNumber: employee.bankDetails?.accountNumber || "",
        ifscCode: employee.bankDetails?.ifscCode || "",
      });
    }
  };

  const handleSaveFinancial = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    const errors: Record<string, string> = {};

    const cleanedPan = financialForm.panNumber.trim().toUpperCase();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    if (cleanedPan && !panRegex.test(cleanedPan)) {
      errors.panNumber = "Invalid PAN Card Number format (e.g. ABCDE1234F)";
    }

    const cleanedAadhar = financialForm.aadharNumber.replace(/\D/g, "");
    if (cleanedAadhar && cleanedAadhar.length !== 12) {
      errors.aadharNumber = "Aadhar Number must be exactly 12 digits";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    const payload = {
      panNumber: cleanedPan || undefined,
      aadharNumber: financialForm.aadharNumber.trim() || undefined,
      bankDetails: {
        bankName: financialForm.bankName.trim() || undefined,
        accountNumber: financialForm.accountNumber.trim() || undefined,
        ifscCode: financialForm.ifscCode.trim() || undefined,
        accountType: financialForm.accountType || undefined,
      }
    };

    try {
      await updateEmployeeMutation.mutateAsync(payload);
      toast.success("Financial & Identity details saved successfully.");
      setIsEditing(false);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.message || err?.response?.data?.message || "Failed to save details on the server.";
      setApiError(errorMessage);

      if (!serverEmployee) {
        setLocalEmployee((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            panNumber: cleanedPan,
            aadharNumber: financialForm.aadharNumber,
            bankDetails: {
              bankName: financialForm.bankName,
              accountNumber: financialForm.accountNumber,
              ifscCode: financialForm.ifscCode,
              accountType: financialForm.accountType,
            }
          };
        });
        toast.info("Saved changes locally (Mock Mode)");
        setIsEditing(false);
        setApiError(null);
      } else {
        toast.error("Error saving changes. Please try again.");
      }
    }
  };

  // Helper to resolve department name
  const getDeptName = () => {
    if (!employee) return "Corporate";
    if (typeof employee.department === "object" && employee.department?.name) {
      return employee.department.name;
    }
    const deptMap: Record<string, string> = {
      "dept-1": "Engineering",
      "dept-2": "Product & Design",
      "dept-3": "Sales & Marketing",
      "dept-4": "Human Resources",
      "dept-5": "Finance & Legal",
      "dept-6": "Customer Support",
    };
    return (employee.departmentId && deptMap[employee.departmentId]) || "Corporate";
  };

  // Helper to format initials
  const getInitials = (first = "", last = "") => {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  // Helper to resolve status badge styling
  const getStatusBadge = (status = "active") => {
    const labels: Record<string, string> = {
      active: "Active",
      inactive: "Inactive",
      terminated: "Terminated",
      on_leave: "On Leave",
    };
    const styles: Record<string, string> = {
      active: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
      inactive: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800/30",
      terminated: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30",
      on_leave: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
    };
    return (
      <Badge variant="outline" className={`capitalize font-bold text-[10px] tracking-wide px-2.5 py-0.5 rounded-full ${styles[status] || styles.active}`}>
        {labels[status] || status}
      </Badge>
    );
  };

  // Helper to resolve employment type formatting
  const getEmploymentTypeLabel = (type = "full_time") => {
    const types: Record<string, string> = {
      full_time: "Full-Time",
      part_time: "Part-Time",
      contract: "Contract",
      intern: "Internship",
    };
    return types[type] || type.replace("_", "-");
  };

  // Recursive parser to build key-value fields representing ALL properties except raw IDs
  const getDisplayFields = React.useCallback((obj: any, prefix = ""): { label: string; value: string }[] => {
    if (!obj || typeof obj !== "object") return [];
    let fields: { label: string; value: string }[] = [];

    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val === null || val === undefined) continue;

      const lowerKey = key.toLowerCase();
      // Exclude primary database identifiers and fields ending in ID
      if (
        lowerKey === "id" ||
        lowerKey === "_id" ||
        lowerKey === "__v" ||
        lowerKey.endsWith("id")
      ) {
        continue;
      }

      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof val === "object" && !Array.isArray(val) && !(val instanceof Date)) {
        // Recurse for nested address, bank details, emergency contacts, etc.
        // But let's skip displaying sub-structures of department/manager as they are handled in custom views,
        // unless they are plain string details.
        if (["department", "manager"].includes(key)) {
          // Display department/manager name but skip their IDs
          if (key === "department" && val.name) {
            fields.push({ label: "Department Name", value: String(val.name) });
          } else if (key === "manager") {
            const managerName = `${val.firstName || ""} ${val.lastName || ""}`.trim();
            if (managerName) {
              fields.push({ label: "Manager Name", value: managerName });
            }
          }
        } else {
          fields = [...fields, ...getDisplayFields(val, fullKey)];
        }
      } else if (Array.isArray(val)) {
        if (val.length > 0 && typeof val[0] !== "object") {
          fields.push({
            label: fullKey.replace(/([A-Z])/g, " $1").replace(/\b\w/g, c => c.toUpperCase()),
            value: val.join(", "),
          });
        }
      } else {
        // Format camelCase and dot-notated paths to clean Title Case labels
        const label = fullKey
          .split(".")
          .map((part) => part.replace(/([A-Z])/g, " $1").trim())
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" - ");

        let displayValue = String(val);
        if (typeof val === "boolean") {
          displayValue = val ? "Yes" : "No";
        } else if (
          typeof val === "string" &&
          val.match(/^\d{4}-\d{2}-\d{2}/) &&
          !isNaN(Date.parse(val))
        ) {
          displayValue = new Date(val).toLocaleDateString();
        }

        fields.push({ label, value: displayValue });
      }
    }

    return fields;
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-sm font-semibold text-slate-500 mt-3 animate-pulse">Loading employee profile...</p>
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Button variant="ghost" onClick={() => router.push("/hrms/employees")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Employees
        </Button>
        <Card className="border-rose-100 bg-rose-50/20 dark:bg-rose-950/10">
          <CardContent className="py-12 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Employee Profile Not Found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              We couldn't retrieve profile information for ID "{id}". Please confirm the employee exists in your directory.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Parse all fields to display
  const allProperties = getDisplayFields(employee);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/hrms/employees")}
          className="gap-2 border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 hover:border-indigo-200 transition-all rounded-lg"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Directory</span>
        </Button>

        <span className="text-xs text-slate-400 font-medium font-mono">
          Profile Hash: {employee.id ? `REF-${employee.id.substring(0, 8).toUpperCase()}` : "N/A"}
        </span>
      </div>

      {/* Main Profile Header Card */}
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
                <Badge variant="secondary" className="bg-indigo-50/80 text-indigo-700 font-bold border border-indigo-100/50 text-[10px] rounded-full px-2.5 py-0.5">
                  {getEmploymentTypeLabel(employee.employmentType)}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-indigo-500" />
                  {employee.designation || "Executive Representative"}
                </span>
                <span className="h-1 w-1 bg-slate-300 rounded-full hidden sm:inline" />
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                  {getDeptName()}
                </span>
                <span className="h-1 w-1 bg-slate-300 rounded-full hidden sm:inline" />
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                  Joined: {employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View switcher & filters row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Tabs Sidebar */}
        <div className="space-y-2">
          <Button
            variant={activeTab === "overview" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("overview")}
            className={cn(
              "w-full justify-start font-semibold text-slate-700",
              activeTab === "overview" && "bg-indigo-50 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-700"
            )}
          >
            <User className="mr-2 h-4 w-4 shrink-0" />
            Overview
          </Button>
          <Button
            variant={activeTab === "financial" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("financial")}
            className={cn(
              "w-full justify-start font-semibold text-slate-700",
              activeTab === "financial" && "bg-indigo-50 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-700"
            )}
          >
            <CreditCard className="mr-2 h-4 w-4 shrink-0" />
            Financial & Identity
          </Button>
        </div>

        {/* Right side content panels */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === "overview" && (
            <>
              {/* Grid of structured detailed info cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Contact details */}
                <Card className="border-slate-100 shadow-xs">
                  <CardHeader className="pb-3 border-b border-slate-50">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4.5 w-4.5 text-indigo-600" />
                      <CardTitle className="text-sm font-bold text-slate-800">Contact Channels</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3.5 text-xs">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-slate-400 font-medium">Work Email</span>
                      <span className="text-slate-900 font-semibold select-all">{employee.email || "N/A"}</span>
                    </div>
                    {employee.personalEmail && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-slate-400 font-medium">Personal Email</span>
                        <span className="text-slate-900 font-semibold select-all">{employee.personalEmail}</span>
                      </div>
                    )}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-slate-400 font-medium">Mobile Phone</span>
                      <span className="text-slate-900 font-semibold select-all">{employee.phone || "N/A"}</span>
                    </div>
                    {employee.alternatePhone && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-slate-400 font-medium">Alternate Phone</span>
                        <span className="text-slate-900 font-semibold select-all">{employee.alternatePhone}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Personal parameters */}
                <Card className="border-slate-100 shadow-xs">
                  <CardHeader className="pb-3 border-b border-slate-50">
                    <div className="flex items-center gap-2">
                      <User className="h-4.5 w-4.5 text-indigo-600" />
                      <CardTitle className="text-sm font-bold text-slate-800">Personal Information</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3.5 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-slate-400 font-medium">Date of Birth</span>
                        <span className="text-slate-900 font-semibold">
                          {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-slate-400 font-medium">Gender</span>
                        <span className="text-slate-900 font-semibold capitalize">{employee.gender || "N/A"}</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-slate-400 font-medium">Blood Group</span>
                        <span className="text-slate-900 font-semibold uppercase">{employee.bloodGroup || "N/A"}</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-slate-400 font-medium">Marital Status</span>
                        <span className="text-slate-900 font-semibold capitalize">{employee.maritalStatus || "N/A"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Address card */}
                <Card className="border-slate-100 shadow-xs">
                  <CardHeader className="pb-3 border-b border-slate-50">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4.5 w-4.5 text-indigo-600" />
                      <CardTitle className="text-sm font-bold text-slate-800">Primary Address</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3.5 text-xs">
                    {employee.address || employee.city || employee.state ? (
                      <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-400 font-medium">Street</span>
                          <span className="text-slate-900 font-semibold leading-relaxed">
                            {employee.address || "N/A"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-slate-400 font-medium">City & State</span>
                            <span className="text-slate-900 font-semibold">
                              {employee.city || ""}{employee.city && employee.state ? ", " : ""}{employee.state || ""}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-slate-400 font-medium">Country & Zip</span>
                            <span className="text-slate-900 font-semibold">
                              {employee.country || "USA"} {employee.zipCode || ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-400 font-medium">
                        No address register recorded.
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Professional Profile */}
                <Card className="border-slate-100 shadow-xs">
                  <CardHeader className="pb-3 border-b border-slate-50">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4.5 w-4.5 text-indigo-600" />
                      <CardTitle className="text-sm font-bold text-slate-800">Employment Overview</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3.5 text-xs">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-slate-400 font-medium">Employee Code</span>
                      <span className="text-slate-900 font-mono font-bold text-indigo-600">
                        {employee.employeeId || "No ID"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-slate-400 font-medium">Reporting Manager</span>
                      <span className="text-slate-900 font-semibold">
                        {employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : "No direct reporting manager"}
                      </span>
                    </div>
                    {employee.createdAt && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-slate-400 font-medium">Profile Registered</span>
                        <span className="text-slate-900 font-semibold">
                          {new Date(employee.createdAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Financial bank details */}
                <Card className="border-slate-100 shadow-xs">
                  <CardHeader className="pb-3 border-b border-slate-50">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4.5 w-4.5 text-indigo-600" />
                      <CardTitle className="text-sm font-bold text-slate-800">Bank Account Details</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3.5 text-xs">
                    {employee.bankDetails ? (
                      <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-400 font-medium">Bank Name</span>
                          <span className="text-slate-900 font-bold">{employee.bankDetails.bankName || "N/A"}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-slate-400 font-medium">Account Number</span>
                            <span className="text-slate-900 font-mono font-semibold">{employee.bankDetails.accountNumber || "N/A"}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-slate-400 font-medium">IFSC Code</span>
                            <span className="text-slate-900 font-mono font-semibold uppercase">{employee.bankDetails.ifscCode || "N/A"}</span>
                          </div>
                        </div>
                        {employee.bankDetails.accountType && (
                          <div className="flex flex-col gap-1">
                            <span className="text-slate-400 font-medium">Account Type</span>
                            <span className="text-slate-900 font-semibold capitalize">{employee.bankDetails.accountType}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-400 font-medium">
                        No bank accounts linked to profile.
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Emergency contact */}
                <Card className="border-slate-100 shadow-xs">
                  <CardHeader className="pb-3 border-b border-slate-50">
                    <div className="flex items-center gap-2">
                      <HeartPulse className="h-4.5 w-4.5 text-indigo-600" />
                      <CardTitle className="text-sm font-bold text-slate-800">Emergency Contact</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3.5 text-xs">
                    {employee.emergencyContact ? (
                      <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-400 font-medium">Primary Nominee</span>
                          <span className="text-slate-900 font-semibold">{employee.emergencyContact.name || "N/A"}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-slate-400 font-medium">Relationship</span>
                            <span className="text-slate-900 font-semibold capitalize">{employee.emergencyContact.relation || "N/A"}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-slate-400 font-medium">Phone Number</span>
                            <span className="text-slate-900 font-semibold select-all">{employee.emergencyContact.phone || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-400 font-medium">
                        No emergency details specified.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Statutory details (PAN / Aadhar) if present */}
              {(employee.panNumber || employee.aadharNumber) && (
                <Card className="border-slate-100 shadow-xs max-w-2xl">
                  <CardHeader className="pb-3 border-b border-slate-50">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4.5 w-4.5 text-indigo-600" />
                      <CardTitle className="text-sm font-bold text-slate-800">Statutory Identification</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {employee.panNumber && (
                        <div className="flex flex-col gap-1.5 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100">
                          <span className="text-slate-400 font-medium">PAN Card Number</span>
                          <span className="text-slate-900 font-mono font-bold select-all tracking-wider uppercase">
                            {employee.panNumber}
                          </span>
                        </div>
                      )}
                      {employee.aadharNumber && (
                        <div className="flex flex-col gap-1.5 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100">
                          <span className="text-slate-400 font-medium">Aadhar Identity Number</span>
                          <span className="text-slate-900 font-mono font-bold select-all tracking-wider">
                            {formatMaskedAadhar(employee.aadharNumber)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* All Response Data Section (Inspector Mode) - HIDES ALL IDs */}
              <Card className="border-indigo-100/60 bg-indigo-50/10 shadow-sm">
                <CardHeader className="pb-3 border-b border-indigo-100/30">
                  <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200">
                    <BadgeAlert className="h-4.5 w-4.5 text-indigo-600" />
                    <div>
                      <CardTitle className="text-sm font-bold">Comprehensive Attributes Inspector</CardTitle>
                      <CardDescription className="text-[11px] text-slate-400 mt-0.5">
                        Dynamic visualization of all response parameters. Database ID strings are strictly hidden.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {allProperties.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {allProperties.map((field, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-white dark:bg-slate-900 border border-slate-100 rounded-lg flex flex-col gap-1 shadow-2xs hover:border-indigo-200/50 transition-colors"
                        >
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            {field.label}
                          </span>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 break-all select-all leading-normal">
                            {field.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      No extra fields to show in response inspector.
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "financial" && (
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-150">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-indigo-600" />
                    Financial & Identity Parameters
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-450 mt-1">
                    Manage payroll bank accounts, PAN card, and identity documents.
                  </CardDescription>
                </div>
                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="border-slate-200 text-slate-650 hover:text-indigo-600 hover:bg-indigo-50/50 hover:border-indigo-200 transition-all rounded-lg font-semibold"
                  >
                    Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent className="pt-6">
                {apiError && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-600 font-semibold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                    <span>{apiError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveFinancial} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* PAN Card Number */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-600">PAN Card Number</Label>
                      {isEditing ? (
                        <div>
                          <Input
                            value={financialForm.panNumber}
                            onChange={(e) => setFinancialForm({ ...financialForm, panNumber: e.target.value })}
                            placeholder="e.g. ABCDE1234F"
                            className={formErrors.panNumber ? "border-rose-500 focus:ring-rose-500" : ""}
                          />
                          {formErrors.panNumber && (
                            <span className="text-[11px] text-rose-500 mt-1 block font-medium">{formErrors.panNumber}</span>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100 text-slate-900 font-mono font-bold text-xs uppercase tracking-wider">
                          {employee.panNumber || "Not Provided"}
                        </div>
                      )}
                    </div>

                    {/* Aadhar Number */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-600">Aadhar Identity Number</Label>
                      {isEditing ? (
                        <div>
                          <Input
                            value={financialForm.aadharNumber}
                            onChange={(e) => setFinancialForm({ ...financialForm, aadharNumber: e.target.value })}
                            placeholder="12-digit Aadhar number"
                            className={formErrors.aadharNumber ? "border-rose-500 focus:ring-rose-500" : ""}
                          />
                          {formErrors.aadharNumber && (
                            <span className="text-[11px] text-rose-500 mt-1 block font-medium">{formErrors.aadharNumber}</span>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100 text-slate-900 font-mono font-bold text-xs tracking-wider">
                          {formatMaskedAadhar(employee.aadharNumber)}
                        </div>
                      )}
                    </div>

                    {/* Account Type */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-600">Account Type</Label>
                      {isEditing ? (
                        <select
                          value={financialForm.accountType}
                          onChange={(e) => setFinancialForm({ ...financialForm, accountType: e.target.value })}
                          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-hidden focus:ring-1 focus:ring-ring text-xs text-slate-900 font-semibold"
                        >
                          <option value="Savings">Savings</option>
                          <option value="Current">Current</option>
                          <option value="Salary">Salary</option>
                        </select>
                      ) : (
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100 text-slate-900 font-bold text-xs capitalize">
                          {employee.bankDetails?.accountType || "Not Provided"}
                        </div>
                      )}
                    </div>

                    {/* Bank Name */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-600">Bank Name</Label>
                      {isEditing ? (
                        <Input
                          value={financialForm.bankName}
                          onChange={(e) => setFinancialForm({ ...financialForm, bankName: e.target.value })}
                          placeholder="Bank Name"
                        />
                      ) : (
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100 text-slate-900 font-bold text-xs">
                          {employee.bankDetails?.bankName || "Not Provided"}
                        </div>
                      )}
                    </div>

                    {/* Account Number */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-600">Account Number</Label>
                      {isEditing ? (
                        <div className="relative">
                          <Input
                            type={showAccountNumber ? "text" : "password"}
                            value={financialForm.accountNumber}
                            onChange={(e) => setFinancialForm({ ...financialForm, accountNumber: e.target.value })}
                            placeholder="Account Number"
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowAccountNumber(!showAccountNumber)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showAccountNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100 text-slate-900 font-mono font-bold text-xs flex items-center justify-between">
                          <span>
                            {showAccountNumber
                              ? (employee.bankDetails?.accountNumber || "Not Provided")
                              : maskAccountNumber(employee.bankDetails?.accountNumber)}
                          </span>
                          {employee.bankDetails?.accountNumber && (
                            <button
                              type="button"
                              onClick={() => setShowAccountNumber(!showAccountNumber)}
                              className="text-slate-400 hover:text-indigo-650 transition-colors"
                            >
                              {showAccountNumber ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* IFSC / Routing Code */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-600">IFSC / Routing Code</Label>
                      {isEditing ? (
                        <Input
                          value={financialForm.ifscCode}
                          onChange={(e) => setFinancialForm({ ...financialForm, ifscCode: e.target.value })}
                          placeholder="e.g. SBIN0001234"
                        />
                      ) : (
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100 text-slate-900 font-mono font-bold text-xs uppercase tracking-wider">
                          {employee.bankDetails?.ifscCode || "Not Provided"}
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={updateEmployeeMutation.isPending}
                        className="border-slate-200 text-slate-600 font-semibold"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={updateEmployeeMutation.isPending}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2"
                      >
                        {updateEmployeeMutation.isPending && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
