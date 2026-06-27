"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  CreditCard,
  HeartPulse,
  User,
  MapPin,
  Mail,
  Activity,
  FileText,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

  // Local fallback mock database for editing
  const [localEmployee, setLocalEmployee] = React.useState<Employee | null>(null);

  // Mask toggle states
  const [showPan, setShowPan] = React.useState(false);
  const [showAadhar, setShowAadhar] = React.useState(false);
  const [showAccountNumber, setShowAccountNumber] = React.useState(false);

  // Edit states for separate sections
  const [isEditingBank, setIsEditingBank] = React.useState(false);
  const [isEditingStatutory, setIsEditingStatutory] = React.useState(false);

  // Form states
  const [bankForm, setBankForm] = React.useState({
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountType: "Savings",
  });

  const [statutoryForm, setStatutoryForm] = React.useState({
    panNumber: "",
    aadharNumber: "",
  });

  // Section specific error states
  const [bankErrors, setBankErrors] = React.useState<Record<string, string>>({});
  const [statutoryErrors, setStatutoryErrors] = React.useState<Record<string, string>>({});

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
        aadharNumber: "123456789012",
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
        aadharNumber: "567812349012",
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
        aadharNumber: "901234567812",
        createdAt: "2025-01-20T00:00:00Z",
        updatedAt: "2025-01-20T00:00:00Z",
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

  // Sync form states with latest employee details
  React.useEffect(() => {
    if (employee) {
      setBankForm({
        bankName: employee.bankDetails?.bankName || "",
        accountNumber: employee.bankDetails?.accountNumber || "",
        ifscCode: employee.bankDetails?.ifscCode || "",
        accountType: employee.bankDetails?.accountType || "Savings",
      });
      setStatutoryForm({
        panNumber: employee.panNumber || "",
        aadharNumber: employee.aadharNumber || "",
      });
    }
  }, [employee]);

  // Sensitive Field Masking Functions
  const maskAccountNumber = (val?: string) => {
    if (!val) return "Not Provided";
    const clean = val.trim();
    if (clean.length <= 4) return clean;
    return `•••• •••• ${clean.slice(-4)}`;
  };

  const maskAadharNumber = (val?: string) => {
    if (!val) return "Not Provided";
    const clean = val.replace(/\D/g, "");
    if (clean.length <= 4) return val;
    return `•••• •••• ${clean.slice(-4)}`;
  };

  const maskPanNumber = (val?: string) => {
    if (!val) return "Not Provided";
    const clean = val.trim().toUpperCase();
    if (clean.length <= 6) return clean;
    return `${clean.slice(0, 2)}••••${clean.slice(-4)}`;
  };

  // Bank edit handlers
  const handleStartEditBank = () => {
    if (employee) {
      setBankForm({
        bankName: employee.bankDetails?.bankName || "",
        accountNumber: employee.bankDetails?.accountNumber || "",
        ifscCode: employee.bankDetails?.ifscCode || "",
        accountType: employee.bankDetails?.accountType || "Savings",
      });
    }
    setIsEditingBank(true);
    setBankErrors({});
  };

  const handleCancelBank = () => {
    setIsEditingBank(false);
    setBankErrors({});
    if (employee) {
      setBankForm({
        bankName: employee.bankDetails?.bankName || "",
        accountNumber: employee.bankDetails?.accountNumber || "",
        ifscCode: employee.bankDetails?.ifscCode || "",
        accountType: employee.bankDetails?.accountType || "Savings",
      });
    }
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setBankErrors({});

    const payload = {
      bankDetails: {
        bankName: bankForm.bankName.trim(),
        accountNumber: bankForm.accountNumber.trim(),
        ifscCode: bankForm.ifscCode.trim(),
        accountType: bankForm.accountType,
      }
    };

    try {
      if (serverEmployee) {
        await updateEmployeeMutation.mutateAsync(payload);
        toast.success("Bank account details saved successfully.");
      } else {
        setLocalEmployee((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            bankDetails: payload.bankDetails,
          };
        });
        toast.success("Saved changes locally (Mock Mode).");
      }
      setIsEditingBank(false);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.message || err?.response?.data?.message || "Failed to save bank details.";
      setBankErrors({ api: errorMessage });
      toast.error("Error saving bank details. Please try again.");
    }
  };

  // Statutory edit handlers
  const handleStartEditStatutory = () => {
    if (employee) {
      setStatutoryForm({
        panNumber: employee.panNumber || "",
        aadharNumber: employee.aadharNumber || "",
      });
    }
    setIsEditingStatutory(true);
    setStatutoryErrors({});
  };

  const handleCancelStatutory = () => {
    setIsEditingStatutory(false);
    setStatutoryErrors({});
    if (employee) {
      setStatutoryForm({
        panNumber: employee.panNumber || "",
        aadharNumber: employee.aadharNumber || "",
      });
    }
  };

  const handleSaveStatutory = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatutoryErrors({});

    const errors: Record<string, string> = {};
    const cleanedPan = statutoryForm.panNumber.trim().toUpperCase();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    if (cleanedPan && !panRegex.test(cleanedPan)) {
      errors.panNumber = "Invalid PAN Card Number format (e.g. ABCDE1234F)";
    }

    const cleanedAadhar = statutoryForm.aadharNumber.replace(/\D/g, "");
    if (cleanedAadhar && cleanedAadhar.length !== 12) {
      errors.aadharNumber = "Aadhar Number must be exactly 12 digits";
    }

    if (Object.keys(errors).length > 0) {
      setStatutoryErrors(errors);
      return;
    }

    const payload = {
      panNumber: cleanedPan,
      aadharNumber: statutoryForm.aadharNumber.trim(),
    };

    try {
      if (serverEmployee) {
        await updateEmployeeMutation.mutateAsync(payload);
        toast.success("Statutory identification details saved successfully.");
      } else {
        setLocalEmployee((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            panNumber: payload.panNumber,
            aadharNumber: payload.aadharNumber,
          };
        });
        toast.success("Saved changes locally (Mock Mode).");
      }
      setIsEditingStatutory(false);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.message || err?.response?.data?.message || "Failed to save statutory details.";
      setStatutoryErrors({ api: errorMessage });
      toast.error("Error saving statutory details. Please try again.");
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

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/hrms/employees")}
          className="gap-2 border-slate-200 text-slate-600 hover:text-indigo-650 hover:bg-indigo-50/50 hover:border-indigo-200 transition-all rounded-lg"
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

      {/* Grid of structured detailed info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Contact details */}
        <Card className="border-slate-100 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <Mail className="h-4.5 w-4.5 text-indigo-650" />
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
              <User className="h-4.5 w-4.5 text-indigo-650" />
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
              <MapPin className="h-4.5 w-4.5 text-indigo-650" />
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
              <Activity className="h-4.5 w-4.5 text-indigo-650" />
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
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4.5 w-4.5 text-indigo-650" />
                <CardTitle className="text-sm font-bold text-slate-800">Bank Account Details</CardTitle>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-amber-50/80 text-amber-700 font-semibold border border-amber-200/50 text-[10px] rounded-md px-2 py-0.5 flex items-center gap-1 select-none">
                  <span>⚠</span> Sensitive — Restricted Access
                </Badge>
                {!isEditingBank && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleStartEditBank}
                    className="h-7 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 rounded-md px-2.5 font-bold"
                  >
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5 text-xs">
            {isEditingBank ? (
              <form onSubmit={handleSaveBank} className="space-y-4">
                {bankErrors.api && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-600 font-semibold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                    <span>{bankErrors.api}</span>
                  </div>
                )}
                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <Label className="text-slate-400 font-medium text-[10px]">Bank Name</Label>
                    <Input
                      value={bankForm.bankName}
                      onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                      placeholder="Bank Name"
                      className="h-8 text-xs font-semibold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <Label className="text-slate-400 font-medium text-[10px]">Account Number</Label>
                      <div className="relative">
                        <Input
                          type={showAccountNumber ? "text" : "password"}
                          value={bankForm.accountNumber}
                          onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                          placeholder="Account Number"
                          className="h-8 text-xs font-semibold pr-8"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAccountNumber(!showAccountNumber)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-650 transition-colors"
                        >
                          {showAccountNumber ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-slate-400 font-medium text-[10px]">IFSC Code</Label>
                      <Input
                        value={bankForm.ifscCode}
                        onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value })}
                        placeholder="IFSC Code"
                        className="h-8 text-xs font-semibold font-mono uppercase"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-slate-400 font-medium text-[10px]">Account Type</Label>
                    <select
                      value={bankForm.accountType}
                      onChange={(e) => setBankForm({ ...bankForm, accountType: e.target.value })}
                      className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus:outline-hidden focus:ring-1 focus:ring-ring text-slate-900 font-semibold"
                    >
                      <option value="Savings">Savings</option>
                      <option value="Current">Current</option>
                      <option value="Salary">Salary</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCancelBank}
                      disabled={updateEmployeeMutation.isPending}
                      className="h-7 text-[11px] px-2.5 font-bold"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={updateEmployeeMutation.isPending}
                      className="h-7 text-[11px] px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1"
                    >
                      {updateEmployeeMutation.isPending && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      )}
                      Save
                    </Button>
                  </div>
                </div>
              </form>
            ) : employee.bankDetails ? (
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 font-medium">Bank Name</span>
                  <span className="text-slate-900 font-bold">{employee.bankDetails.bankName || "N/A"}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400 font-medium">Account Number</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-900 font-mono font-semibold">
                        {showAccountNumber
                          ? (employee.bankDetails.accountNumber || "N/A")
                          : maskAccountNumber(employee.bankDetails.accountNumber)}
                      </span>
                      {employee.bankDetails.accountNumber && (
                        <button
                          type="button"
                          onClick={() => setShowAccountNumber(!showAccountNumber)}
                          className="text-slate-400 hover:text-indigo-650 transition-colors"
                        >
                          {showAccountNumber ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      )}
                    </div>
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
              <HeartPulse className="h-4.5 w-4.5 text-indigo-650" />
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

      {/* Statutory details (PAN / Aadhar) */}
      <Card className="border-slate-100 shadow-xs max-w-2xl">
        <CardHeader className="pb-3 border-b border-slate-50">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-indigo-650" />
              <CardTitle className="text-sm font-bold text-slate-800">Statutory Identification</CardTitle>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-amber-50/80 text-amber-700 font-semibold border border-amber-200/50 text-[10px] rounded-md px-2 py-0.5 flex items-center gap-1 select-none">
                <span>⚠</span> Sensitive — Restricted Access
              </Badge>
              {!isEditingStatutory && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleStartEditStatutory}
                  className="h-7 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 rounded-md px-2.5 font-bold"
                >
                  Edit
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 text-xs">
          {isEditingStatutory ? (
            <form onSubmit={handleSaveStatutory} className="space-y-4">
              {statutoryErrors.api && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-600 font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                  <span>{statutoryErrors.api}</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <Label className="text-slate-400 font-medium text-[10px]">PAN Card Number</Label>
                  <Input
                    value={statutoryForm.panNumber}
                    onChange={(e) => setStatutoryForm({ ...statutoryForm, panNumber: e.target.value })}
                    placeholder="e.g. ABCDE1234F"
                    className={cn("h-8 text-xs font-semibold uppercase font-mono", statutoryErrors.panNumber && "border-rose-500")}
                  />
                  {statutoryErrors.panNumber && (
                    <span className="text-[10px] text-rose-500 mt-1 font-medium">{statutoryErrors.panNumber}</span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-slate-400 font-medium text-[10px]">Aadhar Identity Number</Label>
                  <Input
                    value={statutoryForm.aadharNumber}
                    onChange={(e) => setStatutoryForm({ ...statutoryForm, aadharNumber: e.target.value })}
                    placeholder="12-digit Aadhar"
                    className={cn("h-8 text-xs font-semibold font-mono", statutoryErrors.aadharNumber && "border-rose-500")}
                  />
                  {statutoryErrors.aadharNumber && (
                    <span className="text-[10px] text-rose-500 mt-1 font-medium">{statutoryErrors.aadharNumber}</span>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancelStatutory}
                  disabled={updateEmployeeMutation.isPending}
                  className="h-7 text-[11px] px-2.5 font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={updateEmployeeMutation.isPending}
                  className="h-7 text-[11px] px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1"
                >
                  {updateEmployeeMutation.isPending && (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  )}
                  Save
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100">
                <span className="text-slate-400 font-medium">PAN Card Number</span>
                <div className="flex items-center justify-between">
                  <span className="text-slate-900 font-mono font-bold tracking-wider uppercase">
                    {showPan
                      ? (employee.panNumber || "Not Provided")
                      : maskPanNumber(employee.panNumber)}
                  </span>
                  {employee.panNumber && (
                    <button
                      type="button"
                      onClick={() => setShowPan(!showPan)}
                      className="text-slate-400 hover:text-indigo-650 transition-colors"
                    >
                      {showPan ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100">
                <span className="text-slate-400 font-medium">Aadhar Identity Number</span>
                <div className="flex items-center justify-between">
                  <span className="text-slate-900 font-mono font-bold tracking-wider">
                    {showAadhar
                      ? (employee.aadharNumber || "Not Provided")
                      : maskAadharNumber(employee.aadharNumber)}
                  </span>
                  {employee.aadharNumber && (
                    <button
                      type="button"
                      onClick={() => setShowAadhar(!showAadhar)}
                      className="text-slate-400 hover:text-indigo-650 transition-colors"
                    >
                      {showAadhar ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
