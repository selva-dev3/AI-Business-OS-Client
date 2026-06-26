"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Users,
  Briefcase,
  DollarSign,
  ShoppingCart,
  Boxes,
  ArrowRight,
  ArrowDown,
  Globe,
  Sparkles,
  Shield,
  BrainCircuit,
  FileText,
  BarChart3,
  ScrollText,
  Link2,
  Headphones,
  Bot,
  FolderKanban,
  ChevronDown,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Module card data                                                   */
/* ------------------------------------------------------------------ */
const modules = [
  {
    icon: Users,
    name: "HRMS",
    desc: "Employees, attendance, payroll, leave, assets",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: Globe,
    name: "CRM",
    desc: "Leads, deals, pipeline, contacts, activities",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: FileText,
    name: "Finance",
    desc: "Invoices, expenses, budgets, P&L reports",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    icon: Boxes,
    name: "Inventory",
    desc: "Products, warehouses, stock, transfers",
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    icon: ShoppingCart,
    name: "Procurement",
    desc: "Vendors, RFQ, purchase orders, receipts",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    icon: FolderKanban,
    name: "Projects",
    desc: "Tasks, milestones, timesheets, reports",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    icon: Headphones,
    name: "Support",
    desc: "Tickets, SLA, agents, categories",
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
  {
    icon: Bot,
    name: "AI Module",
    desc: "Chat, insights, forecasts, document OCR",
    color: "text-slate-700",
    bg: "bg-slate-100",
  },
];

/* ------------------------------------------------------------------ */
/*  Feature card data                                                  */
/* ------------------------------------------------------------------ */
const features = [
  {
    icon: Shield,
    name: "Role-based access control",
    desc: "Granular permissions per module and action. Assign roles confidently.",
  },
  {
    icon: BrainCircuit,
    name: "AI-powered insights",
    desc: "Ask questions in plain language. Get instant analytics and forecasts.",
  },
  {
    icon: ScrollText,
    name: "REST API — 500+ endpoints",
    desc: "Full API access. Build integrations, automate workflows, connect anything.",
  },
  {
    icon: BarChart3,
    name: "Unified analytics",
    desc: "One dashboard across HRMS, CRM, Finance, and Inventory data.",
  },
  {
    icon: FileText,
    name: "Audit trail",
    desc: "Every action logged. Full compliance and accountability out of the box.",
  },
  {
    icon: Link2,
    name: "Third-party integrations",
    desc: "Connect Slack, Google Workspace, Zapier, and more with one click.",
  },
];

/* ------------------------------------------------------------------ */
/*  Stats data                                                         */
/* ------------------------------------------------------------------ */
const stats = [
  { value: "500+", label: "API endpoints" },
  { value: "15", label: "Modules" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "10k+", label: "Companies" },
];

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */
export default function LandingPage() {
  const [workspace, setWorkspace] = React.useState("");

  return (
    <div className="min-h-screen bg-[#faf9f7] text-slate-900 font-sans flex flex-col">
      {/* ───────────────── NAVBAR ───────────────── */}
      <header className="sticky top-0 z-50 bg-[#faf9f7]/80 backdrop-blur-md border-b border-slate-200/60">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Briefcase className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-[17px] font-bold tracking-tight text-slate-900">
              AI <span className="text-indigo-600">Business</span> OS
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8 text-[14px] font-medium text-slate-600">
            <a href="#modules" className="hover:text-slate-900 transition-colors">Modules</a>
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
            <a href="#docs" className="hover:text-slate-900 transition-colors">Docs</a>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="outline"
                className="h-9 px-5 text-[13px] font-semibold border-slate-300 text-slate-800 bg-white hover:bg-slate-50 rounded-lg"
              >
                Get started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* ───────────────── HERO ───────────────── */}
      <section className="flex-grow flex flex-col items-center pt-16 md:pt-24 pb-8 px-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[13px] font-medium text-indigo-700 mb-8">
          <Sparkles className="h-3.5 w-3.5" />
          500+ APIs — One platform
        </div>

        {/* Heading */}
        <h1 className="text-center text-4xl sm:text-5xl md:text-[56px] font-extrabold leading-[1.1] tracking-tight max-w-3xl">
          Run your entire business{" "}
          <br className="hidden sm:block" />
          with <span className="text-indigo-600">one OS</span>
        </h1>

        {/* Sub */}
        <p className="mt-6 text-center text-[16px] sm:text-[17px] text-slate-500 max-w-xl leading-relaxed font-normal">
          HRMS, CRM, Finance, Inventory, Projects, and Support — unified in a
          single AI-powered platform built for modern teams.
        </p>

        {/* Workspace entry */}
        <div className="mt-10 w-full max-w-md">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase mb-4">
              Enter your workspace
            </p>

            {/* Input row */}
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden h-12 bg-slate-50/50">
              <div className="flex items-center gap-1.5 px-3 text-slate-400 border-r border-slate-200 h-full shrink-0">
                <Globe className="h-4 w-4" />
                <span className="text-[13px] font-medium text-slate-500">app.</span>
              </div>
              <input
                type="text"
                value={workspace}
                onChange={(e) => setWorkspace(e.target.value)}
                placeholder="yourcompany"
                className="flex-1 h-full px-3 text-[14px] bg-transparent outline-none placeholder:text-slate-400 text-slate-800"
              />
              <div className="px-3 text-[13px] font-medium text-slate-500 border-l border-slate-200 h-full flex items-center shrink-0">
                .bizos.com
              </div>
            </div>

            {/* Submit */}
            <Link href="/login" className="block mt-4">
              <Button className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white text-[14px] font-semibold rounded-lg">
                <ArrowRight className="h-4 w-4 mr-2" />
                Continue to workspace
              </Button>
            </Link>

            <p className="text-center text-[13px] text-slate-400 mt-3">
              Don't have a workspace?{" "}
              <Link href="/register" className="text-indigo-600 font-medium hover:underline">
                Start free trial
              </Link>
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="mt-12 flex flex-col items-center text-slate-300">
          <div className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center">
            <ArrowDown className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </section>

      {/* ───────────────── STATS ───────────────── */}
      <section className="py-14 border-t border-slate-200/60">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                {s.value}
              </p>
              <p className="mt-1 text-[13px] text-slate-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────── MODULES ───────────────── */}
      <section id="modules" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Everything you need
            </h2>
            <p className="mt-3 text-[15px] text-slate-500 font-normal">
              From hiring to invoicing — fully integrated
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.name}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:shadow-md hover:border-slate-300 transition-all duration-200"
                >
                  <div className={`h-10 w-10 rounded-xl ${m.bg} flex items-center justify-center mb-4`}>
                    <Icon className={`h-5 w-5 ${m.color}`} />
                  </div>
                  <h3 className="text-[15px] font-bold text-slate-900">{m.name}</h3>
                  <p className="mt-1 text-[13px] text-slate-500 leading-relaxed">{m.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────── FEATURES ───────────────── */}
      <section id="features" className="py-20 px-6 border-t border-slate-200/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Built for serious scale
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.name}>
                  <Icon className="h-6 w-6 text-indigo-600 mb-3" />
                  <h3 className="text-[15px] font-bold text-slate-900">{f.name}</h3>
                  <p className="mt-1.5 text-[14px] text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────── CTA BANNER ───────────────── */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto rounded-2xl bg-indigo-600 py-16 px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to unify your business?
          </h2>
          <p className="mt-3 text-[15px] text-indigo-200 font-normal">
            Join 10,000+ companies running on AI Business OS
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button className="h-11 px-7 bg-white text-indigo-700 hover:bg-indigo-50 text-[14px] font-semibold rounded-lg shadow-sm">
                Enter your workspace
              </Button>
            </Link>
            <Link href="/register">
              <Button
                variant="outline"
                className="h-11 px-7 border-white/30 text-white hover:bg-white/10 text-[14px] font-semibold rounded-lg"
              >
                Book a demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────────── FOOTER ───────────────── */}
      <footer className="border-t border-slate-200/60 py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[14px] font-bold text-slate-900">
            AI <span className="text-indigo-600">Business</span> OS
          </div>
          <div className="flex items-center gap-6 text-[13px] text-slate-500 font-medium">
            <Link href="#" className="hover:text-slate-800 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-slate-800 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-slate-800 transition-colors">Security</Link>
            <Link href="#" className="hover:text-slate-800 transition-colors">Status</Link>
          </div>
          <p className="text-[13px] text-slate-400">
            © {new Date().getFullYear()} AI Business OS
          </p>
        </div>
      </footer>
    </div>
  );
}
