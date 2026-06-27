"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Settings, Building2, User, Key, Bell, Shield, Cloud, CreditCard,
  CheckCircle2, RefreshCw, AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState("general");

  const [companyForm, setCompanyForm] = React.useState({
    orgName: "AI Business OS Inc.",
    domain: "aibusinessos.io",
    currency: "USD",
    timezone: "America/New_York",
  });

  const [profileForm, setProfileForm] = React.useState({
    fullName: "Selva Dev",
    email: "selva.dev3@gmail.com",
    role: "Administrator",
  });

  const [notifications, setNotifications] = React.useState({
    emailAlerts: true,
    slackWebhook: true,
    weeklyDigest: false,
    slaBreach: true,
  });

  const [integrations, setIntegrations] = React.useState([
    { id: "stripe", name: "Stripe Payment Gateway", status: "connected", logoColor: "text-indigo-500" },
    { id: "slack", name: "Slack Workspaces Notifications", status: "connected", logoColor: "text-rose-500" },
    { id: "mailgun", name: "Mailgun Transactional Email Router", status: "connected", logoColor: "text-red-500" },
    { id: "github", name: "GitHub Repository Sync", status: "disconnected", logoColor: "text-slate-900" },
  ]);

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Organization settings updated successfully.");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile details updated.");
  };

  const toggleIntegration = (id: string) => {
    setIntegrations((prev) => prev.map((integ) => {
      if (integ.id === id) {
        const nextStatus = integ.status === "connected" ? "disconnected" : "connected";
        toast.success(`${integ.name} → ${nextStatus.toUpperCase()}`);
        return { ...integ, status: nextStatus };
      }
      return integ;
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
          <Settings className="h-6 w-6 text-slate-700" /> Platform Settings
        </h1>
        <p className="mt-1 text-[14px] text-slate-500">Configure global configurations, default routes, team profile, and external service credentials.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Side Tab Navigation */}
        <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-1.5 overflow-x-auto pb-2 md:pb-0">
          {[
            { id: "general", label: "Organization Settings", icon: Building2 },
            { id: "profile", label: "User Profile", icon: User },
            { id: "notifications", label: "Alerts & Notifications", icon: Bell },
            { id: "integrations", label: "Third-party Integrations", icon: Cloud },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-2 text-[12.5px] font-bold rounded-xl whitespace-nowrap transition-colors text-left w-full ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 bg-slate-50/50 hover:bg-slate-50 border border-transparent hover:border-slate-100"
              }`}
            >
              <tab.icon className="h-4 w-4 shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Side Content Panel */}
        <div className="flex-1">
          {activeTab === "general" && (
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px] font-bold text-slate-900">Organization Settings</CardTitle>
                <CardDescription className="text-[12px] text-slate-400">Configure public business metadata and default localized formats.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 border-t border-slate-150">
                <form onSubmit={handleSaveCompany} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[12px] font-semibold text-slate-600">Company Name</Label>
                      <Input value={companyForm.orgName} onChange={(e) => setCompanyForm({ ...companyForm, orgName: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[12px] font-semibold text-slate-600">Domain Domain</Label>
                      <Input value={companyForm.domain} onChange={(e) => setCompanyForm({ ...companyForm, domain: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[12px] font-semibold text-slate-600">Standard Currency</Label>
                      <Select value={companyForm.currency} onValueChange={(val: string) => setCompanyForm({ ...companyForm, currency: val })}>
                        <SelectTrigger className="bg-white border-slate-200"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-white border-slate-200">
                          <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                          <SelectItem value="INR">INR (₹) - Indian Rupee</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[12px] font-semibold text-slate-600">Default Timezone</Label>
                      <Select value={companyForm.timezone} onValueChange={(val: string) => setCompanyForm({ ...companyForm, timezone: val })}>
                        <SelectTrigger className="bg-white border-slate-200"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-white border-slate-200">
                          <SelectItem value="America/New_York">Eastern Standard (EST)</SelectItem>
                          <SelectItem value="Europe/London">Greenwich Mean (GMT)</SelectItem>
                          <SelectItem value="Asia/Kolkata">India Standard (IST)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">Save Changes</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "profile" && (
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px] font-bold text-slate-900">User Profile Settings</CardTitle>
                <CardDescription className="text-[12px] text-slate-400">Modify credentials and display attributes.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 border-t border-slate-150">
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[12px] font-semibold text-slate-600">Full Name</Label>
                      <Input value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[12px] font-semibold text-slate-600">Email Address</Label>
                      <Input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[12px] font-semibold text-slate-600">Role Designation</Label>
                      <Input value={profileForm.role} disabled className="bg-slate-50 cursor-not-allowed border-slate-200" />
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">Save Changes</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px] font-bold text-slate-900">Alerts & Notifications</CardTitle>
                <CardDescription className="text-[12px] text-slate-400">Select channels for system notifications dispatch.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 border-t border-slate-150 space-y-4">
                {[
                  { id: "emailAlerts", title: "Email Intake Alerts", desc: "Send summary notifications when new support tickets arrive.", state: notifications.emailAlerts },
                  { id: "slackWebhook", title: "Slack Channel Integration", desc: "Relay automated messages for milestone deadlines directly to Slack.", state: notifications.slackWebhook },
                  { id: "weeklyDigest", title: "Weekly Analytics Digest", desc: "Format and send financial inflow reports weekly.", state: notifications.weeklyDigest },
                  { id: "slaBreach", title: "SLA Urgent Reminders", desc: "Trigger sound alerts and notices for near-deadline tickets.", state: notifications.slaBreach },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div className="space-y-0.5 max-w-md">
                      <span className="text-[13px] font-bold text-slate-800 block">{item.title}</span>
                      <span className="text-[11.5px] text-slate-400 leading-normal block">{item.desc}</span>
                    </div>
                    <Switch
                      checked={item.state}
                      onCheckedChange={(c) => {
                        setNotifications((p) => ({ ...p, [item.id]: c }));
                        toast.success(`${item.title} status changed.`);
                      }}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === "integrations" && (
            <div className="grid grid-cols-1 gap-4">
              {integrations.map((item) => (
                <Card key={item.id} className="border-slate-200 bg-white shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center">
                        <Cloud className={`h-5 w-5 ${item.logoColor}`} />
                      </div>
                      <div>
                        <h3 className="text-[13.5px] font-bold text-slate-800">{item.name}</h3>
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold mt-0.5 ${
                          item.status === "connected" ? "text-emerald-600" : "text-slate-400"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${item.status === "connected" ? "bg-emerald-500" : "bg-slate-300"}`} />
                          {item.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant={item.status === "connected" ? "outline" : "default"}
                      size="sm"
                      onClick={() => toggleIntegration(item.id)}
                      className={item.status === "connected" ? "border-slate-200" : "bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"}
                    >
                      {item.status === "connected" ? "Disconnect" : "Connect"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
