"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  FileText, Folder, Plus, Search, File, HardDrive, Upload,
  MoreVertical, Edit2, Trash2, Eye, Download, Users, Lock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockFolders = [
  { id: "f-1", name: "Procurement Receipts", fileCount: 18, size: "24.5 MB", visibility: "private" },
  { id: "f-2", name: "HRMS Employees Contracts", fileCount: 8, size: "12.8 MB", visibility: "private" },
  { id: "f-3", name: "Support Ticket Assets", fileCount: 14, size: "45.1 MB", visibility: "shared" },
  { id: "f-4", name: "Finance Invoices PDF", fileCount: 32, size: "115.0 MB", visibility: "private" },
];

const mockFiles = [
  { id: "doc-1", name: "invoice_2026_q2_draft.pdf", folderId: "f-4", folderName: "Finance Invoices PDF", size: "1.2 MB", type: "pdf", modifiedAt: "2026-06-27", owner: "Selva Dev" },
  { id: "doc-2", name: "employment_agreement_john.docx", folderId: "f-2", folderName: "HRMS Employees Contracts", size: "420 KB", type: "docx", modifiedAt: "2026-06-26", owner: "HR Manager" },
  { id: "doc-3", name: "db_timeout_trace_logs.txt", folderId: "f-3", folderName: "Support Ticket Assets", size: "8.4 MB", type: "txt", modifiedAt: "2026-06-27", owner: "Dev Team Lead" },
  { id: "doc-4", name: "stripe_payment_receipt_821.pdf", folderId: "f-1", folderName: "Procurement Receipts", size: "95 KB", type: "pdf", modifiedAt: "2026-06-25", owner: "Finance Controller" },
  { id: "doc-5", name: "server_dockerfile_backup.zip", folderId: "f-3", folderName: "Support Ticket Assets", size: "32.1 MB", type: "zip", modifiedAt: "2026-06-24", owner: "Dev Team Lead" },
];

