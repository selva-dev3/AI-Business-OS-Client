import React from "react";
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
import { cn } from "@/lib/utils";

interface ApproveRejectConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "approve" | "reject" | null;
  comments: string;
  onCommentsChange: (comments: string) => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export const ApproveRejectConfirmDialog: React.FC<ApproveRejectConfirmDialogProps> = ({
  open,
  onOpenChange,
  type,
  comments,
  onCommentsChange,
  onConfirm,
  isLoading = false,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border border-slate-200 rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            {type === "approve" ? "Approve Regularization Request" : "Reject Regularization Request"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            {type === "approve"
              ? "Are you sure you want to approve this request? You can optionally provide approval comments below."
              : "Are you sure you want to reject this request? Rejection comments are required."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5 py-3">
          <label className="text-xs font-semibold text-slate-600">
            Comments {type === "reject" && <span className="text-rose-500">*</span>}
          </label>
          <Input
            placeholder={type === "approve" ? "Optional comments..." : "Reason for rejection..."}
            value={comments}
            onChange={(e) => onCommentsChange(e.target.value)}
            required={type === "reject"}
            disabled={isLoading}
          />
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={(type === "reject" && !comments.trim()) || isLoading}
            className={cn(
              "text-white",
              type === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
            )}
          >
            {isLoading ? "Processing..." : type === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};