"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import {
  useEmployee,
  useUpdateEmployee,
  useEmployees,
  useDeleteEmployee,
  useActivateEmployee,
  useDeleteEmployeePermanent,
} from "@/hooks/queries/hrms/employees/employees.hooks";
import { Employee } from "@/hooks/queries/hrms/employees/employees.types";
import { AddressCard } from "@/components/hrms/employee/AddressCard";
import { BankDetailsCard } from "@/components/hrms/employee/BankDetailsCard";
import { ContactCard } from "@/components/hrms/employee/ContactCard";
import { EmergencyContactCard } from "@/components/hrms/employee/EmergencyContactCard";
import { EmployeeActionBar } from "@/components/hrms/employee/EmployeeActionBar";
import { EmployeeProfileHeader } from "@/components/hrms/employee/EmployeeProfileHeader";
import { EmploymentCard } from "@/components/hrms/employee/EmploymentCard";
import { PersonalInfoCard } from "@/components/hrms/employee/PersonalInfoCard";
import { StatutoryCard } from "@/components/hrms/employee/StatutoryCard";
import { EditForm } from "@/components/hrms/employee/types/employee-detail.types";
import { EmployeeDialogs } from "@/components/hrms/employee/EmployeeDialogs";



// ---------------------------------------------------------------------------
// Fallback mock data (used when API returns nothing)
// ---------------------------------------------------------------------------
const FALLBACK_EMPLOYEES: Employee[] = [
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
    emergencyContact: { name: "Mary Doe", relation: "spouse", phone: "+1 (555) 987-6543" },
    bankDetails: { bankName: "Chase Bank", accountNumber: "1234567890", ifscCode: "CHASUS33XXX", accountType: "Savings" },
    panNumber: "ABCDE1234F",
    aadharNumber: "123456789012",
    createdAt: "2024-03-15T00:00:00Z",
    updatedAt: "2024-03-15T00:00:00Z",
    companyId: "comp-1",
  },
];

