"use client";

import * as React from "react";
import { useDocuments } from "@/hooks/useEmployeeTabData";
import { useCreateDocument } from "@/hooks/useEmployeeMutations";
import { auth } from "@/lib/auth";
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

const DOC_TYPES = ["OFFER_LETTER", "ID_PROOF", "CERTIFICATE", "CONTRACT", "NDA", "PAYSLIP", "OTHER"] as const;

const DOC_TYPE_LABELS: Record<string, string> = {
  OFFER_LETTER: "Offer Letter",
  ID_PROOF: "ID Proof",
  CERTIFICATE: "Certificate",
  CONTRACT: "Contract",
  NDA: "NDA",
  PAYSLIP: "Payslip",
  OTHER: "Other",
};

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
  
  // File upload state and ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [useUrl, setUseUrl] = React.useState(false);

  const resetForm = () => {
    setDocType("");
    setDocName("");
    setFileUrl("");
    setExpiryDate("");
    setIsConfidential(false);
    setSelectedFile(null);
    setUseUrl(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!docType || !docName) {
      toast.error("Document type and name are required");
      return;
    }
    if (!useUrl && !selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }
    if (useUrl && !fileUrl) {
      toast.error("Please enter a valid file URL");
      return;
    }

    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("documentType", docType);
        formData.append("documentName", docName);
        if (expiryDate) formData.append("expiryDate", expiryDate);
        formData.append("isConfidential", String(isConfidential));

        await createMutation.mutateAsync({
          id: employeeId,
          data: formData,
        });
      } else {
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
      }
      setUploadOpen(false);
      resetForm();
    } catch {
      // error handled by mutation
    }
  };

  const getFileUrl = (doc: EmployeeDocumentItem) => {
    const url = doc.fileUrl;
    if (!url) return "#";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const token = auth.getAccessToken();
    return `${baseUrl}/hrms/employees/${employeeId}/documents/${doc.id || (doc as any)._id}/download?token=${token || ""}`;
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
              <SelectItem key={t} value={t}>{DOC_TYPE_LABELS[t] ?? t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={uploadOpen} onOpenChange={(open) => { setUploadOpen(open); if (!open) resetForm(); }}>
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
                      <SelectItem key={t} value={t}>{DOC_TYPE_LABELS[t] ?? t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Document Name</Label>
                <Input value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="e.g. Signed Offer Letter" />
              </div>

              {!useUrl ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>File Upload</Label>
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0 text-xs text-indigo-600"
                      onClick={() => setUseUrl(true)}
                    >
                      Use File URL instead
                    </Button>
                  </div>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors duration-200",
                      selectedFile
                        ? "border-emerald-500 bg-emerald-50/30"
                        : "border-slate-200 hover:border-indigo-400 bg-slate-50/50"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                          if (!docName) {
                            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                            setDocName(baseName);
                          }
                        }
                      }}
                    />
                    {selectedFile ? (
                      <div className="space-y-1">
                        <FileText className="h-8 w-8 text-emerald-500 mx-auto mb-1" />
                        <p className="text-xs font-semibold text-emerald-700 truncate max-w-[280px] mx-auto">
                          {selectedFile.name}
                        </p>
                        <p className="text-[10px] text-emerald-600">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="text-[10px] text-rose-500 font-medium hover:underline mt-2 block mx-auto"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="h-7 w-7 text-slate-400 mx-auto mb-1" />
                        <p className="text-xs text-slate-600">
                          <span className="font-semibold text-indigo-600 hover:underline">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-[9px] text-slate-400">PDF, PNG, JPG, SVG, DOC, DOCX, XLSX, CSV (max 50MB)</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>File URL</Label>
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0 text-xs text-indigo-600"
                      onClick={() => setUseUrl(false)}
                    >
                      Upload local file instead
                    </Button>
                  </div>
                  <Input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://..." />
                </div>
              )}

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
                      href={getFileUrl(doc)}
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
