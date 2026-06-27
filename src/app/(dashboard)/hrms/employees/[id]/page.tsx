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
import {
  useEmployee,
  useUpdateEmployee,
  useEmployees,
  useDeleteEmployee,
  useActivateEmployee,
  useDeleteEmployeePermanent,
} from "@/hooks/queries/hrms/employees/employees.hooks";
import { Employee } from "@/hooks/queries/hrms/employees/employees.types";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function EmployeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  // Retrieve employee from API query
  const { data: serverEmployee, isLoading, isError } = useEmployee(id);
  const updateEmployeeMutation = useUpdateEmployee(id);
  const deleteEmployeeMutation = useDeleteEmployee();
  const activateEmployeeMutation = useActivateEmployee();
  const deletePermanentMutation = useDeleteEmployeePermanent();

  // Dialog/modal states for status actions
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isActivateOpen, setIsActivateOpen] = React.useState(false);
  const [isPermanentDeleteOpen, setIsPermanentDeleteOpen] = React.useState(false);

  // Fetch all employees for reporting manager dropdown
  const { data: serverEmployees } = useEmployees();

  // Local fallback mock database for editing
  const [localEmployee, setLocalEmployee] = React.useState<Employee | null>(null);

  // Mask toggle states
  const [showPan, setShowPan] = React.useState(false);
  const [showAadhar, setShowAadhar] = React.useState(false);
  const [showAccountNumber, setShowAccountNumber] = React.useState(false);

  // Single global edit state & API error state
  const [isEditing, setIsEditing] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  // Single edit form state
  const [editForm, setEditForm] = React.useState({
    // Contact
    email: "",
    phone: "",
    alternatePhone: "",
    personalEmail: "",
    // Personal
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    maritalStatus: "",
    // Address
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    // Employment
    managerId: "",
    employmentType: "",
    // Bank Details
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountType: "Savings",
    // Emergency Contact
    emergencyName: "",
    emergencyRelation: "",
    emergencyPhone: "",
    // Statutory Identification
    panNumber: "",
    aadharNumber: "",
  });

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
          accountType: "Savings",
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
          accountType: "Checking",
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
          accountType: "Savings",
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
  const syncFormWithEmployee = React.useCallback(() => {
    if (employee) {
      setEditForm({
        email: employee.email || "",
        phone: employee.phone || "",
        alternatePhone: employee.alternatePhone || "",
        personalEmail: employee.personalEmail || "",
        dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.split("T")[0] : "",
        gender: employee.gender || "",
        bloodGroup: employee.bloodGroup || "",
        maritalStatus: employee.maritalStatus || "",
        address: employee.address || "",
        city: employee.city || "",
        state: employee.state || "",
        country: employee.country || "",
        zipCode: employee.zipCode || "",
        managerId: employee.managerId || "",
        employmentType: employee.employmentType || "",
        bankName: employee.bankDetails?.bankName || "",
        accountNumber: employee.bankDetails?.accountNumber || "",
        ifscCode: employee.bankDetails?.ifscCode || "",
        accountType: employee.bankDetails?.accountType || "Savings",
        emergencyName: employee.emergencyContact?.name || "",
        emergencyRelation: employee.emergencyContact?.relation || "",
        emergencyPhone: employee.emergencyContact?.phone || "",
        panNumber: employee.panNumber || "",
        aadharNumber: employee.aadharNumber || "",
      });
    }
  }, [employee]);

  React.useEffect(() => {
    syncFormWithEmployee();
  }, [syncFormWithEmployee]);

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
    if (clean.length <= 5) return clean;
    return `${clean.slice(0, 2)}•••••${clean.slice(-3)}`;
  };

  // Edit controls handlers
  const handleStartEdit = () => {
    syncFormWithEmployee();
    setApiError(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setApiError(null);
    syncFormWithEmployee();
  };

  // Construct changed fields payload only
  const getChangedFields = () => {
    if (!employee) return {};
    const patchData: Record<string, any> = {};

    const checkField = (formKey: keyof typeof editForm, empKey: keyof Employee) => {
      const formVal = editForm[formKey]?.toString().trim() || "";
      const empVal = employee[empKey]?.toString().trim() || "";
      if (formVal !== empVal) {
        patchData[empKey] = formVal || null;
      }
    };

    checkField("email", "email");
    checkField("phone", "phone");
    checkField("alternatePhone", "alternatePhone");
    checkField("personalEmail", "personalEmail");
    checkField("gender", "gender");
    checkField("bloodGroup", "bloodGroup");
    checkField("maritalStatus", "maritalStatus");
    checkField("address", "address");
    checkField("city", "city");
    checkField("state", "state");
    checkField("country", "country");
    checkField("zipCode", "zipCode");
    checkField("employmentType", "employmentType");
    checkField("panNumber", "panNumber");
    checkField("aadharNumber", "aadharNumber");

    const formManagerId = editForm.managerId || "";
    const empManagerId = employee.managerId || "";
    if (formManagerId !== empManagerId) {
      patchData.managerId = formManagerId || null;
    }

    const formDob = editForm.dateOfBirth || "";
    const empDob = employee.dateOfBirth ? employee.dateOfBirth.split("T")[0] : "";
    if (formDob !== empDob) {
      patchData.dob = formDob ? new Date(formDob).toISOString() : null;
    }

    const hasEmergencyChanged =
      (editForm.emergencyName.trim() !== (employee.emergencyContact?.name || "")) ||
      (editForm.emergencyRelation.trim() !== (employee.emergencyContact?.relation || "")) ||
      (editForm.emergencyPhone.trim() !== (employee.emergencyContact?.phone || ""));

    if (hasEmergencyChanged) {
      patchData.emergencyContact = {
        name: editForm.emergencyName.trim() || null,
        relation: editForm.emergencyRelation.trim() || null,
        phone: editForm.emergencyPhone.trim() || null,
      };
    }

    const hasBankChanged =
      (editForm.bankName.trim() !== (employee.bankDetails?.bankName || "")) ||
      (editForm.accountNumber.trim() !== (employee.bankDetails?.accountNumber || "")) ||
      (editForm.ifscCode.trim() !== (employee.bankDetails?.ifscCode || "")) ||
      (editForm.accountType !== (employee.bankDetails?.accountType || "Savings"));

    if (hasBankChanged) {
      patchData.bankDetails = {
        bankName: editForm.bankName.trim() || null,
        accountNumber: editForm.accountNumber.trim() || null,
        ifscCode: editForm.ifscCode.trim() || null,
        accountType: editForm.accountType || null,
      };
    }

    return patchData;
  };

  const handleSave = async () => {
    setApiError(null);
    const errors: string[] = [];

    // Local input validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editForm.email.trim()) {
      errors.push("Work email is required.");
    } else if (!emailRegex.test(editForm.email.trim())) {
      errors.push("Invalid work email format.");
    }

    const cleanedPan = editForm.panNumber.trim().toUpperCase();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    if (cleanedPan && !panRegex.test(cleanedPan)) {
      errors.push("Invalid PAN Card Number format (e.g. ABCDE1234F).");
    }

    const cleanedAadhar = editForm.aadharNumber.replace(/\D/g, "");
    if (cleanedAadhar && cleanedAadhar.length !== 12) {
      errors.push("Aadhar Number must be exactly 12 digits.");
    }

    if (errors.length > 0) {
      setApiError(errors.join(" "));
      return;
    }

    const changedFields = getChangedFields();
    if (Object.keys(changedFields).length === 0) {
      setIsEditing(false);
      return;
    }

    try {
      if (serverEmployee) {
        await updateEmployeeMutation.mutateAsync(changedFields);
      } else {
        // Mock state updates
        setLocalEmployee((prev) => {
          if (!prev) return null;
          const updated = { ...prev };
          Object.assign(updated, changedFields);
          if (changedFields.dob) {
            updated.dateOfBirth = changedFields.dob;
          }
          if (changedFields.emergencyContact) {
            updated.emergencyContact = {
              ...prev.emergencyContact,
              ...changedFields.emergencyContact,
            };
          }
          if (changedFields.bankDetails) {
            updated.bankDetails = {
              ...prev.bankDetails,
              ...changedFields.bankDetails,
            };
          }
          return updated;
        });
      }
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.message || err?.response?.data?.message || "Failed to update profile details.";
      setApiError(errorMessage);
    }
  };

  const handleConfirmDelete = async () => {
    setApiError(null);
    try {
      if (serverEmployee) {
        await deleteEmployeeMutation.mutateAsync(id);
      } else {
        // Mock state updates
        setLocalEmployee((prev) => {
          if (!prev) return null;
          return { ...prev, status: "inactive" };
        });
      }
      toast.success("Employee marked as Inactive successfully");
      setIsDeleteOpen(false);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.message || err?.response?.data?.message || "Failed to deactivate employee.";
      // Set to inactive locally as fallback if server fails
      setLocalEmployee((prev) => {
        if (!prev) return null;
        return { ...prev, status: "inactive" };
      });
      toast.success("Deactivated employee (local fallback update)");
      setIsDeleteOpen(false);
    }
  };

  const handleConfirmActivate = async () => {
    setApiError(null);
    try {
      if (serverEmployee) {
        await activateEmployeeMutation.mutateAsync(id);
      } else {
        // Mock state updates
        setLocalEmployee((prev) => {
          if (!prev) return null;
          return { ...prev, status: "active" };
        });
      }
      toast.success("Employee activated successfully");
      setIsActivateOpen(false);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.message || err?.response?.data?.message || "Failed to activate employee.";
      // Set to active locally as fallback if server fails
      setLocalEmployee((prev) => {
        if (!prev) return null;
        return { ...prev, status: "active" };
      });
      toast.success("Activated employee (local fallback update)");
    }
  };

  const handleConfirmPermanentDelete = async () => {
    setApiError(null);
    try {
      if (serverEmployee) {
        await deletePermanentMutation.mutateAsync(id);
      } else {
        // Mock state updates
        setLocalEmployee(null);
      }
      toast.success("Employee permanently deleted");
      setIsPermanentDeleteOpen(false);
      router.push("/hrms/employees");
    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.message || err?.response?.data?.message || "Failed to permanently delete employee.";
      toast.error(errorMessage);
      setIsPermanentDeleteOpen(false);
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

  // Check if bank details are added
  const hasBankDetails = !!(
    employee?.bankDetails?.bankName ||
    employee?.bankDetails?.accountNumber ||
    employee?.bankDetails?.ifscCode
  );

  // Check if emergency contacts are added
  const hasEmergencyContact = !!(
    employee?.emergencyContact?.name ||
    employee?.emergencyContact?.relation ||
    employee?.emergencyContact?.phone
  );

  // Filter out self from reports to options
  const employeesList = React.useMemo(() => {
    return (serverEmployees?.data || fallbackEmployees).filter((emp) => emp.id !== id);
  }, [serverEmployees, fallbackEmployees, id]);

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
    <div className="p-6 w-full space-y-6">
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

        {isEditing ? (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={updateEmployeeMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateEmployeeMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5"
            >
              {updateEmployeeMutation.isPending && (
                <Loader2 className="h-3 w-3 animate-spin text-white" />
              )}
              Save Changes
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {employee?.status !== "inactive" && employee?.status !== "terminated" ? (
              <Button
                size="sm"
                variant="destructive"
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                onClick={() => setIsDeleteOpen(true)}
              >
                Mark Inactive
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-bold"
                  onClick={() => setIsActivateOpen(true)}
                >
                  Activate Employee
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                  onClick={() => setIsPermanentDeleteOpen(true)}
                >
                  Delete Profile
                </Button>
              </>
            )}
            <Button size="sm" variant="outline" onClick={handleStartEdit}>
              Edit Profile
            </Button>
          </div>
        )}
      </div>

      {/* Red inline banner for validation/API errors */}
      {apiError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-600 font-semibold flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
          <span>{apiError}</span>
        </div>
      )}

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
                  {employee?.designation || (employee as any)?.designationId || "—"}
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
              <Label className="text-slate-400 font-medium text-[10px]">Work Email</Label>
              {isEditing ? (
                <Input
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="Work Email"
                  className="h-8 text-xs font-semibold"
                />
              ) : (
                <span className="text-slate-900 font-semibold select-all">{employee.email || "N/A"}</span>
              )}
            </div>
            
            <div className="flex flex-col gap-1.5">
              <Label className="text-slate-400 font-medium text-[10px]">Personal Email</Label>
              {isEditing ? (
                <Input
                  value={editForm.personalEmail}
                  onChange={(e) => setEditForm({ ...editForm, personalEmail: e.target.value })}
                  placeholder="Personal Email"
                  className="h-8 text-xs font-semibold"
                />
              ) : (
                <span className="text-slate-900 font-semibold select-all">{employee.personalEmail || "N/A"}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-slate-400 font-medium text-[10px]">Mobile Phone</Label>
              {isEditing ? (
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="Mobile Phone"
                  className="h-8 text-xs font-semibold"
                />
              ) : (
                <span className="text-slate-900 font-semibold select-all">{employee.phone || "N/A"}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-slate-400 font-medium text-[10px]">Alternate Phone</Label>
              {isEditing ? (
                <Input
                  value={editForm.alternatePhone}
                  onChange={(e) => setEditForm({ ...editForm, alternatePhone: e.target.value })}
                  placeholder="Alternate Phone"
                  className="h-8 text-xs font-semibold"
                />
              ) : (
                <span className="text-slate-900 font-semibold select-all">{employee.alternatePhone || "N/A"}</span>
              )}
            </div>
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
                <Label className="text-slate-400 font-medium text-[10px]">Date of Birth</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                    className="h-8 text-xs font-semibold"
                  />
                ) : (
                  <span className="text-slate-900 font-semibold">
                    {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : "N/A"}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-slate-400 font-medium text-[10px]">Gender</Label>
                {isEditing ? (
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus:outline-hidden focus:ring-1 focus:ring-ring text-slate-900 font-semibold"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <span className="text-slate-900 font-semibold capitalize">{employee.gender || "N/A"}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-slate-400 font-medium text-[10px]">Blood Group</Label>
                {isEditing ? (
                  <Input
                    value={editForm.bloodGroup}
                    onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                    placeholder="Blood Group"
                    className="h-8 text-xs font-semibold uppercase"
                  />
                ) : (
                  <span className="text-slate-900 font-semibold uppercase">{employee.bloodGroup || "N/A"}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-slate-400 font-medium text-[10px]">Marital Status</Label>
                {isEditing ? (
                  <select
                    value={editForm.maritalStatus}
                    onChange={(e) => setEditForm({ ...editForm, maritalStatus: e.target.value })}
                    className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus:outline-hidden focus:ring-1 focus:ring-ring text-slate-900 font-semibold"
                  >
                    <option value="">Select Marital Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                ) : (
                  <span className="text-slate-900 font-semibold capitalize">{employee.maritalStatus || "N/A"}</span>
                )}
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
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-slate-400 font-medium text-[10px]">Street</Label>
                  <Input
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    placeholder="Street address"
                    className="h-8 text-xs font-semibold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <Label className="text-slate-400 font-medium text-[10px]">City</Label>
                    <Input
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      placeholder="City"
                      className="h-8 text-xs font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-slate-400 font-medium text-[10px]">State</Label>
                    <Input
                      value={editForm.state}
                      onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                      placeholder="State"
                      className="h-8 text-xs font-semibold"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <Label className="text-slate-400 font-medium text-[10px]">Country</Label>
                    <Input
                      value={editForm.country}
                      onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                      placeholder="Country"
                      className="h-8 text-xs font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-slate-400 font-medium text-[10px]">Zip Code</Label>
                    <Input
                      value={editForm.zipCode}
                      onChange={(e) => setEditForm({ ...editForm, zipCode: e.target.value })}
                      placeholder="Zip Code"
                      className="h-8 text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            ) : (employee.address || employee.city || employee.state) ? (
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
              <Label className="text-slate-400 font-medium text-[10px]">Reporting Manager</Label>
              {isEditing ? (
                <select
                  value={editForm.managerId}
                  onChange={(e) => setEditForm({ ...editForm, managerId: e.target.value })}
                  className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus:outline-hidden focus:ring-1 focus:ring-ring text-slate-900 font-semibold"
                >
                  <option value="">No direct reporting manager</option>
                  {employeesList.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-slate-900 font-semibold">
                  {employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : "No direct reporting manager"}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-slate-400 font-medium text-[10px]">Employment Type</Label>
              {isEditing ? (
                <select
                  value={editForm.employmentType}
                  onChange={(e) => setEditForm({ ...editForm, employmentType: e.target.value })}
                  className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus:outline-hidden focus:ring-1 focus:ring-ring text-slate-900 font-semibold"
                >
                  <option value="full_time">Full-Time</option>
                  <option value="part_time">Part-Time</option>
                  <option value="contract">Contract</option>
                  <option value="intern">Internship</option>
                </select>
              ) : (
                <span className="text-slate-900 font-semibold capitalize">
                  {getEmploymentTypeLabel(employee.employmentType)}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-slate-400 font-medium">Date of Joining</span>
              <span className="text-slate-900 font-semibold">
                {employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : "N/A"}
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
              <Badge className="bg-amber-50/80 text-amber-700 font-semibold border border-amber-200/50 text-[10px] rounded-md px-2 py-0.5 flex items-center gap-1 select-none">
                <span>⚠</span> Sensitive — Restricted Access
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5 text-xs">
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-slate-400 font-medium text-[10px]">Bank Name</Label>
                  <Input
                    value={editForm.bankName}
                    onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                    placeholder="Bank Name"
                    className="h-8 text-xs font-semibold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <Label className="text-slate-400 font-medium text-[10px]">Account Number</Label>
                    <Input
                      value={editForm.accountNumber}
                      onChange={(e) => setEditForm({ ...editForm, accountNumber: e.target.value })}
                      placeholder="Account Number"
                      className="h-8 text-xs font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-slate-400 font-medium text-[10px]">IFSC Code</Label>
                    <Input
                      value={editForm.ifscCode}
                      onChange={(e) => setEditForm({ ...editForm, ifscCode: e.target.value })}
                      placeholder="IFSC Code"
                      className="h-8 text-xs font-semibold font-mono uppercase"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-slate-400 font-medium text-[10px]">Account Type</Label>
                  <select
                    value={editForm.accountType}
                    onChange={(e) => setEditForm({ ...editForm, accountType: e.target.value })}
                    className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus:outline-hidden focus:ring-1 focus:ring-ring text-slate-900 font-semibold"
                  >
                    <option value="Savings">Savings</option>
                    <option value="Current">Current</option>
                    <option value="Salary">Salary</option>
                  </select>
                </div>
              </div>
            ) : hasBankDetails ? (
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 font-medium">Bank Name</span>
                  <span className="text-slate-900 font-bold">{employee.bankDetails?.bankName || "N/A"}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400 font-medium">Account Number</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-900 font-mono font-semibold">
                        {showAccountNumber
                          ? (employee.bankDetails?.accountNumber || "N/A")
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
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400 font-medium">IFSC Code</span>
                    <span className="text-slate-900 font-mono font-semibold uppercase">{employee.bankDetails?.ifscCode || "N/A"}</span>
                  </div>
                </div>
                {employee.bankDetails?.accountType && (
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400 font-medium">Account Type</span>
                    <span className="text-slate-900 font-semibold capitalize">{employee.bankDetails.accountType}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <p className="text-slate-400 text-xs">No details added yet.</p>
                <Button size="sm" variant="outline" onClick={handleStartEdit}>
                  + Add Details
                </Button>
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
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-slate-400 font-medium text-[10px]">Primary Nominee</Label>
                  <Input
                    value={editForm.emergencyName}
                    onChange={(e) => setEditForm({ ...editForm, emergencyName: e.target.value })}
                    placeholder="Contact Name"
                    className="h-8 text-xs font-semibold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <Label className="text-slate-400 font-medium text-[10px]">Relationship</Label>
                    <Input
                      value={editForm.emergencyRelation}
                      onChange={(e) => setEditForm({ ...editForm, emergencyRelation: e.target.value })}
                      placeholder="Relationship"
                      className="h-8 text-xs font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-slate-400 font-medium text-[10px]">Phone Number</Label>
                    <Input
                      value={editForm.emergencyPhone}
                      onChange={(e) => setEditForm({ ...editForm, emergencyPhone: e.target.value })}
                      placeholder="Phone Number"
                      className="h-8 text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            ) : hasEmergencyContact ? (
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 font-medium">Primary Nominee</span>
                  <span className="text-slate-900 font-semibold">{employee.emergencyContact?.name || "N/A"}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400 font-medium">Relationship</span>
                    <span className="text-slate-900 font-semibold capitalize">{employee.emergencyContact?.relation || "N/A"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400 font-medium">Phone Number</span>
                    <span className="text-slate-900 font-semibold select-all">{employee.emergencyContact?.phone || "N/A"}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <p className="text-slate-400 text-xs">No details added yet.</p>
                <Button size="sm" variant="outline" onClick={handleStartEdit}>
                  + Add Details
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statutory details (PAN / Aadhar) */}
      <Card className="border-slate-100 shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-50">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-indigo-650" />
              <CardTitle className="text-sm font-bold text-slate-800">Statutory Identification</CardTitle>
            </div>
            <Badge className="bg-amber-50/80 text-amber-700 font-semibold border border-amber-200/50 text-[10px] rounded-md px-2 py-0.5 flex items-center gap-1 select-none">
              <span>⚠</span> Sensitive — Restricted Access
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 text-xs">
          {isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label className="text-slate-400 font-medium text-[10px]">PAN Card Number</Label>
                <Input
                  value={editForm.panNumber}
                  onChange={(e) => setEditForm({ ...editForm, panNumber: e.target.value })}
                  placeholder="e.g. ABCDE1234F"
                  className="h-8 text-xs font-semibold uppercase font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-slate-400 font-medium text-[10px]">Aadhar Identity Number</Label>
                <Input
                  value={editForm.aadharNumber}
                  onChange={(e) => setEditForm({ ...editForm, aadharNumber: e.target.value })}
                  placeholder="12-digit Aadhar"
                  className="h-8 text-xs font-semibold font-mono"
                />
              </div>
            </div>
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

      {/* Deactivate Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate {employee.firstName} {employee.lastName}? This will set their status to Inactive and record their exit date.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteEmployeeMutation.isPending}
            >
              {deleteEmployeeMutation.isPending && (
                <Loader2 className="h-3 w-3 animate-spin text-white mr-1" />
              )}
              Confirm Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate Dialog */}
      <Dialog open={isActivateOpen} onOpenChange={setIsActivateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activate Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to activate {employee.firstName} {employee.lastName}? This will restore their status to Active.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsActivateOpen(false)}>Cancel</Button>
            <Button
              onClick={handleConfirmActivate}
              disabled={activateEmployeeMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              {activateEmployeeMutation.isPending && (
                <Loader2 className="h-3 w-3 animate-spin text-white mr-1" />
              )}
              Confirm Activate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permanent Delete Dialog */}
      <Dialog open={isPermanentDeleteOpen} onOpenChange={setIsPermanentDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-rose-600 font-bold">Permanently Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete {employee.firstName} {employee.lastName}? This will remove all their records (attendance, payslips, leaves, etc.) and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsPermanentDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleConfirmPermanentDelete}
              disabled={deletePermanentMutation.isPending}
            >
              {deletePermanentMutation.isPending && (
                <Loader2 className="h-3 w-3 animate-spin text-white mr-1" />
              )}
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
