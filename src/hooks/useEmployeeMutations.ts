import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { employeesApi } from "@/hooks/queries/hrms/employees/employees.api";
import { employeesKeys } from "@/hooks/queries/hrms/employees/employees.keys";
import {
  SuspendEmployeeData,
  ReinstateEmployeeData,
  TerminateEmployeeData,
  AssignRoleData,
  ResetPasswordData,
  CreateDocumentData,
  CreateNoteData,
  UpdateNoteData,
  InitiateLeaveData,
} from "@/hooks/queries/hrms/employees/employees.types";

function withToast<T>(
  mutationFn: (vars: T) => Promise<unknown>,
  successMsg: string | ((data: any) => string),
  invalidateKeys?: string[][]
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (data, vars) => {
      const msg = typeof successMsg === "function" ? successMsg(data) : successMsg;
      toast.success(msg);
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => qc.invalidateQueries({ queryKey: key }));
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "An error occurred");
    },
  });
}

// ─── SUSPEND / REINSTATE ─────────────────────────────────────────────────────

export function useSuspendEmployee() {
  return withToast(
    ({ id, data }: { id: string; data: SuspendEmployeeData }) => employeesApi.suspend(id, data),
    "Employee suspended successfully",
    [employeesKeys.all as unknown as string[]]
  );
}

export function useReinstateEmployee() {
  return withToast(
    ({ id, data }: { id: string; data: ReinstateEmployeeData }) => employeesApi.reinstate(id, data),
    "Employee reinstated successfully",
    [employeesKeys.all as unknown as string[]]
  );
}

// ─── TERMINATE ───────────────────────────────────────────────────────────────

export function useTerminateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TerminateEmployeeData }) => employeesApi.terminate(id, data),
    onSuccess: (_, { id }) => {
      toast.success("Employee terminated successfully");
      qc.invalidateQueries({ queryKey: employeesKeys.detail(id) });
      qc.invalidateQueries({ queryKey: employeesKeys.all });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to terminate employee");
    },
  });
}

// ─── INITIATE LEAVE ───────────────────────────────────────────────────────────

export function useInitiateLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: InitiateLeaveData }) => employeesApi.initiateLeave(id, data),
    onSuccess: (_, { id }) => {
      toast.success("Leave initiated successfully");
      qc.invalidateQueries({ queryKey: ["leaves", id] });
      qc.invalidateQueries({ queryKey: employeesKeys.detail(id) });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to initiate leave");
    },
  });
}

// ─── ASSIGN ROLE ─────────────────────────────────────────────────────────────

export function useAssignRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignRoleData }) => employeesApi.assignRole(id, data),
    onSuccess: (_, { id }) => {
      toast.success("Role assigned successfully");
      qc.invalidateQueries({ queryKey: employeesKeys.detail(id) });
      qc.invalidateQueries({ queryKey: employeesKeys.all });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to assign role");
    },
  });
}

// ─── RESET PASSWORD ──────────────────────────────────────────────────────────

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResetPasswordData }) => employeesApi.resetPassword(id, data),
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to reset password");
    },
  });
}

// ─── DOCUMENTS ───────────────────────────────────────────────────────────────

export function useCreateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateDocumentData }) => employeesApi.createDocument(id, data),
    onSuccess: (_, { id }) => {
      toast.success("Document uploaded successfully");
      qc.invalidateQueries({ queryKey: ["documents", id] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to upload document");
    },
  });
}

// ─── NOTES ───────────────────────────────────────────────────────────────────

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateNoteData }) => employeesApi.createNote(id, data),
    onSuccess: (_, { id }) => {
      toast.success("Note added successfully");
      qc.invalidateQueries({ queryKey: ["notes", id] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to add note");
    },
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, noteId, data }: { id: string; noteId: string; data: UpdateNoteData }) =>
      employeesApi.updateNote(id, noteId, data),
    onSuccess: (_, { id }) => {
      toast.success("Note updated successfully");
      qc.invalidateQueries({ queryKey: ["notes", id] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update note");
    },
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, noteId }: { id: string; noteId: string }) => employeesApi.deleteNote(id, noteId),
    onSuccess: (_, { id }) => {
      toast.success("Note deleted successfully");
      qc.invalidateQueries({ queryKey: ["notes", id] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to delete note");
    },
  });
}