export default function DocumentsPage() {
  const [folders, setFolders] = React.useState(mockFolders);
  const [files, setFiles] = React.useState(mockFiles);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [folderFilter, setFolderFilter] = React.useState("all");
  const [isFolderFormOpen, setIsFolderFormOpen] = React.useState(false);
  const [isFileFormOpen, setIsFileFormOpen] = React.useState(false);

  // Folder form
  const [folderForm, setFolderForm] = React.useState({ name: "", visibility: "private" });
  // File form
  const [fileForm, setFileForm] = React.useState({ name: "", folderId: "", size: "100 KB" });

  const filteredFiles = React.useMemo(() => {
    return files.filter((f) => {
      const ms = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.owner.toLowerCase().includes(searchTerm.toLowerCase());
      const mff = folderFilter === "all" ? true : f.folderId === folderFilter;
      return ms && mff;
    });
  }, [files, searchTerm, folderFilter]);

  const metrics = React.useMemo(() => {
    const totalSize = "197.4 MB";
    return { totalFolders: folders.length, totalFiles: files.length, totalSize };
  }, [folders, files]);

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderForm.name) { toast.error("Folder name is required."); return; }
    const newFolder = {
      id: `f-${Date.now()}`,
      name: folderForm.name,
      visibility: folderForm.visibility,
      fileCount: 0,
      size: "0 KB",
    };
    setFolders((p) => [...p, newFolder]);
    toast.success("Folder created.");
    setIsFolderFormOpen(false);
  };

  const handleUploadFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileForm.name || !fileForm.folderId) { toast.error("File name and destination folder are required."); return; }
    const folder = folders.find((fd) => fd.id === fileForm.folderId);
    const newFile = {
      id: `doc-${Date.now()}`,
      name: fileForm.name,
      folderId: fileForm.folderId,
      folderName: folder?.name || "",
      size: fileForm.size,
      type: fileForm.name.split(".").pop() || "bin",
      modifiedAt: new Date().toISOString().split("T")[0],
      owner: "Selva Dev",
    };
    setFiles((p) => [newFile, ...p]);
    // update folder file counts
    setFolders((prev) => prev.map((f) => f.id === fileForm.folderId ? { ...f, fileCount: f.fileCount + 1 } : f));
    toast.success("Document uploaded.");
    setIsFileFormOpen(false);
  };

  const deleteFile = (id: string, folderId: string) => {
    setFiles((p) => p.filter((f) => f.id !== id));
    setFolders((prev) => prev.map((f) => f.id === folderId ? { ...f, fileCount: Math.max(0, f.fileCount - 1) } : f));
    toast.success("File deleted.");
  };

  const fileIcon = (type: string) => {
    if (type === "pdf") return <FileText className="h-4 w-4 text-rose-500" />;
    if (type === "docx") return <FileText className="h-4 w-4 text-blue-500" />;
    if (type === "zip") return <File className="h-4 w-4 text-amber-500" />;
    return <File className="h-4 w-4 text-slate-400" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Document Manager</h1>
          <p className="mt-1 text-[14px] text-slate-500">Store, classify, and share business reports, contracts, and attachment assets.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsFolderFormOpen(true)} className="border-slate-200 bg-white">
            <Plus className="mr-2 h-4 w-4" />New Folder
          </Button>
          <Button onClick={() => setIsFileFormOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">
            <Upload className="mr-2 h-4 w-4" />Upload Document
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Folders", value: metrics.totalFolders, desc: "Created folders directories" },
          { label: "Total Files", value: metrics.totalFiles, desc: "SaaS document attachments" },
          { label: "Used Storage", value: metrics.totalSize, desc: "of 5 GB enterprise allowance" },
        ].map((k, idx) => (
          <Card key={idx} className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-[13px] font-medium text-slate-500">{k.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-extrabold text-slate-900">{k.value}</p>
              <p className="text-[11px] text-slate-400 mt-1">{k.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Folders Directories Row */}
      <div className="space-y-3">
        <h2 className="text-[15px] font-bold text-slate-800">Folders Directories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {folders.map((fd) => (
            <Card key={fd.id} className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-all group relative">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                    <Folder className="h-5 w-5 text-indigo-600" />
                  </div>
                  <span className="text-slate-400">
                    {fd.visibility === "private" ? <Lock className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
                  </span>
                </div>
                <div>
                  <h3 className="text-[13.5px] font-bold text-slate-800 truncate">{fd.name}</h3>
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-semibold">
                    <span>{fd.fileCount} items</span>
                    <span>{fd.size}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Filter file layout */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Search document name or owner..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-slate-200 bg-slate-50/50 focus:bg-white" />
          </div>
          <Select value={folderFilter} onValueChange={setFolderFilter}>
            <SelectTrigger className="w-48 bg-white border-slate-200"><SelectValue placeholder="Folder filter" /></SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="all">All Folders</SelectItem>
              {folders.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Files list table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Folder Directory</th>
                  <th className="py-3 px-4">File Size</th>
                  <th className="py-3 px-4">Last Modified</th>
                  <th className="py-3 px-4">Uploaded By</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-slate-400 font-medium">No documents found.</td></tr>
                ) : filteredFiles.map((file) => (
                  <tr key={file.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        {fileIcon(file.type)} {file.name}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[12.5px] text-slate-600">{file.folderName}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">{file.size}</td>
                    <td className="py-3.5 px-4 text-slate-550">{file.modifiedAt}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{file.owner}</td>
                    <td className="py-3.5 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border-slate-200">
                          <DropdownMenuItem onClick={() => toast.success(`Downloading ${file.name}`)}><Download className="mr-2 h-3.5 w-3.5" />Download</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteFile(file.id, file.folderId)} className="text-rose-600"><Trash2 className="mr-2 h-3.5 w-3.5" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Folder Modal */}
      <Dialog open={isFolderFormOpen} onOpenChange={setIsFolderFormOpen}>
        <DialogContent className="max-w-sm bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">New Folder</DialogTitle>
            <DialogDescription>Create a storage directory for files.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateFolder} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-slate-600">Folder Name *</Label>
              <Input value={folderForm.name} onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })} placeholder="e.g. HRMS Invoices" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-slate-600">Visibility</Label>
              <Select value={folderForm.visibility} onValueChange={(val: string) => setFolderForm({ ...folderForm, visibility: val })}>
                <SelectTrigger className="bg-white border-slate-200"><SelectValue placeholder="Visibility" /></SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="private">Private (Restricted)</SelectItem>
                  <SelectItem value="shared">Shared (Team access)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="border-t border-slate-100 pt-3.5">
              <Button type="button" variant="outline" onClick={() => setIsFolderFormOpen(false)} className="border-slate-200">Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">Create Folder</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload File Modal */}
      <Dialog open={isFileFormOpen} onOpenChange={setIsFileFormOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Upload Document</DialogTitle>
            <DialogDescription>Simulate uploading a document to a specific folder directory.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUploadFile} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-slate-600">File Name *</Label>
              <Input value={fileForm.name} onChange={(e) => setFileForm({ ...fileForm, name: e.target.value })} placeholder="e.g. schema_design.pdf" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">Destination Folder *</Label>
                <Select value={fileForm.folderId} onValueChange={(val: string) => setFileForm({ ...fileForm, folderId: val })}>
                  <SelectTrigger className="bg-white border-slate-200"><SelectValue placeholder="Select folder" /></SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {folders.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">Mock Size</Label>
                <Input value={fileForm.size} onChange={(e) => setFileForm({ ...fileForm, size: e.target.value })} placeholder="1.2 MB" />
              </div>
            </div>
            <DialogFooter className="border-t border-slate-100 pt-3.5">
              <Button type="button" variant="outline" onClick={() => setIsFileFormOpen(false)} className="border-slate-200">Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">Upload</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
