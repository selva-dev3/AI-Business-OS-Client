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
import { DialogFooter } from "@/components/ui/dialog";
import { CheckOutFormData } from "@/hooks/queries/hrms/attendance/attendance.types";

const checkOutSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  date: z.string().min(1, "Date is required"),
  checkOut: z.string().min(1, "Check-out time is required"),
  remarks: z.string().optional(),
});

type CheckOutFormValues = z.infer<typeof checkOutSchema>;

interface AttendanceCheckOutFormProps {
  defaultValues: CheckOutFormValues;
  employeeName: string;
  employeeCode?: string;
  isSubmitting: boolean;
  onSubmit: (data: CheckOutFormData) => Promise<void>;
  onCancel: () => void;
}

export function AttendanceCheckOutForm({
  defaultValues,
  employeeName,
  employeeCode,
  isSubmitting,
  onSubmit,
  onCancel,
}: AttendanceCheckOutFormProps) {
  const form = useForm<CheckOutFormValues>({
    resolver: zodResolver(checkOutSchema),
    defaultValues,
  });

  React.useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const handleSubmit = async (values: CheckOutFormValues) => {
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2">
        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div>
            <FormLabel className="text-[10px] font-semibold text-slate-400 uppercase">
              Employee
            </FormLabel>
            <p className="text-sm font-semibold text-slate-800">{employeeName || "—"}</p>
          </div>
          <div>
            <FormLabel className="text-[10px] font-semibold text-slate-400 uppercase">
              Employee ID
            </FormLabel>
            <p className="text-sm font-semibold text-slate-800">{employeeCode || "—"}</p>
          </div>
        </div>

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

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold text-slate-700">
                Date <span className="text-rose-500">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} type="date" className="h-9 text-sm" />
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
                Check-Out Time <span className="text-rose-500">*</span>
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
          <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold min-w-[110px]"
          >
            {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
            {isSubmitting ? "Checking Out..." : "Check Out"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
