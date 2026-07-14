"use client";

import * as React from "react";
import { EmployeeProfile } from "@/types/hrms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Briefcase,
  Building,
  Phone,
  Mail,
  Shield,
  MapPin,
  CreditCard,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  History
} from "lucide-react";

const formatDate = (dateStr?: string) => {
  if (!dateStr) return undefined;
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (_) {
    return dateStr;
  }
};

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return undefined;
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (_) {
    return dateStr;
  }
};

export default function OverviewTab({ employee }: { employee: EmployeeProfile }) {
  return (
    <div className="space-y-4">
      {/* Personal Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <User className="h-4 w-4 text-indigo-600" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={employee.email} />
          <InfoRow icon={<Phone className="h-3.5 w-3.5" />} label="Phone" value={employee.phone} />
          <InfoRow icon={<Shield className="h-3.5 w-3.5" />} label="Gender" value={employee.gender} />
          <InfoRow icon={<Shield className="h-3.5 w-3.5" />} label="Blood Group" value={employee.bloodGroup} />
          <InfoRow icon={<Shield className="h-3.5 w-3.5" />} label="Marital Status" value={employee.maritalStatus} />
        </CardContent>
      </Card>

      {/* Employment */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-indigo-600" />
            Employment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow icon={<Briefcase className="h-3.5 w-3.5" />} label="Designation" value={employee.designation} />
          <InfoRow icon={<Building className="h-3.5 w-3.5" />} label="Department" value={employee.department?.name} />
          <InfoRow icon={<Briefcase className="h-3.5 w-3.5" />} label="Employment Type" value={employee.employeeType} />
          <InfoRow
            icon={<Briefcase className="h-3.5 w-3.5" />}
            label="Reports To"
            value={employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : "N/A"}
          />
          <InfoRow
            icon={<Calendar className="h-3.5 w-3.5" />}
            label="Date of Joining"
            value={formatDate(employee.dateOfJoining || employee.joiningDate)}
          />
          {employee.exitDate && (
            <InfoRow
              icon={<Calendar className="h-3.5 w-3.5" />}
              label="Exit Date"
              value={formatDate(employee.exitDate)}
            />
          )}
          <InfoRow
            icon={<Calendar className="h-3.5 w-3.5" />}
            label="Created At"
            value={formatDateTime(employee.createdAt)}
          />
          <InfoRow
            icon={<Calendar className="h-3.5 w-3.5" />}
            label="Updated At"
            value={formatDateTime(employee.updatedAt)}
          />
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-indigo-600" />
            Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow icon={<MapPin className="h-3.5 w-3.5" />} label="Street" value={employee.address} />
          <InfoRow icon={<MapPin className="h-3.5 w-3.5" />} label="City" value={employee.city} />
          <InfoRow icon={<MapPin className="h-3.5 w-3.5" />} label="State" value={employee.state} />
          <InfoRow icon={<MapPin className="h-3.5 w-3.5" />} label="Country" value={employee.country} />
          <InfoRow icon={<MapPin className="h-3.5 w-3.5" />} label="ZIP" value={employee.zipCode} />
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Shield className="h-4 w-4 text-indigo-600" />
            Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow icon={<Phone className="h-3.5 w-3.5" />} label="Name" value={employee.emergencyContact?.name} />
          <InfoRow icon={<Phone className="h-3.5 w-3.5" />} label="Relation" value={employee.emergencyContact?.relation} />
          <InfoRow icon={<Phone className="h-3.5 w-3.5" />} label="Phone" value={employee.emergencyContact?.phone} />
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-indigo-600" />
            Bank Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow icon={<CreditCard className="h-3.5 w-3.5" />} label="Bank" value={employee.bankDetails?.bankName} />
          <InfoRow
            icon={<CreditCard className="h-3.5 w-3.5" />}
            label="Account"
            value={employee.bankDetails?.accountNumber ? `•••• ${employee.bankDetails.accountNumber.slice(-4)}` : undefined}
          />
          <InfoRow icon={<CreditCard className="h-3.5 w-3.5" />} label="IFSC" value={employee.bankDetails?.ifscCode} />
          <InfoRow icon={<CreditCard className="h-3.5 w-3.5" />} label="Type" value={employee.bankDetails?.accountType} />
        </CardContent>
      </Card>

      {/* Role History */}
      {employee.roleHistory && employee.roleHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-indigo-600" />
              Role History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 relative pl-3 border-l-2 border-indigo-100">
              {employee.roleHistory.map((item, idx) => (
                <div key={idx} className="relative pl-4">
                  <span className="absolute -left-[9px] top-1.5 h-3.5 w-3.5 rounded-full bg-indigo-400 border-2 border-white" />
                  <p className="text-xs text-slate-500">
                    {item.changedAt ? new Date(item.changedAt).toLocaleDateString() : "N/A"}
                  </p>
                  <p className="text-sm font-medium text-slate-800">
                    {item.reason || "Role Change"}
                  </p>
                  {item.designation && <p className="text-xs text-slate-600">Designation: {item.designation}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suspension Details */}
      {(employee.suspensionDetails || employee.status?.toLowerCase() === "suspended") && (
        <Card className="border-red-100 bg-red-50/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Active Suspension Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow icon={<AlertTriangle className="h-3.5 w-3.5" />} label="Reason" value={employee.suspensionDetails?.reason || "N/A"} />
            <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="Suspended At" value={formatDateTime(employee.suspensionDetails?.suspendedAt)} />
            <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="Expected Reinstatement" value={formatDate(employee.suspensionDetails?.expectedReinstatement)} />
            {employee.suspensionDetails?.notes && (
              <InfoRow icon={<Shield className="h-3.5 w-3.5" />} label="Notes" value={employee.suspensionDetails.notes} />
            )}
          </CardContent>
        </Card>
      )}

      {/* Suspension History */}
      {employee.suspensionHistory && employee.suspensionHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <History className="h-4 w-4 text-indigo-600" />
              Suspension History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 relative pl-3 border-l-2 border-red-100">
              {employee.suspensionHistory.map((item, idx) => (
                <div key={idx} className="relative pl-4">
                  <span className="absolute -left-[9px] top-1.5 h-3.5 w-3.5 rounded-full bg-red-400 border-2 border-white" />
                  <p className="text-xs text-slate-500">
                    Suspended: {formatDateTime(item.suspendedAt)}
                    {item.reinstatedAt && ` • Reinstated: ${formatDateTime(item.reinstatedAt)}`}
                  </p>
                  <p className="text-sm font-medium text-slate-800">
                    Reason: {item.reason || "Suspension"}
                  </p>
                  {item.expectedReinstatement && (
                    <p className="text-xs text-slate-600">
                      Expected Reinstatement: {formatDate(item.expectedReinstatement)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Termination Details */}
      {(employee.terminationDetails || employee.status?.toLowerCase() === "terminated") && (
        <Card className="border-rose-100 bg-rose-50/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-rose-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              Exit & Offboarding Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="Last Working Date" value={formatDate(employee.terminationDetails?.lastWorkingDate || employee.exitDate)} />
              <InfoRow icon={<AlertTriangle className="h-3.5 w-3.5" />} label="Reason" value={employee.terminationDetails?.reason || "N/A"} />
              {employee.terminationDetails?.reasonDetails && (
                <InfoRow icon={<Shield className="h-3.5 w-3.5" />} label="Details" value={employee.terminationDetails.reasonDetails} />
              )}
              <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="Terminated At" value={formatDateTime(employee.terminationDetails?.terminatedAt)} />
              <InfoRow
                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                label="Notice Period Served"
                value={employee.terminationDetails?.noticePeriodServed ? "Yes" : "No"}
              />
              <InfoRow
                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                label="Final Salary Processed"
                value={employee.terminationDetails?.finalSalaryProcessed ? "Yes" : "No"}
              />
            </div>
            
            {employee.terminationDetails?.exitChecklist && (
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-2">Exit Checklist Status</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { key: "laptopReturned", label: "Laptop Returned" },
                    { key: "accessRevoked", label: "Access Revoked" },
                    { key: "fnfSettled", label: "Full & Final Settlement Done" },
                    { key: "relievingLetterIssued", label: "Relieving Letter Issued" },
                    { key: "exitInterviewDone", label: "Exit Interview Completed" },
                  ].map((item) => {
                    const done = employee.terminationDetails?.exitChecklist?.[item.key as keyof typeof employee.terminationDetails.exitChecklist];
                    return (
                      <div key={item.key} className="flex items-center gap-2 text-xs">
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                        )}
                        <span className={done ? "text-slate-800" : "text-slate-400"}>{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3">
      <span className="text-slate-400">{icon}</span>
      <span className="text-xs font-semibold text-slate-500 w-28 shrink-0">{label}</span>
      <span className="text-sm text-slate-800">{value}</span>
    </div>
  );
}
