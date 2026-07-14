"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateEmployee } from "@/hooks/queries/hrms/employees/employees.hooks";
import { useDepartments } from "@/hooks/queries/hrms/departments/departments.hooks";
import { apiGet } from "@/hooks/queries/client";
import { EmployeeProfile } from "@/types/hrms";

interface EditEmployeeModalProps {
  employee: EmployeeProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditEmployeeModal({
  employee,
  open,
  onOpenChange,
  onSuccess,
}: EditEmployeeModalProps) {
  const updateMutation = useUpdateEmployee(employee.id);
  const { data: dbDepartments } = useDepartments();

  const { data: dbDesignations, isLoading: isLoadingDesignations } = useQuery({
    queryKey: ["hrms", "designations", "all"],
    queryFn: () => apiGet<any>("/hrms/designations/all"),
    enabled: open,
  });

  const departments: { id: string; name: string }[] = React.useMemo(() => {
    const list = Array.isArray(dbDepartments) ? dbDepartments : ((dbDepartments as any)?.data || []);
    if (list.length > 0) {
      return list.map((d: any) => ({
        id: d.id || d._id,
        name: d.name,
      }));
    }
    return [
      { id: "dept-1", name: "Engineering" },
      { id: "dept-2", name: "Product & Design" },
      { id: "dept-3", name: "Sales & Marketing" },
      { id: "dept-4", name: "Human Resources" },
      { id: "dept-5", name: "Finance & Legal" },
      { id: "dept-6", name: "Customer Support" },
    ];
  }, [dbDepartments]);

  const designations = React.useMemo(() => {
    return Array.isArray(dbDesignations) ? dbDesignations : ((dbDesignations as any)?.data || []);
  }, [dbDesignations]);

  const managers = [
    { id: "m1", name: "Sarah Jenkins" },
    { id: "m2", name: "Alex Rivera" },
    { id: "m3", name: "Elena Rostova" },
    { id: "m4", name: "Marcus Aurelius" },
  ];

  const [formValues, setFormValues] = React.useState<any>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    employeeCode: "",
    designation: "",
    departmentId: "",
    managerId: "",
    dateOfJoining: "",
    employmentType: "full_time",
    status: "active",
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open && employee) {
      setFormValues({
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        email: employee.email || "",
        phone: employee.phone || "",
        employeeCode: employee.employeeId || employee.employeeCode || "",
        designation: employee.designation || "",
        departmentId: employee.departmentId || employee.department?.id || "",
        managerId: employee.managerId || employee.manager?.id || "",
        dateOfJoining: employee.dateOfJoining ? employee.dateOfJoining.split("T")[0] : employee.joiningDate ? employee.joiningDate.split("T")[0] : "",
        employmentType: employee.employmentType === "Full-Time" ? "full_time" : employee.employmentType === "Part-Time" ? "part_time" : employee.employmentType === "Contract" ? "contract" : employee.employmentType === "Intern" ? "intern" : employee.employmentType || "full_time",
        status: employee.status?.toLowerCase() || "active",
      });
      setErrors({});
      setTouched({});
      setSubmitError("");
    }
  }, [employee, open]);

  const validateField = (name: string, value: any) => {
    let error = "";
    if (name === "employeeCode") {
      const val = (value || "").trim();
      if (val && val.length > 50) {
        error = "Employee code must be at most 50 characters";
      }
    } else if (name === "firstName") {
      const val = (value || "").trim();
      if (!val) {
        error = "First name is required";
      } else if (val.length < 2) {
        error = "First name must be at least 2 characters";
      } else if (!/^[A-Za-z\s]+$/.test(val)) {
        error = "First name must contain only letters and spaces";
      }
    } else if (name === "lastName") {
      const val = (value || "").trim();
      if (!val) {
        error = "Last name is required";
      } else if (val.length < 2) {
        error = "Last name must be at least 2 characters";
      } else if (!/^[A-Za-z\s]+$/.test(val)) {
        error = "Last name must contain only letters and spaces";
      }
    } else if (name === "email") {
      const val = (value || "").trim();
      if (!val) {
        error = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        error = "Invalid email address format";
      }
    } else if (name === "phone") {
      const val = (value || "").trim();
      if (val && !/^\+?[0-9\s\-]{7,15}$/.test(val)) {
        error = "Phone number must be between 7 and 15 digits (spaces/hyphens allowed)";
      }
    } else if (name === "dateOfJoining") {
      if (!value) {
        error = "Date of joining is required";
      } else {
        const selectedDate = new Date(value);
        const maxFutureDate = new Date();
        maxFutureDate.setDate(maxFutureDate.getDate() + 30);
        selectedDate.setHours(0, 0, 0, 0);
        maxFutureDate.setHours(0, 0, 0, 0);
        if (selectedDate > maxFutureDate) {
          error = "Date of joining cannot be more than 30 days in the future";
        }
      }
    }
    return error;
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, formValues[name]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (name: string, value: any) => {
    setFormValues((prev: any) => ({ ...prev, [name]: value }));
    if (touched[name] || errors[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const fields = ["firstName", "lastName", "email", "phone", "dateOfJoining"];
    fields.forEach((field) => {
      const err = validateField(field, formValues[field]);
      if (err) {
        newErrors[field] = err;
      }
    });
    setErrors(newErrors);
    const newTouched: Record<string, boolean> = {};
    fields.forEach((field) => {
      newTouched[field] = true;
    });
    setTouched(newTouched);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) {
      toast.error("Please fill in all required fields and correct validation errors.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData = {
        employeeCode: formValues.employeeCode || undefined,
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        email: formValues.email,
        phone: formValues.phone || undefined,
        designation: formValues.designation || undefined,
        departmentId: formValues.departmentId || undefined,
        managerId: formValues.managerId || undefined,
        dateOfJoining: formValues.dateOfJoining || undefined,
        employmentType: formValues.employmentType,
        status: formValues.status,
      };
      await updateMutation.mutateAsync(updateData);
      toast.success("Employee details updated successfully");
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Employee edit error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "An unexpected error occurred.";
      setSubmitError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white border border-slate-200 rounded-xl p-6 md:p-8">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
            Edit Employee Profile
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400 mt-1">
            Specify designation details, contract limits, and personal parameters.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-6 py-2">
          {submitError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-600 font-semibold">
              {submitError}
            </div>
          )}

          {/* Basic Info Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Basic Info</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">First Name <span className="text-rose-500">*</span></label>
                <Input
                  value={formValues.firstName || ""}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  onBlur={() => handleBlur("firstName")}
                  placeholder="John"
                  className={touched.firstName && errors.firstName ? "border-rose-500 animate-shake" : ""}
                />
                {touched.firstName && errors.firstName && (
                  <span className="text-xs text-rose-500 mt-1 block">{errors.firstName}</span>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Last Name <span className="text-rose-500">*</span></label>
                <Input
                  value={formValues.lastName || ""}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  onBlur={() => handleBlur("lastName")}
                  placeholder="Doe"
                  className={touched.lastName && errors.lastName ? "border-rose-500 animate-shake" : ""}
                />
                {touched.lastName && errors.lastName && (
                  <span className="text-xs text-rose-500 mt-1 block">{errors.lastName}</span>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Email Address <span className="text-rose-500">*</span></label>
                <Input
                  type="email"
                  value={formValues.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  placeholder="john.doe@company.com"
                  className={touched.email && errors.email ? "border-rose-500 animate-shake" : ""}
                />
                {touched.email && errors.email && (
                  <span className="text-xs text-rose-500 mt-1 block">{errors.email}</span>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Phone Number</label>
                <Input
                  value={formValues.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  onBlur={() => handleBlur("phone")}
                  placeholder="+1 (555) 234-5678"
                  className={touched.phone && errors.phone ? "border-rose-500 animate-shake" : ""}
                />
                {touched.phone && errors.phone && (
                  <span className="text-xs text-rose-500 mt-1 block">{errors.phone}</span>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Employee Code</label>
                <Input
                  value={formValues.employeeCode || ""}
                  onChange={(e) => handleChange("employeeCode", e.target.value)}
                  onBlur={() => handleBlur("employeeCode")}
                  placeholder="EMP-0001"
                  className={touched.employeeCode && errors.employeeCode ? "border-rose-500 animate-shake" : ""}
                />
                {touched.employeeCode && errors.employeeCode && (
                  <span className="text-xs text-rose-500 mt-1 block">{errors.employeeCode}</span>
                )}
              </div>
            </div>
          </div>

          {/* Work Details Section */}
          <div className="border-t border-slate-100 pt-4 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Employment Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Designation</label>
                {isLoadingDesignations ? (
                  <div className="text-xs text-slate-400 py-2">Loading designations...</div>
                ) : designations.length === 0 ? (
                  <div className="text-xs text-slate-400 py-2">No designations found</div>
                ) : (
                  <select
                    value={formValues.designation || ""}
                    onChange={(e) => handleChange("designation", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-hidden focus:ring-1 focus:ring-ring text-xs"
                  >
                    <option value="">Select Designation</option>
                    {designations.map((d: any) => (
                      <option key={d.id || d._id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Department</label>
                <select
                  value={formValues.departmentId || ""}
                  onChange={(e) => handleChange("departmentId", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-hidden focus:ring-1 focus:ring-ring text-xs"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Reports To (Manager)</label>
                <select
                  value={formValues.managerId || ""}
                  onChange={(e) => handleChange("managerId", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-hidden focus:ring-1 focus:ring-ring text-xs"
                >
                  <option value="">No Manager</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Employment Type</label>
                <select
                  value={formValues.employmentType || ""}
                  onChange={(e) => handleChange("employmentType", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-hidden focus:ring-1 focus:ring-ring text-xs"
                >
                  <option value="full_time">Full-Time</option>
                  <option value="part_time">Part-Time</option>
                  <option value="contract">Contract</option>
                  <option value="intern">Intern</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Date of Joining <span className="text-rose-500">*</span></label>
                <Input
                  type="date"
                  value={formValues.dateOfJoining || ""}
                  onChange={(e) => handleChange("dateOfJoining", e.target.value)}
                  onBlur={() => handleBlur("dateOfJoining")}
                  className={touched.dateOfJoining && errors.dateOfJoining ? "border-rose-500 animate-shake" : ""}
                />
                {touched.dateOfJoining && errors.dateOfJoining && (
                  <span className="text-xs text-rose-500 mt-1 block">{errors.dateOfJoining}</span>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Status</label>
                <select
                  value={formValues.status || ""}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-hidden focus:ring-1 focus:ring-ring text-xs"
                >
                  <option value="active">Active</option>
                  <option value="on_leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
