"use client";

import * as React from "react";
import { EmployeeProfile } from "@/types/hrms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Briefcase, Building, Phone, Mail, Shield, MapPin, CreditCard, User } from "lucide-react";

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
