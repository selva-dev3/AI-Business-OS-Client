"use client";

import * as React from "react";
import { useDocuments } from "@/hooks/useEmployeeTabData";
import { useCreateDocument } from "@/hooks/useEmployeeMutations";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  FileText,
  AlertTriangle,
  RefreshCw,
  Upload,
  Download,
  Lock,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmployeeDocumentItem } from "@/types/hrms";
import { toast } from "sonner";

const DOC_TYPES = ["OFFER_LETTER", "CONTRACT", "ID_PROOF", "ADDRESS_PROOF", "DEGREE", "PAYSLIP", "OTHER"];

export default function DocumentsTab({ employeeId }: { employeeId: string }) {
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [uploadOpen, setUploadOpen] = React.useState(false);

  const { data, isLoading, isError, error, refetch } = useDocuments(
    employeeId,
    { type: typeFilter !== "all" ? typeFilter : undefined },
    true
  );

  const createMutation = useCreateDocument();

  const records: EmployeeDocumentItem[] = data?.data ?? [];

  // Upload form state
  const [docType, setDocType] = React.useState("");
  const [docName, setDocName] = React.useState("");
  const [fileUrl, setFileUrl] = React.useState("");
  const [expiryDate, setExpiryDate] = React.useState("");
  const [isConfidential, setIsConfidential] = React.useState(false);

  const resetForm = () => {
    setDocType(""); setDocName(""); setFileUrl(""); setExpiryDate(""); setIsConfidential(false);
  };

  const handleUpload = async () => {
    if (!docType || !docName) {
      toast.error("Document type and name are required");
      return;
    }
    try {
      await createMutation.mutateAsync({
        id: employeeId,
        data: {
          documentType: docType,
          documentName: docName,
          fileUrl: fileUrl || undefined,
          expiryDate: expiryDate || undefined,
          isConfidential,
        },
      });
      setUploadOpen(false);
      resetForm();
    } catch {
      // error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center space-y-4">
        <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto" />
        <p className="text-sm text-slate-500">{(error as any)?.message || "Failed to load documents"}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-1">
      {/* Header + Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {DOC_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Upload className="h-4 w-4" /> Upload
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOC_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Document Name</Label>
                <Input value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="e.g. Signed Offer Letter" />
              </div>
              <div className="space-y-2">
                <Label>File URL</Label>
                <Input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Expiry Date (optional)</Label>
                <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={isConfidential} onCheckedChange={setIsConfidential} id="confidential" />
                <Label htmlFor="confidential">Confidential document</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setUploadOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      {records.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <FileText className="h-10 w-10 mx-auto mb-2" />
          <p className="text-sm font-medium">No documents found</p>
          <Button variant="link" size="sm" onClick={() => setUploadOpen(true)}>
            Upload the first document
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Confidential</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="flex items-center gap-2 font-medium text-xs">
                    <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                    <span className="truncate max-w-[200px]">{doc.documentName}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{doc.documentType}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-xs">
                    {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell>
                    {doc.isConfidential ? (
                      <Lock className="h-4 w-4 text-amber-500" />
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      <Download className="h-3 w-3" /> View
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
