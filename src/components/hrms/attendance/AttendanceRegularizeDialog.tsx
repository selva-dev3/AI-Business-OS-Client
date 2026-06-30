"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateRegularization } from "@/hooks/queries/hrms/attendance/attendance.hooks";
import { useEmployees } from "@/hooks/queries/hrms/employees/employees.hooks";
import { useAuthStore } from "@/store/authStore";

const regularizeSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  date: z.string().min(1, "Date is required"),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  reason: z.string().min(10, "Reason must be at least 10 characters").max(1000, "Reason too long"),
});

type RegularizeFormValues = z.infer<typeof regularizeSchema>;

interface AttendanceRegularizeDialogProps {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode?: string;
  } | null;
  attendanceRecord?: {
    checkIn?: string;
    checkOut?: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function toLocalDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function AttendanceRegularizeDialog({
  employee,
  attendanceRecord,
  open,
  onOpenChange,
  onSuccess,
}: AttendanceRegularizeDialogProps) {
  const createRegularization = useCreateRegularization();
  const user = useAuthStore((s) => s.user);
  const { data: employeesData } = useEmployees();

  const employeesList = React.useMemo(() => {
    return (employeesData?.employees || employeesData?.data || []) as any[];
  }, [employeesData]);

  const selfEmployee = React.useMemo(() => {
    if (!user?.email || !employeesList.length) return null;
    return employeesList.find((emp) => emp.email?.toLowerCase() === user.email.toLowerCase()) || null;
  }, [user, employeesList]);

  const defaultValues = React.useMemo<RegularizeFormValues>(() => ({
    employeeId: employee?.id || selfEmployee?.id || "",
    date: toLocalDateString(new Date()),
    checkIn: "",
    checkOut: "",
    reason: "",
  }), [employee, selfEmployee]);

  const form = useForm<RegularizeFormValues>({
    resolver: zodResolver(regularizeSchema),
    defaultValues,
  });

  React.useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const watchedEmployeeId = form.watch("employeeId");
  const selectedEmployee = React.useMemo(() => {
    if (employee) return employee;
    return employeesList.find((emp) => emp.id === watchedEmployeeId) || null;
  }, [employee, employeesList, watchedEmployeeId]);

  const employeeName = selectedEmployee
    ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`
    : "employee";

  const handleSubmit = async (values: RegularizeFormValues) => {
    try {
      const checkInISO = values.checkIn
        ? new Date(`${values.date}T${values.checkIn}:00`).toISOString()
        : null;
      const checkOutISO = values.checkOut
        ? new Date(`${values.date}T${values.checkOut}:00`).toISOString()
        : null;

      await createRegularization.mutateAsync({
        employeeId: values.employeeId,
        date: new Date(values.date).toISOString(),
        checkIn: checkInISO,
        checkOut: checkOutISO,
        reason: values.reason,
      });

      toast.success("Regularization request submitted successfully");
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(error?.response?.data?.message || error?.message || "Failed to submit request");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-full bg-white border border-slate-200 rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Attendance Regularization
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Submit a regularization request for {employeeName}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2">
            {employee ? (
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <FormLabel className="text-[10px] font-semibold text-slate-400 uppercase">
                    Employee
                  </FormLabel>
                  <p className="text-sm font-semibold text-slate-800">
                    {employee ? `${employee.firstName} ${employee.lastName}` : "—"}
                  </p>
                </div>
                <div>
                  <FormLabel className="text-[10px] font-semibold text-slate-400 uppercase">
                    Employee ID
                  </FormLabel>
                  <p className="text-sm font-semibold text-slate-800">
                    {employee?.employeeCode || "—"}
                  </p>
                </div>
              </div>
            ) : (
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-semibold text-slate-700">
                      Employee <span className="text-rose-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <select
                        value={field.value}
                        onChange={field.onChange}
                        className="w-full h-9 px-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-hidden"
                        required
                      >
                        <option value="">Select Employee</option>
                        {employeesList.map((emp: any) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
            )}

            {employee && (
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input {...field} type="hidden" />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-semibold text-slate-700">
                    Attendance Date <span className="text-rose-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="date" className="h-9 text-sm" />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {attendanceRecord && (
              <div className="grid grid-cols-2 gap-3 bg-amber-50/40 p-3 rounded-lg border border-amber-100/50">
                <div>
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                    Original Check-In
                  </span>
                  <p className="text-xs font-semibold text-amber-900 mt-0.5">
                    {attendanceRecord.checkIn ? new Date(attendanceRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                    Original Check-Out
                  </span>
                  <p className="text-xs font-semibold text-amber-900 mt-0.5">
                    {attendanceRecord.checkOut ? new Date(attendanceRecord.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="checkIn"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-semibold text-slate-700">
                      Corrected Check-In
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="time" className="h-9 text-sm" />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="checkOut"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-semibold text-slate-700">
                      Corrected Check-Out
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="time" className="h-9 text-sm" />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-semibold text-slate-700">
                    Reason <span className="text-rose-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={3}
                      placeholder="Explain why you need this attendance regularized (min 10 characters)..."
                      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2 border-t border-slate-100 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={createRegularization.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createRegularization.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold min-w-[130px]"
              >
                {createRegularization.isPending && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                )}
                {createRegularization.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