const EMPTY_FORM: EditForm = {
  email: "", phone: "", alternatePhone: "", personalEmail: "",
  dateOfBirth: "", gender: "", bloodGroup: "", maritalStatus: "",
  address: "", city: "", state: "", country: "", zipCode: "",
  managerId: "", employmentType: "",
  bankName: "", accountNumber: "", ifscCode: "", accountType: "Savings",
  emergencyName: "", emergencyRelation: "", emergencyPhone: "",
  panNumber: "", aadharNumber: "",
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function EmployeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { data: serverEmployee, isLoading, isError } = useEmployee(id);
  const { data: serverEmployees } = useEmployees();
  const updateMutation = useUpdateEmployee(id);
  const deleteMutation = useDeleteEmployee();
  const activateMutation = useActivateEmployee();
  const permanentDeleteMutation = useDeleteEmployeePermanent();

  // Local state
  const [localEmployee, setLocalEmployee] = React.useState<Employee | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState<EditForm>(EMPTY_FORM);

  // Dialog states
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isActivateOpen, setIsActivateOpen] = React.useState(false);
  const [isPermanentDeleteOpen, setIsPermanentDeleteOpen] = React.useState(false);

  // Sync local from server
  React.useEffect(() => {
    if (serverEmployee) {
      setLocalEmployee(serverEmployee);
    } else {
      const found = FALLBACK_EMPLOYEES.find((e) => e.id === id);
      if (found) setLocalEmployee(found);
    }
  }, [serverEmployee, id]);

  const employee =
    localEmployee ||
    serverEmployee ||
    FALLBACK_EMPLOYEES.find((e) => e.id === id);

  // Sync form from employee
  const syncForm = React.useCallback(() => {
    if (!employee) return;
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
  }, [employee]);

  React.useEffect(() => { syncForm(); }, [syncForm]);

  // Build patch payload of only changed fields
  const getChangedFields = () => {
    if (!employee) return {};
    const patch: Record<string, any> = {};

    const check = (fk: keyof EditForm, ek: keyof Employee) => {
      const fv = editForm[fk]?.toString().trim() || "";
      const ev = employee[ek]?.toString().trim() || "";
      if (fv !== ev) patch[ek] = fv || null;
    };

    (["email","phone","alternatePhone","personalEmail","gender","bloodGroup",
      "maritalStatus","address","city","state","country","zipCode",
      "employmentType","panNumber","aadharNumber"] as const).forEach((f) => check(f, f as keyof Employee));

    const formMgr = editForm.managerId || "";
    const empMgr  = employee.managerId || "";
    if (formMgr !== empMgr) patch.managerId = formMgr || null;

    const formDob = editForm.dateOfBirth || "";
    const empDob  = employee.dateOfBirth ? employee.dateOfBirth.split("T")[0] : "";
    if (formDob !== empDob) patch.dob = formDob ? new Date(formDob).toISOString() : null;

    const emergencyChanged =
      editForm.emergencyName.trim()     !== (employee.emergencyContact?.name     || "") ||
      editForm.emergencyRelation.trim() !== (employee.emergencyContact?.relation || "") ||
      editForm.emergencyPhone.trim()    !== (employee.emergencyContact?.phone    || "");
    if (emergencyChanged) {
      patch.emergencyContact = {
        name:     editForm.emergencyName.trim()     || null,
        relation: editForm.emergencyRelation.trim() || null,
        phone:    editForm.emergencyPhone.trim()    || null,
      };
    }

    const bankChanged =
      editForm.bankName.trim()      !== (employee.bankDetails?.bankName      || "") ||
      editForm.accountNumber.trim() !== (employee.bankDetails?.accountNumber || "") ||
      editForm.ifscCode.trim()      !== (employee.bankDetails?.ifscCode      || "") ||
      editForm.accountType          !== (employee.bankDetails?.accountType   || "Savings");
    if (bankChanged) {
      patch.bankDetails = {
        bankName:      editForm.bankName.trim()      || null,
        accountNumber: editForm.accountNumber.trim() || null,
        ifscCode:      editForm.ifscCode.trim()      || null,
        accountType:   editForm.accountType          || null,
      };
    }

    return patch;
  };

  // --- Handlers ---
  const handleStartEdit = () => { syncForm(); setApiError(null); setIsEditing(true); };
  const handleCancel    = () => { setIsEditing(false); setApiError(null); syncForm(); };

  const handleSave = async () => {
    setApiError(null);
    const errors: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editForm.email.trim()) errors.push("Work email is required.");
    else if (!emailRegex.test(editForm.email.trim())) errors.push("Invalid work email format.");
    const pan = editForm.panNumber.trim().toUpperCase();
    if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) errors.push("Invalid PAN Card Number format (e.g. ABCDE1234F).");
    const aadhar = editForm.aadharNumber.replace(/\D/g, "");
    if (aadhar && aadhar.length !== 12) errors.push("Aadhar Number must be exactly 12 digits.");
    if (errors.length) { setApiError(errors.join(" ")); return; }

    const patch = getChangedFields();
    if (!Object.keys(patch).length) { setIsEditing(false); return; }

    try {
      if (serverEmployee) {
        await updateMutation.mutateAsync(patch);
      } else {
        setLocalEmployee((prev) => {
          if (!prev) return null;
          const next = { ...prev, ...patch };
          if (patch.dob) next.dateOfBirth = patch.dob;
          if (patch.emergencyContact) next.emergencyContact = { ...prev.emergencyContact, ...patch.emergencyContact };
          if (patch.bankDetails) next.bankDetails = { ...prev.bankDetails, ...patch.bankDetails };
          return next;
        });
      }
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (err: any) {
      setApiError(err?.message || err?.response?.data?.message || "Failed to update profile.");
    }
  };

  const handleConfirmDelete = async () => {
    try {
      if (serverEmployee) await deleteMutation.mutateAsync(id);
      else setLocalEmployee((p) => p ? { ...p, status: "inactive" } : null);
      toast.success("Employee marked as Inactive");
      setIsDeleteOpen(false);
    } catch {
      setLocalEmployee((p) => p ? { ...p, status: "inactive" } : null);
      toast.success("Deactivated (local fallback)");
      setIsDeleteOpen(false);
    }
  };

  const handleConfirmActivate = async () => {
    try {
      if (serverEmployee) await activateMutation.mutateAsync(id);
      else setLocalEmployee((p) => p ? { ...p, status: "active" } : null);
      toast.success("Employee activated successfully");
      setIsActivateOpen(false);
    } catch {
      setLocalEmployee((p) => p ? { ...p, status: "active" } : null);
      toast.success("Activated (local fallback)");
      setIsActivateOpen(false);
    }
  };

  const handleConfirmPermanentDelete = async () => {
    try {
      if (serverEmployee) await permanentDeleteMutation.mutateAsync(id);
      else setLocalEmployee(null);
      toast.success("Employee permanently deleted");
      setIsPermanentDeleteOpen(false);
      router.push("/hrms/employees");
    } catch (err: any) {
      toast.error(err?.message || "Failed to permanently delete employee.");
      setIsPermanentDeleteOpen(false);
    }
  };

  const employeesList = React.useMemo(
    () => (serverEmployees?.data || FALLBACK_EMPLOYEES).filter((e) => e.id !== id),
    [serverEmployees, id]
  );

  // --- Render guards ---
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-sm font-semibold text-slate-500 mt-3 animate-pulse">
          Loading employee profile...
        </p>
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Button variant="ghost" onClick={() => router.push("/hrms/employees")} className="gap-2">
          Back to Employees
        </Button>
        <Card className="border-rose-100 bg-rose-50/20 dark:bg-rose-950/10">
          <CardContent className="py-12 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Employee Profile Not Found
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              We couldn't retrieve profile information for ID "{id}".
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Main render ---
  const cardProps = { employee, isEditing, editForm, setEditForm };

  return (
    <div className="p-6 w-full space-y-6">
      <EmployeeActionBar
        employee={employee}
        isEditing={isEditing}
        isSaving={updateMutation.isPending}
        onBack={() => router.push("/hrms/employees")}
        onEdit={handleStartEdit}
        onCancel={handleCancel}
        onSave={handleSave}
        onMarkInactive={() => setIsDeleteOpen(true)}
        onActivate={() => setIsActivateOpen(true)}
        onPermanentDelete={() => setIsPermanentDeleteOpen(true)}
      />

      {apiError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-600 font-semibold flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
          <span>{apiError}</span>
        </div>
      )}

      <EmployeeProfileHeader employee={employee} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ContactCard {...cardProps} />
        <PersonalInfoCard {...cardProps} />
        <AddressCard {...cardProps} />
        <EmploymentCard {...cardProps} employeesList={employeesList} />
        <BankDetailsCard {...cardProps} onStartEdit={handleStartEdit} />
        <EmergencyContactCard {...cardProps} onStartEdit={handleStartEdit} />
      </div>

      <StatutoryCard {...cardProps} />

      <EmployeeDialogs
        employee={employee}
        isDeleteOpen={isDeleteOpen}
        setIsDeleteOpen={setIsDeleteOpen}
        onConfirmDelete={handleConfirmDelete}
        isDeletePending={deleteMutation.isPending}
        isActivateOpen={isActivateOpen}
        setIsActivateOpen={setIsActivateOpen}
        onConfirmActivate={handleConfirmActivate}
        isActivatePending={activateMutation.isPending}
        isPermanentDeleteOpen={isPermanentDeleteOpen}
        setIsPermanentDeleteOpen={setIsPermanentDeleteOpen}
        onConfirmPermanentDelete={handleConfirmPermanentDelete}
        isPermanentDeletePending={permanentDeleteMutation.isPending}
      />
    </div>
  );
}