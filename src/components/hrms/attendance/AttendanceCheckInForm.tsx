"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
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
import {
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckInFormData } from "@/hooks/queries/hrms/attendance/attendance.types";
import { useEmployees } from "@/hooks/queries/hrms/employees/employees.hooks";

const checkInSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  attendanceDate: z.string().min(1, "Attendance date is required"),
  checkIn: z.string().min(1, "Check-in time is required"),
  attendanceType: z.enum(["PRESENT", "LATE", "HALF_DAY"]),
  shift: z.string().optional(),
  workLocation: z.string().optional(),
  remarks: z.string().optional(),
});

type CheckInFormValues = z.infer<typeof checkInSchema>;

interface AttendanceCheckInFormProps {
  defaultValues: CheckInFormValues;
  employeeName: string;
  employeeCode?: string;
  isSubmitting: boolean;
  onSubmit: (data: CheckInFormData) => Promise<void>;
  onCancel: () => void;
}

export function AttendanceCheckInForm({
  defaultValues,
  employeeName,
  employeeCode,
  isSubmitting,
  onSubmit,
  onCancel,
}: AttendanceCheckInFormProps) {
  const form = useForm<CheckInFormValues>({
    resolver: zodResolver(checkInSchema),
    defaultValues,
  });

  const { data: employeesData } = useEmployees();
  const employeesList = React.useMemo(() => {
    return employeesData?.employees || employeesData?.data || [];
  }, [employeesData]);

  React.useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const handleSubmit = async (values: CheckInFormValues) => {
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2">
        <FormField
          control={form.control}
          name="employeeId"
          render={({ field }) => {
            const selectedEmp = employeesList.find(
              (emp: any) => (emp.id || emp._id) === field.value
            );
            const currentCode = selectedEmp?.employeeId || selectedEmp?.employeeCode || employeeCode || "—";
            return (
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <FormItem className="space-y-1">
                  <FormLabel className="text-[10px] font-bold text-slate-500 uppercase">
                    Select Employee
                  </FormLabel>
                  <FormControl>
                    <select
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                      className="w-full h-8 px-2 text-xs bg-white rounded-md border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 font-semibold"
                    >
                      <option value="">Select Employee</option>
                      {employeesList.map((emp: any) => (
                        <option key={emp.id || emp._id} value={emp.id || emp._id}>
                          {emp.firstName} {emp.lastName}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
                <div>
                  <FormLabel className="text-[10px] font-semibold text-slate-400 uppercase">
                    Employee ID
                  </FormLabel>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{currentCode}</p>
                </div>
              </div>
            );
          }}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="attendanceDate"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-semibold text-slate-700">
                  Attendance Date <span className="text-rose-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="date"
                    className="h-9 text-sm"
                  />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="checkIn"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-semibold text-slate-700">
                  Check-In Time <span className="text-rose-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="time"
                    className="h-9 text-sm"
                  />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="attendanceType"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold text-slate-700">
                Attendance Type <span className="text-rose-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  className="w-full h-9 px-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="PRESENT">Present</option>
                  <option value="LATE">Late</option>
                  <option value="HALF_DAY">Half Day</option>
                </select>
              </FormControl>
              <FormMessage className="text-[11px]" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="shift"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-semibold text-slate-700">
                  Shift
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="e.g. Morning, Evening"
                    className="h-9 text-sm"
                  />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="workLocation"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-semibold text-slate-700">
                  Work Location
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="e.g. Office, Remote"
                    className="h-9 text-sm"
                  />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="remarks"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold text-slate-700">
                Remarks / Notes
              </FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  rows={2}
                  placeholder="Optional remarks..."
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
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold min-w-[100px]"
          >
            {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
            {isSubmitting ? "Checking In..." : "Check In"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
